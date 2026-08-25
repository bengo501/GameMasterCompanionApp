export const SCENE_STATUSES = ["planned", "done", "skipped"] as const;

export type SceneStatusValue = (typeof SCENE_STATUSES)[number];

export const SCENE_STATUS_LABELS: Record<SceneStatusValue, string> = {
  planned: "Prevista",
  done: "Jogada",
  skipped: "Pulada",
};
