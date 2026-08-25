import { getUser } from "@/lib/auth";
import { getCampaign } from "@/lib/campaigns/actions";
import type { Campaign } from "@/lib/db/schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Resultado do carregamento de uma campanha para as páginas escopadas.
 * Evita repetir os guards (demo / login / not found) em cada página.
 */
export type CampaignContext =
  | { status: "demo" }
  | { status: "login" }
  | { status: "notfound" }
  | { status: "ok"; campaign: Campaign };

export async function loadCampaign(id: string): Promise<CampaignContext> {
  if (!isSupabaseConfigured()) return { status: "demo" };
  const user = await getUser();
  if (!user) return { status: "login" };
  const campaign = await getCampaign(id);
  if (!campaign) return { status: "notfound" };
  return { status: "ok", campaign };
}
