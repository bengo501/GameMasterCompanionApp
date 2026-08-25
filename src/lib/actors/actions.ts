"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { actors, campaigns, type Actor } from "@/lib/db/schema";
import {
  ACTOR_KINDS,
  ACTOR_NARRATIVE_FIELDS,
  type ActorFormState,
  type ActorKindValue,
} from "./constants";
import { parseSheetFromForm } from "./sheet";

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

function parseKind(v: FormDataEntryValue | null): ActorKindValue {
  const s = typeof v === "string" ? v : "";
  return (ACTOR_KINDS as readonly string[]).includes(s)
    ? (s as ActorKindValue)
    : "npc";
}

function buildData(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const key of ACTOR_NARRATIVE_FIELDS) {
    const v = emptyToNull(formData.get(key));
    if (v) data[key] = v;
  }
  return data;
}

async function ownedCampaign(userId: string, campaignId: string) {
  const db = getDb();
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.ownerId, userId)))
    .limit(1);
  return campaign ?? null;
}

export async function listActors(campaignId: string): Promise<Actor[]> {
  const user = await requireUser();
  const db = getDb();
  return db
    .select()
    .from(actors)
    .where(and(eq(actors.campaignId, campaignId), eq(actors.ownerId, user.id)))
    .orderBy(asc(actors.name));
}

export async function getActor(
  campaignId: string,
  actorId: string,
): Promise<Actor | null> {
  const user = await requireUser();
  const db = getDb();
  const [row] = await db
    .select()
    .from(actors)
    .where(
      and(
        eq(actors.id, actorId),
        eq(actors.campaignId, campaignId),
        eq(actors.ownerId, user.id),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function createActor(
  _prev: ActorFormState,
  formData: FormData,
): Promise<ActorFormState> {
  const user = await requireUser();
  const db = getDb();

  const campaignId = String(formData.get("campaignId") ?? "");
  const campaign = await ownedCampaign(user.id, campaignId);
  if (!campaign) return { error: "Campanha inválida." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Dê um nome ao personagem." };

  const sheet = parseSheetFromForm(campaign.systemSnapshot, formData);

  const [row] = await db
    .insert(actors)
    .values({
      campaignId,
      ownerId: user.id,
      kind: parseKind(formData.get("kind")),
      name,
      concept: emptyToNull(formData.get("concept")),
      playerName: emptyToNull(formData.get("playerName")),
      description: emptyToNull(formData.get("description")),
      notes: emptyToNull(formData.get("notes")),
      sheet,
      data: buildData(formData),
    })
    .returning({ id: actors.id });

  revalidatePath(`/campaigns/${campaignId}/actors`);
  redirect(`/campaigns/${campaignId}/actors/${row.id}`);
}

export async function updateActor(
  _prev: ActorFormState,
  formData: FormData,
): Promise<ActorFormState> {
  const user = await requireUser();
  const db = getDb();

  const id = String(formData.get("id") ?? "");
  const campaignId = String(formData.get("campaignId") ?? "");
  const campaign = await ownedCampaign(user.id, campaignId);
  if (!campaign || !id) return { error: "Personagem inválido." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Dê um nome ao personagem." };

  const sheet = parseSheetFromForm(campaign.systemSnapshot, formData);

  await db
    .update(actors)
    .set({
      kind: parseKind(formData.get("kind")),
      name,
      concept: emptyToNull(formData.get("concept")),
      playerName: emptyToNull(formData.get("playerName")),
      description: emptyToNull(formData.get("description")),
      notes: emptyToNull(formData.get("notes")),
      sheet,
      data: buildData(formData),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(actors.id, id),
        eq(actors.campaignId, campaignId),
        eq(actors.ownerId, user.id),
      ),
    );

  revalidatePath(`/campaigns/${campaignId}/actors`);
  revalidatePath(`/campaigns/${campaignId}/actors/${id}`);
  redirect(`/campaigns/${campaignId}/actors/${id}`);
}

export async function deleteActor(
  campaignId: string,
  actorId: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  await db
    .delete(actors)
    .where(
      and(
        eq(actors.id, actorId),
        eq(actors.campaignId, campaignId),
        eq(actors.ownerId, user.id),
      ),
    );
  revalidatePath(`/campaigns/${campaignId}/actors`);
  redirect(`/campaigns/${campaignId}/actors`);
}
