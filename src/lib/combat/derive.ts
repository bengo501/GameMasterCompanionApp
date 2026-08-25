import type { ActorSheet } from "@/lib/actors/sheet";
import { tryEvalFormula } from "@/lib/templates/formula";
import type { SystemTemplate } from "@/lib/templates";

/**
 * Constrói as variáveis de rolagem a partir da ficha de um ator, para resolver
 * fórmulas do template como "1d20 + {dex.mod}".
 * Expõe `{attr}` (valor) e `{attr.derivada}` (ex.: `{dex.mod}`).
 */
export function actorRollVars(
  template: SystemTemplate,
  sheet: ActorSheet,
): Record<string, number> {
  const vars: Record<string, number> = {};
  for (const a of template.attributes) {
    const val = sheet.attributes[a.key] ?? a.default ?? 0;
    vars[a.key] = val;
    if (a.derived) {
      for (const [k, formula] of Object.entries(a.derived)) {
        const r = tryEvalFormula(formula, { value: val });
        if (r !== null) vars[`${a.key}.${k}`] = r;
      }
    }
  }
  return vars;
}

/** Extrai PV e defesa da ficha conforme o bloco `combat` do template. */
export function combatStats(
  template: SystemTemplate,
  sheet: ActorSheet,
): { hpCurrent: number | null; hpMax: number | null; defense: number | null } {
  const hpKey = template.combat?.healthResource;
  const defKey = template.combat?.defenseField;

  let hpMax: number | null = null;
  if (hpKey) {
    const r = sheet.resources[hpKey];
    if (r) hpMax = r.max ?? r.value ?? r.current ?? null;
  }

  let defense: number | null = null;
  if (defKey) {
    const r = sheet.resources[defKey];
    if (r) defense = r.value ?? r.current ?? r.max ?? null;
  }

  return { hpCurrent: hpMax, hpMax, defense };
}
