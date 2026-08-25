"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { defaultSheetFor } from "@/lib/actors/sheet";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { actors, campaigns, locations, notes, type Campaign } from "@/lib/db/schema";

async function ownedCampaign(
  userId: string,
  campaignId: string,
): Promise<Campaign | null> {
  const db = getDb();
  const [c] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.ownerId, userId)))
    .limit(1);
  return c ?? null;
}

/** Cria um NPC rápido com ficha padrão do template. */
export async function quickAddNpc(
  campaignId: string,
  name: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  const camp = await ownedCampaign(user.id, campaignId);
  if (!camp || !name.trim()) return;

  await db.insert(actors).values({
    campaignId,
    ownerId: user.id,
    kind: "npc",
    name: name.trim(),
    sheet: defaultSheetFor(camp.systemSnapshot),
  });
  revalidatePath(`/campaigns/${campaignId}/live`);
  revalidatePath(`/campaigns/${campaignId}/actors`);
}

/** Cria uma localização raiz rápida. */
export async function quickAddLocation(
  campaignId: string,
  name: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  const camp = await ownedCampaign(user.id, campaignId);
  if (!camp || !name.trim()) return;

  await db.insert(locations).values({
    campaignId,
    ownerId: user.id,
    name: name.trim(),
  });
  revalidatePath(`/campaigns/${campaignId}/live`);
  revalidatePath(`/campaigns/${campaignId}/locations`);
}

/** Cria uma nota rápida. */
export async function quickAddNote(
  campaignId: string,
  body: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  const camp = await ownedCampaign(user.id, campaignId);
  if (!camp || !body.trim()) return;

  await db.insert(notes).values({
    campaignId,
    ownerId: user.id,
    body: body.trim(),
  });
  revalidatePath(`/campaigns/${campaignId}/live`);
  revalidatePath(`/campaigns/${campaignId}/notes`);
}
