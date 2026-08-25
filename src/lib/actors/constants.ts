export const ACTOR_KINDS = ["pc", "npc"] as const;
export type ActorKindValue = (typeof ACTOR_KINDS)[number];

export const ACTOR_KIND_LABELS: Record<ActorKindValue, string> = {
  pc: "Personagem (PC)",
  npc: "NPC",
};

/** Campos narrativos flexíveis guardados em `actor.data`. */
export const ACTOR_NARRATIVE_FIELDS = [
  "motivation",
  "secret",
  "attitude",
  "goals",
  "faction",
] as const;

export const ACTOR_NARRATIVE_LABELS: Record<string, string> = {
  motivation: "Motivação",
  secret: "Segredo",
  attitude: "Atitude atual",
  goals: "Objetivos",
  faction: "Facção / Ligação",
};

export type ActorFormState = { error?: string } | undefined;
