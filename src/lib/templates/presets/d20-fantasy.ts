import { systemTemplateSchema } from "../schema";

/**
 * Template d20 de fantasia (estilo D&D 5e / Tormenta).
 * É o primeiro template "rico" e serve de referência para o motor.
 *
 * Passa por `systemTemplateSchema.parse` no carregamento: se algo estiver
 * inválido, o build falha — o que é desejável (pega erro de template cedo).
 */
export const d20Fantasy = systemTemplateSchema.parse({
  id: "d20-fantasy",
  name: "d20 Fantasia (genérico)",
  version: "1.0.0",
  engineVersion: 1,
  kind: "d20",
  description:
    "Sistema d20 genérico de fantasia: seis atributos, rolagem 1d20 + modificador, CA e PV.",
  attributes: [
    { key: "str", label: "Força", min: 1, max: 30, default: 10, derived: { mod: "floor((value - 10) / 2)" } },
    { key: "dex", label: "Destreza", min: 1, max: 30, default: 10, derived: { mod: "floor((value - 10) / 2)" } },
    { key: "con", label: "Constituição", min: 1, max: 30, default: 10, derived: { mod: "floor((value - 10) / 2)" } },
    { key: "int", label: "Inteligência", min: 1, max: 30, default: 10, derived: { mod: "floor((value - 10) / 2)" } },
    { key: "wis", label: "Sabedoria", min: 1, max: 30, default: 10, derived: { mod: "floor((value - 10) / 2)" } },
    { key: "cha", label: "Carisma", min: 1, max: 30, default: 10, derived: { mod: "floor((value - 10) / 2)" } },
  ],
  skills: [
    { key: "acrobatics", label: "Acrobacia", attribute: "dex" },
    { key: "arcana", label: "Arcanismo", attribute: "int" },
    { key: "athletics", label: "Atletismo", attribute: "str" },
    { key: "stealth", label: "Furtividade", attribute: "dex" },
    { key: "perception", label: "Percepção", attribute: "wis" },
    { key: "persuasion", label: "Persuasão", attribute: "cha" },
  ],
  resources: [
    { key: "hp", label: "Pontos de Vida", track: "current_max", color: "red", showInCombat: true },
    { key: "ac", label: "Classe de Armadura", track: "static", color: "slate", showInCombat: true },
    { key: "speed", label: "Deslocamento", track: "static" },
  ],
  conditions: [
    { key: "prone", label: "Caído" },
    { key: "grappled", label: "Agarrado" },
    { key: "frightened", label: "Amedrontado" },
    { key: "poisoned", label: "Envenenado" },
    { key: "stunned", label: "Atordoado" },
  ],
  damageTypes: ["cortante", "perfurante", "concussão", "fogo", "gelo", "ácido", "veneno", "radiante", "necrótico", "psíquico"],
  rolls: {
    notation: "d20",
    default: { formula: "1d20 + {attr.mod}" },
    variants: {
      advantage: { formula: "2d20kh1 + {attr.mod}" },
      disadvantage: { formula: "2d20kl1 + {attr.mod}" },
    },
    macros: [
      { key: "ability_check", label: "Teste de atributo", formula: "1d20 + {attr.mod}" },
      { key: "attack", label: "Ataque", formula: "1d20 + {attr.mod} + {prof}" },
      { key: "save", label: "Salvaguarda", formula: "1d20 + {attr.mod} + {prof}" },
    ],
  },
  difficulty: {
    scale: [
      { label: "Muito fácil", value: 5 },
      { label: "Fácil", value: 10 },
      { label: "Médio", value: 15 },
      { label: "Difícil", value: 20 },
      { label: "Muito difícil", value: 25 },
      { label: "Quase impossível", value: 30 },
    ],
  },
  combat: {
    initiative: "1d20 + {dex.mod}",
    healthResource: "hp",
    defenseField: "ac",
    turnOrder: "initiative_desc",
  },
  sheet: {
    sections: [
      { title: "Atributos", layout: "grid", fields: ["str", "dex", "con", "int", "wis", "cha"] },
      { title: "Combate", layout: "row", fields: ["hp", "ac", "speed"] },
      { title: "Perícias", layout: "list", fields: ["__skills__"] },
    ],
  },
});
