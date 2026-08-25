export const SESSION_STATUSES = [
  "planned",
  "running",
  "done",
  "canceled",
] as const;

export type SessionStatusValue = (typeof SESSION_STATUSES)[number];

export const SESSION_STATUS_LABELS: Record<SessionStatusValue, string> = {
  planned: "Planejada",
  running: "Em andamento",
  done: "Concluída",
  canceled: "Cancelada",
};

export type SessionFormState = { error?: string } | undefined;
