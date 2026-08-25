import { systemTemplateSchema } from "../schema";

/**
 * Narrativo (estilo PbtA): movimentos com 2d6 + atributo.
 * 10+ sucesso pleno, 7–9 sucesso parcial, 6− falha.
 * Valida `kind: "narrative"` e um template SEM bloco de combate.
 */
export const pbtaNarrative = systemTemplateSchema.parse({
  id: "pbta-narrative",
  name: "Narrativo (estilo PbtA)",
  version: "1.0.0",
  kind: "narrative",
  description:
    "2d6 + atributo: 10+ pleno, 7–9 parcial, 6− falha. Pouca ficha, muito foco na cena.",
  attributes: [
    { key: "cool", label: "Frieza", min: -1, max: 3, default: 0 },
    { key: "hard", label: "Dureza", min: -1, max: 3, default: 0 },
    { key: "hot", label: "Carisma", min: -1, max: 3, default: 0 },
    { key: "sharp", label: "Esperteza", min: -1, max: 3, default: 0 },
    { key: "weird", label: "Estranheza", min: -1, max: 3, default: 0 },
  ],
  skills: [],
  resources: [
    { key: "harm", label: "Dano", track: "counter", color: "red" },
    { key: "xp", label: "Experiência", track: "counter" },
  ],
  conditions: [
    { key: "afraid", label: "Com medo" },
    { key: "angry", label: "Com raiva" },
    { key: "guilty", label: "Culpado" },
    { key: "hopeless", label: "Sem esperança" },
  ],
  damageTypes: ["dano"],
  rolls: {
    notation: "2d6",
    default: { formula: "2d6" },
    macros: [
      { key: "cool", label: "Agir sob pressão (Frieza)", formula: "2d6 + {cool}" },
      { key: "hard", label: "Partir pra cima (Dureza)", formula: "2d6 + {hard}" },
      { key: "hot", label: "Manipular (Carisma)", formula: "2d6 + {hot}" },
      { key: "sharp", label: "Investigar (Esperteza)", formula: "2d6 + {sharp}" },
      { key: "weird", label: "Usar o estranho (Estranheza)", formula: "2d6 + {weird}" },
    ],
  },
  difficulty: {
    scale: [
      { label: "Falha (6−)", value: 6 },
      { label: "Parcial (7–9)", value: 7 },
      { label: "Pleno (10+)", value: 10 },
    ],
  },
  sheet: {
    sections: [
      { title: "Atributos", layout: "grid", fields: ["cool", "hard", "hot", "sharp", "weird"] },
      { title: "Recursos", layout: "row", fields: ["harm", "xp"] },
    ],
  },
});
