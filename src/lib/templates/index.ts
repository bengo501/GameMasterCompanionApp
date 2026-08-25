import { cocPercentile } from "./presets/coc-percentile";
import { d20Fantasy } from "./presets/d20-fantasy";
import { ordemParanormal } from "./presets/ordem-paranormal";
import { pbtaNarrative } from "./presets/pbta-narrative";
import type { SystemTemplate } from "./schema";

/**
 * Registro de templates embutidos (definidos em código).
 * Templates customizados criados pelo usuário (em banco) chegam na Fase 4.
 */
const BUILTIN: Record<string, SystemTemplate> = {
  [d20Fantasy.id]: d20Fantasy,
  [cocPercentile.id]: cocPercentile,
  [ordemParanormal.id]: ordemParanormal,
  [pbtaNarrative.id]: pbtaNarrative,
};

export function listBuiltinTemplates(): SystemTemplate[] {
  return Object.values(BUILTIN);
}

export function getBuiltinTemplate(key: string): SystemTemplate | null {
  return BUILTIN[key] ?? null;
}

/** Modificador d20 a partir de um valor de atributo. */
export function computeModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export * from "./schema";
