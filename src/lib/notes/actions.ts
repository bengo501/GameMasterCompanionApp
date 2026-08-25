"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { campaigns, notes, type Note } from "@/lib/db/schema";
import type { NoteFormState } from "./constants";

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

export async function listNotes(campaignId: string): Promise<Note[]> {
  const user = await requireUser();
  const db = getDb();
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.campaignId, campaignId), eq(notes.ownerId, user.id)))
    .orderBy(desc(notes.pinned), desc(notes.updatedAt));
}

export async function getNote(
  campaignId: string,
  noteId: string,
): Promise<Note | null> {
  const user = await requireUser();
  const db = getDb();
  const [row] = await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.id, noteId),
        eq(notes.campaignId, campaignId),
        eq(notes.ownerId, user.id),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function createNote(
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const user = await requireUser();
  const db = getDb();

  const campaignId = String(formData.get("campaignId") ?? "");
  if (!(await ownsCampaign(user.id, campaignId)))
    return { error: "Campanha inválida." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Escreva algo na nota." };

  await db.insert(notes).values({
    campaignId,
    ownerId: user.id,
    title: emptyToNull(formData.get("title")),
    body,
    pinned: formData.get("pinned") === "true",
  });

  revalidatePath(`/campaigns/${campaignId}/notes`);
  redirect(`/campaigns/${campaignId}/notes`);
}

export async function updateNote(
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const user = await requireUser();
  const db = getDb();

  const id = String(formData.get("id") ?? "");
  const campaignId = String(formData.get("campaignId") ?? "");
  if (!id || !(await ownsCampaign(user.id, campaignId)))
    return { error: "Nota inválida." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Escreva algo na nota." };

  await db
    .update(notes)
    .set({
      title: emptyToNull(formData.get("title")),
      body,
      pinned: formData.get("pinned") === "true",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(notes.id, id),
        eq(notes.campaignId, campaignId),
        eq(notes.ownerId, user.id),
      ),
    );

  revalidatePath(`/campaigns/${campaignId}/notes`);
  redirect(`/campaigns/${campaignId}/notes`);
}

export async function deleteNote(
  campaignId: string,
  noteId: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  await db
    .delete(notes)
    .where(
      and(
        eq(notes.id, noteId),
        eq(notes.campaignId, campaignId),
        eq(notes.ownerId, user.id),
      ),
    );
  revalidatePath(`/campaigns/${campaignId}/notes`);
  redirect(`/campaigns/${campaignId}/notes`);
}
