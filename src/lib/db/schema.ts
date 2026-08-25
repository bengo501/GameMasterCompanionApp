import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { ActorSheet } from "@/lib/actors/sheet";
import type { DiceGroup } from "@/lib/dice/roll";
import type { SystemTemplate } from "@/lib/templates/schema";

/**
 * Schema do banco (Drizzle / Postgres / Supabase).
 *
 * Padrão híbrido: colunas fixas universais + coluna `data` (JSONB) para
 * campos dirigidos pelo template. IDs em UUID para facilitar sync/nuvem.
 *
 * M1 cobre `campaign`. Atores, locais, sessões, cenas, notas, combate, etc.
 * entram nos marcos seguintes (M2, M3, M5).
 */

export const campaignStatus = pgEnum("campaign_status", [
  "planning",
  "active",
  "paused",
  "completed",
  "archived",
]);

export const campaigns = pgTable(
  "campaign",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** auth.users.id do dono (Supabase). */
    ownerId: uuid("owner_id").notNull(),
    name: text("name").notNull(),
    /** key do template usado (ex.: "d20-fantasy"). */
    systemKey: text("system_key").notNull(),
    /** Cópia do template no momento da criação — campanha autocontida. */
    systemSnapshot: jsonb("system_snapshot").$type<SystemTemplate>().notNull(),
    description: text("description"),
    tone: text("tone"),
    genre: text("genre"),
    status: campaignStatus("status").notNull().default("planning"),
    setting: text("setting"),
    /** Campos flexíveis dirigidos pelo template / uso futuro. */
    data: jsonb("data")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("campaign_owner_idx").on(table.ownerId)],
);

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

// ---------------------------------------------------------------------------
// Atores (PC e NPC unificados) — M2
// ---------------------------------------------------------------------------

export const actorKind = pgEnum("actor_kind", ["pc", "npc"]);

export const actors = pgTable(
  "actor",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").notNull(),
    kind: actorKind("kind").notNull().default("npc"),
    name: text("name").notNull(),
    concept: text("concept"),
    /** Jogador, quando for um PC. */
    playerName: text("player_name"),
    description: text("description"),
    /** Notas ocultas do mestre. */
    notes: text("notes"),
    /** Ficha dirigida pelo template (atributos/recursos). */
    sheet: jsonb("sheet")
      .$type<ActorSheet>()
      .notNull()
      .default(sql`'{"attributes":{},"resources":{}}'::jsonb`),
    /** Campos narrativos flexíveis (motivação, segredo, atitude…). */
    data: jsonb("data")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("actor_campaign_idx").on(table.campaignId),
    index("actor_owner_idx").on(table.ownerId),
  ],
);

export type Actor = typeof actors.$inferSelect;
export type NewActor = typeof actors.$inferInsert;

// ---------------------------------------------------------------------------
// Locais (hierárquicos) — M2
// ---------------------------------------------------------------------------

export const locations = pgTable(
  "location",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").notNull(),
    /** Pai na hierarquia (continente > região > cidade > …). */
    parentId: uuid("parent_id").references((): AnyPgColumn => locations.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    /** Tipo livre (cidade, masmorra, taverna…). */
    type: text("type"),
    description: text("description"),
    data: jsonb("data")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("location_campaign_idx").on(table.campaignId),
    index("location_parent_idx").on(table.parentId),
  ],
);

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;

// ---------------------------------------------------------------------------
// Sessões e Cenas — M3
// ---------------------------------------------------------------------------

export const sessionStatus = pgEnum("session_status", [
  "planned",
  "running",
  "done",
  "canceled",
]);

export const sessions = pgTable(
  "session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").notNull(),
    title: text("title").notNull(),
    sessionDate: date("session_date"),
    status: sessionStatus("status").notNull().default("planned"),
    /** O que o mestre planejou. */
    plannedSummary: text("planned_summary"),
    /** O que de fato aconteceu. */
    actualSummary: text("actual_summary"),
    /** Notas privadas do mestre. */
    gmNotes: text("gm_notes"),
    data: jsonb("data")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("session_campaign_idx").on(table.campaignId),
    index("session_owner_idx").on(table.ownerId),
  ],
);

export type GameSession = typeof sessions.$inferSelect;
export type NewGameSession = typeof sessions.$inferInsert;

export const sceneStatus = pgEnum("scene_status", [
  "planned",
  "done",
  "skipped",
]);

export const scenes = pgTable(
  "scene",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    status: sceneStatus("status").notNull().default("planned"),
    order: integer("order").notNull().default(0),
    data: jsonb("data")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("scene_session_idx").on(table.sessionId),
    index("scene_owner_idx").on(table.ownerId),
  ],
);

export type Scene = typeof scenes.$inferSelect;
export type NewScene = typeof scenes.$inferInsert;

// ---------------------------------------------------------------------------
// Notas — M3
// ---------------------------------------------------------------------------

export const notes = pgTable(
  "note",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").notNull(),
    title: text("title"),
    body: text("body").notNull().default(""),
    pinned: boolean("pinned").notNull().default(false),
    data: jsonb("data")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("note_campaign_idx").on(table.campaignId),
    index("note_owner_idx").on(table.ownerId),
  ],
);

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

// ---------------------------------------------------------------------------
// Rolagens de dados (histórico) — M4
// ---------------------------------------------------------------------------

export const diceRolls = pgTable(
  "dice_roll",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").notNull(),
    expression: text("expression").notNull(),
    label: text("label"),
    total: integer("total").notNull(),
    detail: text("detail").notNull().default(""),
    /** Detalhamento por grupo de dados (valores rolados, mantidos). */
    breakdown: jsonb("breakdown")
      .$type<DiceGroup[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    /** Rolagem oculta do mestre. */
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("dice_roll_campaign_idx").on(table.campaignId),
    index("dice_roll_owner_idx").on(table.ownerId),
  ],
);

export type DiceRoll = typeof diceRolls.$inferSelect;
export type NewDiceRoll = typeof diceRolls.$inferInsert;

// ---------------------------------------------------------------------------
// Combate: encontros e combatentes — M5
// ---------------------------------------------------------------------------

export const encounterStatus = pgEnum("encounter_status", [
  "planned",
  "active",
  "done",
]);

export const encounters = pgTable(
  "encounter",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").notNull(),
    name: text("name").notNull(),
    status: encounterStatus("status").notNull().default("planned"),
    round: integer("round").notNull().default(1),
    /** Combatente cujo turno está ativo (sem FK p/ evitar ciclo). */
    activeCombatantId: uuid("active_combatant_id"),
    notes: text("notes"),
    data: jsonb("data")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("encounter_campaign_idx").on(table.campaignId),
    index("encounter_owner_idx").on(table.ownerId),
  ],
);

export type Encounter = typeof encounters.$inferSelect;
export type NewEncounter = typeof encounters.$inferInsert;

export const combatants = pgTable(
  "combatant",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    encounterId: uuid("encounter_id")
      .notNull()
      .references(() => encounters.id, { onDelete: "cascade" }),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").notNull(),
    /** Ator vinculado (NPC/PC), se houver. */
    actorId: uuid("actor_id").references(() => actors.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    initiative: integer("initiative").notNull().default(0),
    hpCurrent: integer("hp_current"),
    hpMax: integer("hp_max"),
    defense: integer("defense"),
    conditions: jsonb("conditions")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    isPc: boolean("is_pc").notNull().default(false),
    data: jsonb("data")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("combatant_encounter_idx").on(table.encounterId),
    index("combatant_owner_idx").on(table.ownerId),
  ],
);

export type Combatant = typeof combatants.$inferSelect;
export type NewCombatant = typeof combatants.$inferInsert;
