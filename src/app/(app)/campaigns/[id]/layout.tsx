import { CampaignTabs } from "@/components/campaign-tabs";
import { loadCampaign } from "@/lib/campaigns/context";

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await loadCampaign(id);

  return (
    <div className="space-y-6">
      {ctx.status === "ok" && (
        <CampaignTabs campaignId={id} campaignName={ctx.campaign.name} />
      )}
      {children}
    </div>
  );
}
