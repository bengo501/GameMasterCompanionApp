import { getUser } from "@/lib/auth";
import { gatherCampaignExport } from "@/lib/campaigns/transfer";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured())
    return new Response("Supabase não configurado.", { status: 503 });

  const user = await getUser();
  if (!user) return new Response("Não autorizado.", { status: 401 });

  const { id } = await params;
  const data = await gatherCampaignExport(user.id, id);
  if (!data) return new Response("Campanha não encontrada.", { status: 404 });

  const slug =
    data.campaign.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "campanha";

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.json"`,
    },
  });
}
