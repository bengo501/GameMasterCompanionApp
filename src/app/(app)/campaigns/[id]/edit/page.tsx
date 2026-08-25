import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { CampaignForm } from "@/components/campaign-form";
import { getUser } from "@/lib/auth";
import { getCampaign, updateCampaign } from "@/lib/campaigns/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { listBuiltinTemplates } from "@/lib/templates";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) return <DemoNotice />;
  const user = await getUser();
  if (!user) return <LoginNotice />;

  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  const templates = listBuiltinTemplates().map((t) => ({
    key: t.id,
    name: t.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar campanha</h1>
        <p className="text-muted-foreground">{campaign.name}</p>
      </div>
      <CampaignForm
        action={updateCampaign}
        templates={templates}
        campaign={campaign}
      />
    </div>
  );
}
