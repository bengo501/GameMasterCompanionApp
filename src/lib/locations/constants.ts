/** Sugestões de tipo (campo livre, com datalist). */
export const LOCATION_TYPE_SUGGESTIONS = [
  "Continente",
  "Região",
  "Reino",
  "Cidade",
  "Vila",
  "Bairro",
  "Masmorra",
  "Taverna",
  "Base",
  "Planeta",
  "Ponto de interesse",
] as const;

export type LocationFormState = { error?: string } | undefined;
