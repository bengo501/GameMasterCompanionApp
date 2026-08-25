import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { CampaignForm } from "@/components/campaign-form";
import { getUser } from "@/lib/auth";
import { createCampaign } from "@/lib/campaigns/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { listBuiltinTemplates } from "@/lib/templates";

export default async function NewCampaignPage() {
  if (!isSupabaseConfigured()) return <DemoNotice />;
  const user = await getUser();
  if (!user) return <LoginNotice />;

  const templates = listBuiltinTemplates().map((t) => ({
    key: t.id,
    name: t.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nova campanha</h1>
        <p className="text-muted-foreground">
          Escolha o sistema e descreva sua mesa.
        </p>
      </div>
      <CampaignForm action={createCampaign} templates={templates} />
    </div>
  );
}
