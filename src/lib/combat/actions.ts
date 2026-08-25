"use server";

import { and, asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { coerceSheet } from "@/lib/actors/sheet";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  actors,
  campaigns,
  combatants,
  encounters,
  type Combatant,
  type Encounter,
  type NewCombatant,
} from "@/lib/db/schema";
import { evaluate } from "@/lib/dice/roll";
import {
  ENCOUNTER_STATUSES,
  type EncounterFormState,
  type EncounterStatusValue,
} from "./constants";
import { actorRollVars, combatStats } from "./derive";

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

function parseStatus(v: FormDataEntryValue | null): EncounterStatusValue {
  const s = typeof v === "string" ? v : "";
  return (ENCOUNTER_STATUSES as readonly string[]).includes(s)
    ? (s as EncounterStatusValue)
    : "planned";
}

function encPath(campaignId: string, encounterId: string): string {
  return `/campaigns/${campaignId}/encounters/${encounterId}`;
}

async function ownsCampaign(userId: string, campaignId: string): Promise<boolean> {
  const db = getDb();
  const [c] = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.ownerId, userId)))
    .limit(1);
  return Boolean(c);
}

// --------------------------- Encontros ---------------------------

export async function listEncounters(campaignId: string): Promise<Encounter[]> {
  const user = await requireUser();
  const db = getDb();
  return db
    .select()
    .from(encounters)
    .where(
      and(
        eq(encounters.campaignId, campaignId),
        eq(encounters.ownerId, user.id),
      ),
    )
    .orderBy(desc(encounters.createdAt));
}

export async function getEncounter(
  campaignId: string,
  encounterId: string,
): Promise<Encounter | null> {
  const user = await requireUser();
  const db = getDb();
  const [row] = await db
    .select()
    .from(encounters)
    .where(
      and(
        eq(encounters.id, encounterId),
        eq(encounters.campaignId, campaignId),
        eq(encounters.ownerId, user.id),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function createEncounter(
  _prev: EncounterFormState,
  formData: FormData,
): Promise<EncounterFormState> {
  const user = await requireUser();
  const db = getDb();

  const campaignId = String(formData.get("campaignId") ?? "");
  if (!(await ownsCampaign(user.id, campaignId)))
    return { error: "Campanha inválida." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Dê um nome ao encontro." };

  const [row] = await db
    .insert(encounters)
    .values({
      campaignId,
      ownerId: user.id,
      name,
      status: parseStatus(formData.get("status")),
      notes: emptyToNull(formData.get("notes")),
    })
    .returning({ id: encounters.id });

  revalidatePath(`/campaigns/${campaignId}/encounters`);
  redirect(`/campaigns/${campaignId}/encounters/${row.id}`);
}

export async function updateEncounter(
  _prev: EncounterFormState,
  formData: FormData,
): Promise<EncounterFormState> {
  const user = await requireUser();
  const db = getDb();

  const id = String(formData.get("id") ?? "");
  const campaignId = String(formData.get("campaignId") ?? "");
  if (!id || !(await ownsCampaign(user.id, campaignId)))
    return { error: "Encontro inválido." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Dê um nome ao encontro." };

  await db
    .update(encounters)
    .set({
      name,
      status: parseStatus(formData.get("status")),
      notes: emptyToNull(formData.get("notes")),
      updatedAt: new Date(),
    })
    .where(and(eq(encounters.id, id), eq(encounters.ownerId, user.id)));

  revalidatePath(encPath(campaignId, id));
  redirect(encPath(campaignId, id));
}

export async function deleteEncounter(
  campaignId: string,
  encounterId: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  await db
    .delete(encounters)
    .where(and(eq(encounters.id, encounterId), eq(encounters.ownerId, user.id)));
  revalidatePath(`/campaigns/${campaignId}/encounters`);
  redirect(`/campaigns/${campaignId}/encounters`);
}

// --------------------------- Combatentes ---------------------------

export async function listCombatants(
  encounterId: string,
): Promise<Combatant[]> {
  const user = await requireUser();
  const db = getDb();
  return db
    .select()
    .from(combatants)
    .where(
      and(
        eq(combatants.encounterId, encounterId),
        eq(combatants.ownerId, user.id),
      ),
    )
    .orderBy(desc(combatants.initiative), asc(combatants.createdAt));
}

export async function addCombatantFromActor(
  encounterId: string,
  actorId: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();

  const enc = await getEncounterRow(user.id, encounterId);
  if (!enc) return;

  const [camp] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, enc.campaignId), eq(campaigns.ownerId, user.id)))
    .limit(1);
  if (!camp) return;

  const [actor] = await db
    .select()
    .from(actors)
    .where(
      and(
        eq(actors.id, actorId),
        eq(actors.campaignId, enc.campaignId),
        eq(actors.ownerId, user.id),
      ),
    )
    .limit(1);
  if (!actor) return;

  const template = camp.systemSnapshot;
  const sheet = coerceSheet(actor.sheet, template);
  const vars = actorRollVars(template, sheet);
  const formula = template.combat?.initiative;
  const initiative = formula ? Math.round(evaluate(formula, vars).total) : 0;
  const stats = combatStats(template, sheet);

  await db.insert(combatants).values({
    encounterId,
    campaignId: enc.campaignId,
    ownerId: user.id,
    actorId: actor.id,
    name: actor.name,
    initiative,
    hpCurrent: stats.hpCurrent,
    hpMax: stats.hpMax,
    defense: stats.defense,
    isPc: actor.kind === "pc",
  });

  revalidatePath(encPath(enc.campaignId, encounterId));
}

export async function addManualCombatant(
  encounterId: string,
  name: string,
  initiative: number,
  hpMax: number | null,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();

  const enc = await getEncounterRow(user.id, encounterId);
  if (!enc) return;

  const trimmed = name.trim();
  if (!trimmed) return;

  await db.insert(combatants).values({
    encounterId,
    campaignId: enc.campaignId,
    ownerId: user.id,
    name: trimmed,
    initiative: Math.round(initiative) || 0,
    hpCurrent: hpMax ?? null,
    hpMax: hpMax ?? null,
  });

  revalidatePath(encPath(enc.campaignId, encounterId));
}

export async function updateCombatant(
  combatantId: string,
  patch: {
    name?: string;
    initiative?: number;
    hpCurrent?: number | null;
    hpMax?: number | null;
    defense?: number | null;
  },
): Promise<void> {
  const user = await requireUser();
  const db = getDb();

  const c = await loadCombatant(user.id, combatantId);
  if (!c) return;

  const set: Partial<NewCombatant> = { updatedAt: new Date() };
  if (patch.name !== undefined) set.name = patch.name.trim() || c.name;
  if (patch.initiative !== undefined) set.initiative = Math.round(patch.initiative);
  if (patch.hpCurrent !== undefined)
    set.hpCurrent =
      patch.hpCurrent === null ? null : Math.max(0, Math.round(patch.hpCurrent));
  if (patch.hpMax !== undefined)
    set.hpMax = patch.hpMax === null ? null : Math.round(patch.hpMax);
  if (patch.defense !== undefined)
    set.defense = patch.defense === null ? null : Math.round(patch.defense);

  await db.update(combatants).set(set).where(eq(combatants.id, combatantId));
  revalidatePath(encPath(c.campaignId, c.encounterId));
}

export async function toggleCondition(
  combatantId: string,
  condition: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();

  const c = await loadCombatant(user.id, combatantId);
  if (!c) return;

  const current = c.conditions ?? [];
  const next = current.includes(condition)
    ? current.filter((x) => x !== condition)
    : [...current, condition];

  await db
    .update(combatants)
    .set({ conditions: next, updatedAt: new Date() })
    .where(eq(combatants.id, combatantId));
  revalidatePath(encPath(c.campaignId, c.encounterId));
}

export async function removeCombatant(combatantId: string): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  const c = await loadCombatant(user.id, combatantId);
  if (!c) return;
  await db.delete(combatants).where(eq(combatants.id, combatantId));
  revalidatePath(encPath(c.campaignId, c.encounterId));
}

// --------------------------- Turnos ---------------------------

export async function nextTurn(encounterId: string): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  const enc = await getEncounterRow(user.id, encounterId);
  if (!enc) return;

  const list = await listCombatants(encounterId);
  if (list.length === 0) return;

  const idx = list.findIndex((c) => c.id === enc.activeCombatantId);
  let nextIdx = idx + 1;
  let round = enc.round;
  if (idx === -1) {
    nextIdx = 0;
  } else if (nextIdx >= list.length) {
    nextIdx = 0;
    round = enc.round + 1;
  }

  await db
    .update(encounters)
    .set({
      activeCombatantId: list[nextIdx].id,
      round,
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(encounters.id, encounterId));
  revalidatePath(encPath(enc.campaignId, encounterId));
}

export async function resetEncounter(encounterId: string): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  const enc = await getEncounterRow(user.id, encounterId);
  if (!enc) return;

  const list = await listCombatants(encounterId);

  await db
    .update(encounters)
    .set({
      round: 1,
      activeCombatantId: list[0]?.id ?? null,
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(encounters.id, encounterId));
  revalidatePath(encPath(enc.campaignId, encounterId));
}

export async function rollAllInitiative(encounterId: string): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  const enc = await getEncounterRow(user.id, encounterId);
  if (!enc) return;

  const [camp] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, enc.campaignId), eq(campaigns.ownerId, user.id)))
    .limit(1);
  if (!camp) return;

  const template = camp.systemSnapshot;
  const formula = template.combat?.initiative ?? "1d20";
  const list = await listCombatants(encounterId);

  for (const c of list) {
    let vars: Record<string, number> = {};
    if (c.actorId) {
      const [actor] = await db
        .select()
        .from(actors)
        .where(and(eq(actors.id, c.actorId), eq(actors.ownerId, user.id)))
        .limit(1);
      if (actor) vars = actorRollVars(template, coerceSheet(actor.sheet, template));
    }
    const initiative = Math.round(evaluate(formula, vars).total);
    await db
      .update(combatants)
      .set({ initiative, updatedAt: new Date() })
      .where(eq(combatants.id, c.id));
  }

  revalidatePath(encPath(enc.campaignId, encounterId));
}

// --------------------------- helpers ---------------------------

async function getEncounterRow(
  userId: string,
  encounterId: string,
): Promise<Encounter | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(encounters)
    .where(and(eq(encounters.id, encounterId), eq(encounters.ownerId, userId)))
    .limit(1);
  return row ?? null;
}

async function loadCombatant(
  userId: string,
  combatantId: string,
): Promise<Combatant | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(combatants)
    .where(and(eq(combatants.id, combatantId), eq(combatants.ownerId, userId)))
    .limit(1);
  return row ?? null;
}
