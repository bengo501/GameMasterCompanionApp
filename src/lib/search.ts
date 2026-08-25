import { and, desc, eq, ilike, or } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  actors,
  campaigns,
  locations,
  notes,
  sessions,
  type Actor,
  type Campaign,
  type GameSession,
  type Location,
  type Note,
} from "@/lib/db/schema";

export type SearchResults = {
  query: string;
  campaignNames: Map<string, string>;
  campaigns: Campaign[];
  actors: Actor[];
  locations: Location[];
  sessions: GameSession[];
  notes: Note[];
  total: number;
};

const LIMIT = 25;

/** Busca global (ILIKE) nas entidades do usuário, em todas as campanhas. */
export async function searchAll(query: string): Promise<SearchResults> {
  const user = await requireUser();
  const db = getDb();
  const like = `%${query}%`;
  const mine = eq;

  const [campRows, actorRows, locRows, sessionRows, noteRows, allCamps] =
    await Promise.all([
      db
        .select()
        .from(campaigns)
        .where(and(mine(campaigns.ownerId, user.id), ilike(campaigns.name, like)))
        .limit(LIMIT),
      db
        .select()
        .from(actors)
        .where(
          and(
            mine(actors.ownerId, user.id),
            or(ilike(actors.name, like), ilike(actors.concept, like)),
          ),
        )
        .limit(LIMIT),
      db
        .select()
        .from(locations)
        .where(
          and(
            mine(locations.ownerId, user.id),
            or(
              ilike(locations.name, like),
              ilike(locations.type, like),
              ilike(locations.description, like),
            ),
          ),
        )
        .limit(LIMIT),
      db
        .select()
        .from(sessions)
        .where(
          and(
            mine(sessions.ownerId, user.id),
            or(
              ilike(sessions.title, like),
              ilike(sessions.plannedSummary, like),
              ilike(sessions.actualSummary, like),
            ),
          ),
        )
        .limit(LIMIT),
      db
        .select()
        .from(notes)
        .where(
          and(
            mine(notes.ownerId, user.id),
            or(ilike(notes.title, like), ilike(notes.body, like)),
          ),
        )
        .limit(LIMIT),
      db
        .select({ id: campaigns.id, name: campaigns.name })
        .from(campaigns)
        .where(eq(campaigns.ownerId, user.id))
        .orderBy(desc(campaigns.updatedAt)),
    ]);

  return {
    query,
    campaignNames: new Map(allCamps.map((c) => [c.id, c.name])),
    campaigns: campRows,
    actors: actorRows,
    locations: locRows,
    sessions: sessionRows,
    notes: noteRows,
    total:
      campRows.length +
      actorRows.length +
      locRows.length +
      sessionRows.length +
      noteRows.length,
  };
}
