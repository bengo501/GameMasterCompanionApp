import { and, eq } from "drizzle-orm";
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

export const EXPORT_FORMAT = "openmaster-campaign";

/** Reúne uma campanha e todas as suas entidades para exportação (JSON). */
export async function gatherCampaignExport(userId: string, campaignId: string) {
  const db = getDb();
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.ownerId, userId)))
    .limit(1);
  if (!campaign) return null;

  const [
    actorRows,
    locationRows,
    sessionRows,
    sceneRows,
    noteRows,
    encounterRows,
    combatantRows,
  ] = await Promise.all([
    db.select().from(actors).where(and(eq(actors.campaignId, campaignId), eq(actors.ownerId, userId))),
    db.select().from(locations).where(and(eq(locations.campaignId, campaignId), eq(locations.ownerId, userId))),
    db.select().from(sessions).where(and(eq(sessions.campaignId, campaignId), eq(sessions.ownerId, userId))),
    db.select().from(scenes).where(and(eq(scenes.campaignId, campaignId), eq(scenes.ownerId, userId))),
    db.select().from(notes).where(and(eq(notes.campaignId, campaignId), eq(notes.ownerId, userId))),
    db.select().from(encounters).where(and(eq(encounters.campaignId, campaignId), eq(encounters.ownerId, userId))),
    db.select().from(combatants).where(and(eq(combatants.campaignId, campaignId), eq(combatants.ownerId, userId))),
  ]);

  return {
    format: EXPORT_FORMAT,
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    campaign,
    actors: actorRows,
    locations: locationRows,
    sessions: sessionRows,
    scenes: sceneRows,
    notes: noteRows,
    encounters: encounterRows,
    combatants: combatantRows,
  };
}
