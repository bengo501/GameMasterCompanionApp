"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { campaigns, sessions, type GameSession } from "@/lib/db/schema";
import {
  SESSION_STATUSES,
  type SessionFormState,
  type SessionStatusValue,
} from "./constants";

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

function parseStatus(v: FormDataEntryValue | null): SessionStatusValue {
  const s = typeof v === "string" ? v : "";
  return (SESSION_STATUSES as readonly string[]).includes(s)
    ? (s as SessionStatusValue)
    : "planned";
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

export async function listSessions(campaignId: string): Promise<GameSession[]> {
  const user = await requireUser();
  const db = getDb();
  return db
    .select()
    .from(sessions)
    .where(
      and(eq(sessions.campaignId, campaignId), eq(sessions.ownerId, user.id)),
    )
    .orderBy(desc(sessions.createdAt));
}

export async function getSession(
  campaignId: string,
  sessionId: string,
): Promise<GameSession | null> {
  const user = await requireUser();
  const db = getDb();
  const [row] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.campaignId, campaignId),
        eq(sessions.ownerId, user.id),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function createSession(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const user = await requireUser();
  const db = getDb();

  const campaignId = String(formData.get("campaignId") ?? "");
  if (!(await ownsCampaign(user.id, campaignId)))
    return { error: "Campanha inválida." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Dê um título à sessão." };

  const [row] = await db
    .insert(sessions)
    .values({
      campaignId,
      ownerId: user.id,
      title,
      sessionDate: emptyToNull(formData.get("sessionDate")),
      status: parseStatus(formData.get("status")),
      plannedSummary: emptyToNull(formData.get("plannedSummary")),
      actualSummary: emptyToNull(formData.get("actualSummary")),
      gmNotes: emptyToNull(formData.get("gmNotes")),
    })
    .returning({ id: sessions.id });

  revalidatePath(`/campaigns/${campaignId}/sessions`);
  redirect(`/campaigns/${campaignId}/sessions/${row.id}`);
}

export async function updateSession(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const user = await requireUser();
  const db = getDb();

  const id = String(formData.get("id") ?? "");
  const campaignId = String(formData.get("campaignId") ?? "");
  if (!id || !(await ownsCampaign(user.id, campaignId)))
    return { error: "Sessão inválida." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Dê um título à sessão." };

  await db
    .update(sessions)
    .set({
      title,
      sessionDate: emptyToNull(formData.get("sessionDate")),
      status: parseStatus(formData.get("status")),
      plannedSummary: emptyToNull(formData.get("plannedSummary")),
      actualSummary: emptyToNull(formData.get("actualSummary")),
      gmNotes: emptyToNull(formData.get("gmNotes")),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(sessions.id, id),
        eq(sessions.campaignId, campaignId),
        eq(sessions.ownerId, user.id),
      ),
    );

  revalidatePath(`/campaigns/${campaignId}/sessions`);
  revalidatePath(`/campaigns/${campaignId}/sessions/${id}`);
  redirect(`/campaigns/${campaignId}/sessions/${id}`);
}

export async function deleteSession(
  campaignId: string,
  sessionId: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  await db
    .delete(sessions)
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.campaignId, campaignId),
        eq(sessions.ownerId, user.id),
      ),
    );
  revalidatePath(`/campaigns/${campaignId}/sessions`);
  redirect(`/campaigns/${campaignId}/sessions`);
}

/** Define o status de uma sessão (usado no modo ao vivo: iniciar/encerrar). */
export async function setSessionStatus(
  sessionId: string,
  status: SessionStatusValue,
): Promise<void> {
  if (!(SESSION_STATUSES as readonly string[]).includes(status)) return;
  const user = await requireUser();
  const db = getDb();
  const [s] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.ownerId, user.id)))
    .limit(1);
  if (!s) return;
  await db
    .update(sessions)
    .set({ status, updatedAt: new Date() })
    .where(eq(sessions.id, sessionId));
  revalidatePath(`/campaigns/${s.campaignId}/live`);
  revalidatePath(`/campaigns/${s.campaignId}/sessions/${sessionId}`);
}
