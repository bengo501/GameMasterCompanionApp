"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { campaigns, type Campaign } from "@/lib/db/schema";
import { getBuiltinTemplate } from "@/lib/templates";
import {
  CAMPAIGN_STATUSES,
  type CampaignFormState,
  type CampaignStatusValue,
} from "./constants";

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

function parseStatus(v: FormDataEntryValue | null): CampaignStatusValue {
  const s = typeof v === "string" ? v : "";
  return (CAMPAIGN_STATUSES as readonly string[]).includes(s)
    ? (s as CampaignStatusValue)
    : "planning";
}

export async function listCampaigns(): Promise<Campaign[]> {
  const user = await requireUser();
  const db = getDb();
  return db
    .select()
    .from(campaigns)
    .where(eq(campaigns.ownerId, user.id))
    .orderBy(desc(campaigns.updatedAt));
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const user = await requireUser();
  const db = getDb();
  const rows = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.ownerId, user.id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createCampaign(
  _prev: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const user = await requireUser();
  const db = getDb();

  const name = String(formData.get("name") ?? "").trim();
  const systemKey = String(formData.get("systemKey") ?? "");
  if (!name) return { error: "Dê um nome à campanha." };

  const template = getBuiltinTemplate(systemKey);
  if (!template) return { error: "Selecione um sistema válido." };

  const [row] = await db
    .insert(campaigns)
    .values({
      ownerId: user.id,
      name,
      systemKey,
      systemSnapshot: template,
      description: emptyToNull(formData.get("description")),
      tone: emptyToNull(formData.get("tone")),
      genre: emptyToNull(formData.get("genre")),
      setting: emptyToNull(formData.get("setting")),
      status: parseStatus(formData.get("status")),
    })
    .returning({ id: campaigns.id });

  revalidatePath("/campaigns");
  redirect(`/campaigns/${row.id}`);
}

export async function updateCampaign(
  _prev: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const user = await requireUser();
  const db = getDb();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { error: "Campanha inválida." };
  if (!name) return { error: "Dê um nome à campanha." };

  await db
    .update(campaigns)
    .set({
      name,
      description: emptyToNull(formData.get("description")),
      tone: emptyToNull(formData.get("tone")),
      genre: emptyToNull(formData.get("genre")),
      setting: emptyToNull(formData.get("setting")),
      status: parseStatus(formData.get("status")),
      updatedAt: new Date(),
    })
    .where(and(eq(campaigns.id, id), eq(campaigns.ownerId, user.id)));

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${id}`);
  redirect(`/campaigns/${id}`);
}

export async function deleteCampaign(id: string): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  await db
    .delete(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.ownerId, user.id)));
  revalidatePath("/campaigns");
  redirect("/campaigns");
}
