import { z } from "zod";

/**
 * Motor de templates de sistema de RPG.
 *
 * Um "template de sistema" descreve, de forma agnóstica, como um RPG funciona:
 * atributos, perícias, recursos, condições, rolagens e layout de ficha.
 * O app usa isso para renderizar fichas e mecânicas sem conhecer o sistema.
 *
 * O Zod é a fonte única da verdade: os tipos TypeScript são inferidos do schema.
 */

export const attributeSchema = z.object({
  key: z.string(),
  label: z.string(),
  min: z.number().optional(),
  max: z.number().optional(),
  default: z.number().optional(),
  /** Expressões para valores derivados (ex.: { "mod": "floor((value - 10) / 2)" }). Avaliadas pelo motor a partir do M2/M4. */
  derived: z.record(z.string(), z.string()).optional(),
});

export const skillSchema = z.object({
  key: z.string(),
  label: z.string(),
  /** key do atributo associado, se houver. */
  attribute: z.string().optional(),
  trained: z.boolean().optional(),
});

export const resourceSchema = z.object({
  key: z.string(),
  label: z.string(),
  /** Como o recurso é rastreado: atual/máximo, valor fixo ou um contador. */
  track: z.enum(["current_max", "static", "counter"]).default("static"),
  color: z.string().optional(),
  showInCombat: z.boolean().optional(),
});

export const conditionSchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const rollMacroSchema = z.object({
  key: z.string(),
  label: z.string(),
  /** Fórmula no formato do motor de dados (M4), ex.: "1d20 + {str.mod} + {prof}". */
  formula: z.string(),
});

export const rollsSchema = z.object({
  /** Notação base do sistema, para rótulos (d20, d100, 2d6, dice_pool…). */
  notation: z.string().default("d20"),
  default: z.object({ formula: z.string() }),
  variants: z
    .record(z.string(), z.object({ formula: z.string() }))
    .optional(),
  macros: z.array(rollMacroSchema).default([]),
});

export const difficultyStepSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export const combatSchema = z.object({
  /** Fórmula de iniciativa. */
  initiative: z.string(),
  /** key do recurso usado como "vida". */
  healthResource: z.string(),
  /** key do recurso/campo usado como defesa (CA, esquiva…). */
  defenseField: z.string().optional(),
  turnOrder: z
    .enum(["initiative_desc", "initiative_asc", "manual"])
    .default("initiative_desc"),
});

export const sheetSectionSchema = z.object({
  title: z.string(),
  layout: z.enum(["grid", "row", "list", "stack"]).default("stack"),
  /** keys de attribute/resource ou tokens especiais (ex.: "__skills__"). */
  fields: z.array(z.string()),
});

export const sheetSchema = z.object({
  sections: z.array(sheetSectionSchema).default([]),
});

export const systemTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string().default("1.0.0"),
  /** Versão do motor de templates do app com que este template é compatível. */
  engineVersion: z.number().default(1),
  kind: z.enum(["d20", "percentile", "dice_pool", "narrative", "custom"]),
  description: z.string().optional(),
  attributes: z.array(attributeSchema).default([]),
  skills: z.array(skillSchema).default([]),
  resources: z.array(resourceSchema).default([]),
  conditions: z.array(conditionSchema).default([]),
  damageTypes: z.array(z.string()).default([]),
  rolls: rollsSchema,
  difficulty: z
    .object({ scale: z.array(difficultyStepSchema).default([]) })
    .optional(),
  combat: combatSchema.optional(),
  sheet: sheetSchema.optional(),
});

export type Attribute = z.infer<typeof attributeSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type Condition = z.infer<typeof conditionSchema>;
export type RollMacro = z.infer<typeof rollMacroSchema>;
export type SystemTemplate = z.infer<typeof systemTemplateSchema>;

/** Valida um JSON de template e devolve o resultado (com defaults aplicados). */
export function parseTemplate(input: unknown) {
  return systemTemplateSchema.safeParse(input);
}
