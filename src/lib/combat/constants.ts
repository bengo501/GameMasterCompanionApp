export const ENCOUNTER_STATUSES = ["planned", "active", "done"] as const;

export type EncounterStatusValue = (typeof ENCOUNTER_STATUSES)[number];

export const ENCOUNTER_STATUS_LABELS: Record<EncounterStatusValue, string> = {
  planned: "Planejado",
  active: "Em andamento",
  done: "Concluído",
};

export type EncounterFormState = { error?: string } | undefined;
