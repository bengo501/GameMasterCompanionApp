import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Cliente Drizzle (Postgres/Supabase) via conexão direta.
 *
 * Observação de segurança: a conexão direta usa o papel dono do banco e
 * IGNORA RLS. Por isso TODA query filtra por `owner_id` no código. As políticas
 * de RLS (ver docs/supabase-setup.md) protegem a API pública (anon/PostgREST).
 *
 * `db` é `null` enquanto DATABASE_URL não estiver definida (modo demo).
 */
const connectionString = process.env.DATABASE_URL;

const client = connectionString
  ? postgres(connectionString, { prepare: false })
  : null;

export const db: PostgresJsDatabase<typeof schema> | null = client
  ? drizzle(client, { schema })
  : null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!db) {
    throw new Error(
      "Banco não configurado: defina DATABASE_URL no .env.local (veja docs/supabase-setup.md).",
    );
  }
  return db;
}
