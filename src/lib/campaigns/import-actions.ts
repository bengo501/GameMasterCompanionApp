"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  actors,
  campaigns,
  combatants,
  encounters,
  locations,
  notes,
  scenes,
  sessions,
} from "@/lib/db/schema";
import { parseTemplate } from "@/lib/templates";
import { CAMPAIGN_STATUSES } from "./constants";
import { SESSION_STATUSES } from "@/lib/sessions/constants";
import { SCENE_STATUSES } from "@/lib/scenes/constants";
import { ENCOUNTER_STATUSES } from "@/lib/combat/constants";
import { EXPORT_FORMAT } from "./transfer";

export type ImportState = { error?: string } | undefined;

/* eslint-disable @typescript-eslint/no-explicit-any */
function arr(x: unknown): any[] {
  return Array.isArray(x) ? x : [];
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

function pick<T extends string>(
  allowed: readonly string[],
  v: unknown,
  fallback: T,
): T {
  return typeof v === "string" && allowed.includes(v) ? (v as T) : fallback;
}

export async function importCampaign(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const user = await requireUser();
  const db = getDb();

  const raw = String(formData.get("payload") ?? "");
  if (!raw.trim()) return { error: "Cole o JSON ou envie um arquivo." };

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    return { error: "JSON inválido." };
  }

  if (data?.format !== EXPORT_FORMAT || !data.campaign) {
    return { error: "Arquivo não é uma campanha do OpenMaster-NarratorHelper." };
  }

  const tpl = parseTemplate(data.campaign.systemSnapshot);
  if (!tpl.success) {
    return { error: "Template do sistema inválido no arquivo." };
  }

  const c = data.campaign;
  const [newCamp] = await db
    .insert(campaigns)
    .values({
      ownerId: user.id,
      name: str(c.name) ?? "Campanha importada",
      systemKey: str(c.systemKey) ?? tpl.data.id,
      systemSnapshot: tpl.data,
      description: str(c.description),
      tone: str(c.tone),
      genre: str(c.genre),
      status: pick(CAMPAIGN_STATUSES, c.status, "planning"),
      setting: str(c.setting),
      data: c.data ?? {},
    })
    .returning({ id: campaigns.id });
  const campaignId = newCamp.id;

  // Atores
  const actorMap = new Map<string, string>();
  for (const a of arr(data.actors)) {
    const [row] = await db
      .insert(actors)
      .values({
        campaignId,
        ownerId: user.id,
        kind: a.kind === "pc" ? "pc" : "npc",
        name: str(a.name) ?? "Sem nome",
        concept: str(a.concept),
        playerName: str(a.playerName),
        description: str(a.description),
        notes: str(a.notes),
        sheet: a.sheet ?? { attributes: {}, resources: {} },
        data: a.data ?? {},
      })
      .returning({ id: actors.id });
    if (a.id) actorMap.set(a.id, row.id);
  }

  // Locais (dois passos para resolver o pai)
  const locMap = new Map<string, string>();
  for (const l of arr(data.locations)) {
    const [row] = await db
      .insert(locations)
      .values({
        campaignId,
        ownerId: user.id,
        name: str(l.name) ?? "Sem nome",
        type: str(l.type),
        description: str(l.description),
        data: l.data ?? {},
      })
      .returning({ id: locations.id });
    if (l.id) locMap.set(l.id, row.id);
  }
  for (const l of arr(data.locations)) {
    if (l.id && l.parentId && locMap.has(l.id) && locMap.has(l.parentId)) {
      await db
        .update(locations)
        .set({ parentId: locMap.get(l.parentId)! })
        .where(eq(locations.id, locMap.get(l.id)!));
    }
  }

  // Sessões
  const sessionMap = new Map<string, string>();
  for (const s of arr(data.sessions)) {
    const [row] = await db
      .insert(sessions)
      .values({
        campaignId,
        ownerId: user.id,
        title: str(s.title) ?? "Sessão",
        sessionDate: str(s.sessionDate),
        status: pick(SESSION_STATUSES, s.status, "planned"),
        plannedSummary: str(s.plannedSummary),
        actualSummary: str(s.actualSummary),
        gmNotes: str(s.gmNotes),
        data: s.data ?? {},
      })
      .returning({ id: sessions.id });
    if (s.id) sessionMap.set(s.id, row.id);
  }

  // Cenas
  for (const sc of arr(data.scenes)) {
    const newSessionId = sc.sessionId ? sessionMap.get(sc.sessionId) : undefined;
    if (!newSessionId) continue;
    await db.insert(scenes).values({
      sessionId: newSessionId,
      campaignId,
      ownerId: user.id,
      title: str(sc.title) ?? "Cena",
      summary: str(sc.summary),
      status: pick(SCENE_STATUSES, sc.status, "planned"),
      order: typeof sc.order === "number" ? sc.order : 0,
      data: sc.data ?? {},
    });
  }

  // Notas
  for (const n of arr(data.notes)) {
    await db.insert(notes).values({
      campaignId,
      ownerId: user.id,
      title: str(n.title),
      body: typeof n.body === "string" ? n.body : "",
      pinned: Boolean(n.pinned),
      data: n.data ?? {},
    });
  }

  // Encontros
  const encMap = new Map<string, string>();
  for (const e of arr(data.encounters)) {
    const [row] = await db
      .insert(encounters)
      .values({
        campaignId,
        ownerId: user.id,
        name: str(e.name) ?? "Encontro",
        status: pick(ENCOUNTER_STATUSES, e.status, "planned"),
        round: typeof e.round === "number" ? e.round : 1,
        notes: str(e.notes),
        data: e.data ?? {},
      })
      .returning({ id: encounters.id });
    if (e.id) encMap.set(e.id, row.id);
  }

  // Combatentes
  const combatantMap = new Map<string, string>();
  for (const cb of arr(data.combatants)) {
    const newEnc = cb.encounterId ? encMap.get(cb.encounterId) : undefined;
    if (!newEnc) continue;
    const [row] = await db
      .insert(combatants)
      .values({
        encounterId: newEnc,
        campaignId,
        ownerId: user.id,
        actorId:
          cb.actorId && actorMap.has(cb.actorId)
            ? actorMap.get(cb.actorId)!
            : null,
        name: str(cb.name) ?? "Combatente",
        initiative: typeof cb.initiative === "number" ? cb.initiative : 0,
        hpCurrent: typeof cb.hpCurrent === "number" ? cb.hpCurrent : null,
        hpMax: typeof cb.hpMax === "number" ? cb.hpMax : null,
        defense: typeof cb.defense === "number" ? cb.defense : null,
        conditions: Array.isArray(cb.conditions) ? cb.conditions : [],
        isPc: Boolean(cb.isPc),
        data: cb.data ?? {},
      })
      .returning({ id: combatants.id });
    if (cb.id) combatantMap.set(cb.id, row.id);
  }

  // Remapeia o combatente ativo de cada encontro
  for (const e of arr(data.encounters)) {
    if (
      e.id &&
      e.activeCombatantId &&
      encMap.has(e.id) &&
      combatantMap.has(e.activeCombatantId)
    ) {
      await db
        .update(encounters)
        .set({ activeCombatantId: combatantMap.get(e.activeCombatantId)! })
        .where(eq(encounters.id, encMap.get(e.id)!));
    }
  }

  revalidatePath("/campaigns");
  redirect(`/campaigns/${campaignId}`);
}
