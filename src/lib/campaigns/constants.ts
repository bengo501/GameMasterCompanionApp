export const CAMPAIGN_STATUSES = [
  "planning",
  "active",
  "paused",
  "completed",
  "archived",
] as const;

export type CampaignStatusValue = (typeof CAMPAIGN_STATUSES)[number];

export const STATUS_LABELS: Record<CampaignStatusValue, string> = {
  planning: "Planejando",
  active: "Ativa",
  paused: "Pausada",
  completed: "Concluída",
  archived: "Arquivada",
};

/** Estado de formulário compartilhado entre as actions e o form (client). */
export type CampaignFormState = { error?: string } | undefined;
