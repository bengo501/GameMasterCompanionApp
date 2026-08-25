/**
 * Indica se o Supabase está configurado via variáveis de ambiente.
 * Enquanto não estiver, a app roda em "modo demo": sem login nem persistência.
 */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
