"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { scenes, sessions, type Scene } from "@/lib/db/schema";
import { SCENE_STATUSES, type SceneStatusValue } from "./constants";

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

function parseStatus(v: FormDataEntryValue | null): SceneStatusValue {
  const s = typeof v === "string" ? v : "";
  return (SCENE_STATUSES as readonly string[]).includes(s)
    ? (s as SceneStatusValue)
    : "planned";
}

function parseOrder(v: FormDataEntryValue | null): number {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

async function ownsSession(
  userId: string,
  campaignId: string,
  sessionId: string,
): Promise<boolean> {
  const db = getDb();
  const [s] = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.campaignId, campaignId),
        eq(sessions.ownerId, userId),
      ),
    )
    .limit(1);
  return Boolean(s);
}

export async function listScenes(sessionId: string): Promise<Scene[]> {
  const user = await requireUser();
  const db = getDb();
  return db
    .select()
    .from(scenes)
    .where(and(eq(scenes.sessionId, sessionId), eq(scenes.ownerId, user.id)))
    .orderBy(asc(scenes.order), asc(scenes.createdAt));
}

export async function getScene(
  sessionId: string,
  sceneId: string,
): Promise<Scene | null> {
  const user = await requireUser();
  const db = getDb();
  const [row] = await db
    .select()
    .from(scenes)
    .where(
      and(
        eq(scenes.id, sceneId),
        eq(scenes.sessionId, sessionId),
        eq(scenes.ownerId, user.id),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function createScene(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = getDb();

  const campaignId = String(formData.get("campaignId") ?? "");
  const sessionId = String(formData.get("sessionId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title || !(await ownsSession(user.id, campaignId, sessionId))) return;

  await db.insert(scenes).values({
    sessionId,
    campaignId,
    ownerId: user.id,
    title,
    summary: emptyToNull(formData.get("summary")),
    status: parseStatus(formData.get("status")),
    order: parseOrder(formData.get("order")),
  });

  revalidatePath(`/campaigns/${campaignId}/sessions/${sessionId}`);
  redirect(`/campaigns/${campaignId}/sessions/${sessionId}`);
}

export async function updateScene(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = getDb();

  const id = String(formData.get("id") ?? "");
  const campaignId = String(formData.get("campaignId") ?? "");
  const sessionId = String(formData.get("sessionId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !title || !(await ownsSession(user.id, campaignId, sessionId)))
    return;

  await db
    .update(scenes)
    .set({
      title,
      summary: emptyToNull(formData.get("summary")),
      status: parseStatus(formData.get("status")),
      order: parseOrder(formData.get("order")),
      updatedAt: new Date(),
    })
    .where(and(eq(scenes.id, id), eq(scenes.ownerId, user.id)));

  revalidatePath(`/campaigns/${campaignId}/sessions/${sessionId}`);
  redirect(`/campaigns/${campaignId}/sessions/${sessionId}`);
}

export async function deleteScene(
  campaignId: string,
  sessionId: string,
  sceneId: string,
): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  await db
    .delete(scenes)
    .where(and(eq(scenes.id, sceneId), eq(scenes.ownerId, user.id)));
  revalidatePath(`/campaigns/${campaignId}/sessions/${sessionId}`);
  redirect(`/campaigns/${campaignId}/sessions/${sessionId}`);
}

/** Define o status de uma cena (usado no modo ao vivo). */
export async function setSceneStatus(
  sceneId: string,
  status: SceneStatusValue,
): Promise<void> {
  if (!(SCENE_STATUSES as readonly string[]).includes(status)) return;
  const user = await requireUser();
  const db = getDb();
  const [s] = await db
    .select()
    .from(scenes)
    .where(and(eq(scenes.id, sceneId), eq(scenes.ownerId, user.id)))
    .limit(1);
  if (!s) return;
  await db
    .update(scenes)
    .set({ status, updatedAt: new Date() })
    .where(eq(scenes.id, sceneId));
  revalidatePath(`/campaigns/${s.campaignId}/live`);
  revalidatePath(`/campaigns/${s.campaignId}/sessions/${s.sessionId}`);
}
