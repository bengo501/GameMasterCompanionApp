"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { campaigns, diceRolls, type DiceRoll } from "@/lib/db/schema";
import { safeEvaluate, type RollOutcome } from "./roll";

export type RollActionState =
  | { error?: string; outcome?: RollOutcome }
  | undefined;

async function ownsCampaign(userId: string, campaignId: string): Promise<boolean> {
  const db = getDb();
  const [c] = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.ownerId, userId)))
    .limit(1);
  return Boolean(c);
}

export async function listRolls(
  campaignId: string,
  limit = 30,
): Promise<DiceRoll[]> {
  const user = await requireUser();
  const db = getDb();
  return db
    .select()
    .from(diceRolls)
    .where(
      and(eq(diceRolls.campaignId, campaignId), eq(diceRolls.ownerId, user.id)),
    )
    .orderBy(desc(diceRolls.createdAt))
    .limit(limit);
}

export async function rollDiceAction(
  _prev: RollActionState,
  formData: FormData,
): Promise<RollActionState> {
  const user = await requireUser();
  const db = getDb();

  const campaignId = String(formData.get("campaignId") ?? "");
  if (!(await ownsCampaign(user.id, campaignId)))
    return { error: "Campanha inválida." };

  const expression = String(formData.get("expression") ?? "").trim();
  if (!expression) return { error: "Digite uma expressão (ex.: 2d6+3)." };

  const result = safeEvaluate(expression);
  if (!result.ok) return { error: result.error };

  const labelRaw = String(formData.get("label") ?? "").trim();

  await db.insert(diceRolls).values({
    campaignId,
    ownerId: user.id,
    expression,
    label: labelRaw || null,
    total: Math.round(result.outcome.total),
    detail: result.outcome.detail,
    breakdown: result.outcome.groups,
    hidden: formData.get("hidden") === "true",
  });

  revalidatePath(`/campaigns/${campaignId}/dice`);
  return { outcome: result.outcome };
}

export async function clearRolls(campaignId: string): Promise<void> {
  const user = await requireUser();
  const db = getDb();
  await db
    .delete(diceRolls)
    .where(
      and(eq(diceRolls.campaignId, campaignId), eq(diceRolls.ownerId, user.id)),
    );
  revalidatePath(`/campaigns/${campaignId}/dice`);
}
