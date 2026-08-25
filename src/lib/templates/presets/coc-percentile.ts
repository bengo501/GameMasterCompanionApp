import { systemTemplateSchema } from "../schema";

/**
 * Sistema percentual (estilo Call of Cthulhu): role 1d100 igual ou abaixo do
 * valor da característica/perícia. Valida o motor com `kind: "percentile"`.
 */
const attr = (key: string, label: string) => ({
  key,
  label,
  min: 0,
  max: 99,
  default: 50,
  derived: { half: "floor(value / 2)", fifth: "floor(value / 5)" },
});

export const cocPercentile = systemTemplateSchema.parse({
  id: "coc-percentile",
  name: "Percentual (estilo Call of Cthulhu)",
  version: "1.0.0",
  kind: "percentile",
  description:
    "Role 1d100 igual ou abaixo do valor. Metade = difícil, um quinto = extremo.",
  attributes: [
    attr("str", "FOR"),
    attr("con", "CON"),
    attr("siz", "TAM"),
    attr("dex", "DES"),
    attr("app", "APA"),
    attr("int", "INT"),
    attr("pow", "POD"),
    attr("edu", "EDU"),
  ],
  skills: [
    { key: "spot", label: "Perceber", attribute: "int" },
    { key: "library", label: "Usar Bibliotecas", attribute: "edu" },
    { key: "stealth", label: "Furtividade", attribute: "dex" },
    { key: "firearms", label: "Armas de Fogo", attribute: "dex" },
    { key: "occult", label: "Ocultismo", attribute: "edu" },
  ],
  resources: [
    { key: "hp", label: "Pontos de Vida", track: "current_max", color: "red", showInCombat: true },
    { key: "san", label: "Sanidade", track: "current_max", color: "violet" },
    { key: "mp", label: "Pontos de Magia", track: "current_max", color: "blue" },
  ],
  conditions: [
    { key: "insane", label: "Enlouquecido" },
    { key: "prone", label: "Caído" },
    { key: "unconscious", label: "Inconsciente" },
    { key: "dying", label: "Morrendo" },
  ],
  damageTypes: ["físico", "fogo", "arma de fogo", "impacto"],
  rolls: {
    notation: "d100",
    default: { formula: "1d100" },
    macros: [
      { key: "skill", label: "Teste de perícia", formula: "1d100" },
      { key: "luck", label: "Sorte", formula: "1d100" },
      { key: "san_check", label: "Teste de Sanidade", formula: "1d100" },
    ],
  },
  combat: {
    initiative: "{dex}",
    healthResource: "hp",
    turnOrder: "initiative_desc",
  },
  sheet: {
    sections: [
      { title: "Características", layout: "grid", fields: ["str", "con", "siz", "dex", "app", "int", "pow", "edu"] },
      { title: "Vitais", layout: "row", fields: ["hp", "san", "mp"] },
      { title: "Perícias", layout: "list", fields: ["__skills__"] },
    ],
  },
});
