import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { ImportCampaignForm } from "@/components/import-campaign-form";
import { getUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ImportCampaignPage() {
  if (!isSupabaseConfigured()) return <DemoNotice />;
  const user = await getUser();
  if (!user) return <LoginNotice />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Importar campanha</h1>
        <p className="text-muted-foreground">
          Envie um arquivo <code>.json</code> exportado do
          OpenMaster-NarratorHelper. Uma nova campanha é criada com tudo dentro.
        </p>
      </div>
      <ImportCampaignForm />
    </div>
  );
}
