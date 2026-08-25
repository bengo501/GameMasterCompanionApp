import type { SystemTemplate } from "@/lib/templates/schema";

/**
 * Dados de ficha de um ator, dirigidos pelo template do sistema.
 * Guardado na coluna `actor.sheet` (JSONB).
 */
export type ResourceValue = { current?: number; max?: number; value?: number };

export type ActorSheet = {
  attributes: Record<string, number>;
  resources: Record<string, ResourceValue>;
};

export function emptySheet(): ActorSheet {
  return { attributes: {}, resources: {} };
}

/** Ficha inicial com defaults do template. */
export function defaultSheetFor(template: SystemTemplate): ActorSheet {
  const attributes: Record<string, number> = {};
  for (const a of template.attributes) attributes[a.key] = a.default ?? 10;

  const resources: Record<string, ResourceValue> = {};
  for (const r of template.resources) {
    if (r.track === "current_max") resources[r.key] = { current: 0, max: 0 };
    else if (r.track === "counter") resources[r.key] = { current: 0 };
    else resources[r.key] = { value: 0 };
  }
  return { attributes, resources };
}

/** Combina a ficha salva com os defaults do template (tolerante a dados antigos). */
export function coerceSheet(raw: unknown, template: SystemTemplate): ActorSheet {
  const base = defaultSheetFor(template);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<ActorSheet>;
  return {
    attributes: { ...base.attributes, ...(r.attributes ?? {}) },
    resources: { ...base.resources, ...(r.resources ?? {}) },
  };
}

function num(v: FormDataEntryValue | null, fallback = 0): number {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

/** Lê os campos `attr.*` e `res.*` de um FormData conforme o template. */
export function parseSheetFromForm(
  template: SystemTemplate,
  formData: FormData,
): ActorSheet {
  const attributes: Record<string, number> = {};
  for (const a of template.attributes) {
    attributes[a.key] = num(formData.get(`attr.${a.key}`), a.default ?? 0);
  }

  const resources: Record<string, ResourceValue> = {};
  for (const r of template.resources) {
    if (r.track === "current_max") {
      resources[r.key] = {
        current: num(formData.get(`res.${r.key}.current`)),
        max: num(formData.get(`res.${r.key}.max`)),
      };
    } else if (r.track === "counter") {
      resources[r.key] = { current: num(formData.get(`res.${r.key}.current`)) };
    } else {
      resources[r.key] = { value: num(formData.get(`res.${r.key}.value`)) };
    }
  }
  return { attributes, resources };
}
