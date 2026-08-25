"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { campaigns, locations, type Location } from "@/lib/db/schema";
import type { LocationFormState } from "./constants";

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
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

export async function listLocations(campaignId: string): Promise<Location[]> {
  const user = await requireUser();
  const db = getDb();
  return db
    .select()
    .from(locations)
    .where(
      and(
        eq(locations.campaignId, campaignId),
        eq(locations.ownerId, user.id),
      ),
    )
    .orderBy(asc(locations.name));
}

export async function getLocation(
  campaignId: string,
  locationId: string,
): Promise<Location | null> {
  const user = await requireUser();
  const db = getDb();
  const [row] = await db
    .select()
    .from(locations)
    .where(
      and(
        eq(locations.id, locationId),
        eq(locations.campaignId, campaignId),
        eq(locations.ownerId, user.id),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function createLocation(
  _prev: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const user = await requireUser();
  const db = getDb();

  const campaignId = String(formData.get("campaignId") ?? "");
  if (!(await ownsCampaign(user.id, campaignId)))
    return { error: "Campanha inválida." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Dê um nome à localização." };

  const parentId = emptyToNull(formData.get("parentId"));

  const [row] = await db
    .insert(locations)
    .values({
      campaignId,
      ownerId: user.id,
      name,
      type: emptyToNull(formData.get("type")),
      description: emptyToNull(formData.get("description")),
      parentId,
    })
    .returning({ id: locations.id });

  revalidatePath(`/campaigns/${campaignId}/locations`);
  redirect(`/campaigns/${campaignId}/locations`);
  void row;
}

export async function updateLocation(
  _prev: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const user = await requireUser();
  const db = getDb();

  const id = String(formData.get("id") ?? "");
  const campaignId = String(formData.get("campaignId") ?? "");
  if (!id || !(await ownsCampaign(user.id, campaignId)))
    return { error: "Localização inválida." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Dê um nome à localização." };

  // Evita que a localização seja pai de si mesma.
  let parentId = emptyToNull(formData.get("parentId"));
  if (parentId === id) parentId = null;

  await db
    .update(locations)
    .set({
      name,
      type: emptyToNull(formData.get("type")),
      description: emptyToNull(formData.get("description")),
      parentId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(locations.id, id),
        eq(locations.campaignId, campaignId),
        eq(locations.ownerId, user.id),
      ),
    );

  revalidatePath(`/campaigns/${campaignId}/locations`);
  redirect(`/campaigns/${campaignId}/locations`);
}

export async function deleteLocation(
  campaignId: string,
  locationId: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  // Os filhos têm parent_id colocado como null automaticamente (ON DELETE SET NULL).
  await db
    .delete(locations)
    .where(
      and(
        eq(locations.id, locationId),
        eq(locations.campaignId, campaignId),
        eq(locations.ownerId, user.id),
      ),
    );
  revalidatePath(`/campaigns/${campaignId}/locations`);
  redirect(`/campaigns/${campaignId}/locations`);
}
