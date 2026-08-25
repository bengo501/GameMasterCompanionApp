import { systemTemplateSchema } from "../schema";

/**
 * Ordem Paranormal (Jambô): role um número de d20 igual ao atributo e use o
 * maior, somando o treinamento. NEX mede o poder. Valida `kind: "dice_pool"`.
 *
 * Observação: o tamanho do "pool" é igual ao valor do atributo. Como o motor de
 * dados ainda não monta a quantidade de dados a partir de uma variável, as
 * macros oferecem os pools fixos mais comuns (1 a 4 dados).
 */
export const ordemParanormal = systemTemplateSchema.parse({
  id: "ordem-paranormal",
  name: "Ordem Paranormal (d20 por atributo)",
  version: "1.0.0",
  kind: "dice_pool",
  description:
    "Role Nd20 (N = atributo) e use o maior + treinamento. PV/PE/SAN e NEX.",
  attributes: [
    { key: "agi", label: "Agilidade", min: 0, max: 5, default: 1 },
    { key: "for", label: "Força", min: 0, max: 5, default: 1 },
    { key: "int", label: "Intelecto", min: 0, max: 5, default: 1 },
    { key: "pre", label: "Presença", min: 0, max: 5, default: 1 },
    { key: "vig", label: "Vigor", min: 0, max: 5, default: 1 },
  ],
  skills: [
    { key: "luta", label: "Luta", attribute: "for" },
    { key: "pontaria", label: "Pontaria", attribute: "agi" },
    { key: "furtividade", label: "Furtividade", attribute: "agi" },
    { key: "ocultismo", label: "Ocultismo", attribute: "int" },
    { key: "investigacao", label: "Investigação", attribute: "int" },
    { key: "vontade", label: "Vontade", attribute: "pre" },
  ],
  resources: [
    { key: "pv", label: "Pontos de Vida", track: "current_max", color: "red", showInCombat: true },
    { key: "pe", label: "Pontos de Esforço", track: "current_max", color: "amber" },
    { key: "san", label: "Sanidade", track: "current_max", color: "violet" },
    { key: "nex", label: "NEX (%)", track: "static" },
    { key: "def", label: "Defesa", track: "static", showInCombat: true },
  ],
  conditions: [
    { key: "ferido", label: "Ferido" },
    { key: "caido", label: "Caído" },
    { key: "apavorado", label: "Apavorado" },
    { key: "atordoado", label: "Atordoado" },
  ],
  damageTypes: [
    "impacto",
    "corte",
    "perfuração",
    "balístico",
    "fogo",
    "frio",
    "químico",
    "mental",
    "morte",
    "sangue",
    "energia",
    "conhecimento",
    "medo",
  ],
  rolls: {
    notation: "Nd20kh1",
    default: { formula: "1d20" },
    variants: {
      "2 dados": { formula: "2d20kh1" },
      "3 dados": { formula: "3d20kh1" },
    },
    macros: [
      { key: "pool1", label: "1 dado", formula: "1d20" },
      { key: "pool2", label: "2 dados", formula: "2d20kh1" },
      { key: "pool3", label: "3 dados", formula: "3d20kh1" },
      { key: "pool4", label: "4 dados", formula: "4d20kh1" },
    ],
  },
  combat: {
    initiative: "1d20 + {agi}",
    healthResource: "pv",
    defenseField: "def",
    turnOrder: "initiative_desc",
  },
  sheet: {
    sections: [
      { title: "Atributos", layout: "grid", fields: ["agi", "for", "int", "pre", "vig"] },
      { title: "Recursos", layout: "row", fields: ["pv", "pe", "san", "nex", "def"] },
      { title: "Perícias", layout: "list", fields: ["__skills__"] },
    ],
  },
});
