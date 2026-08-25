import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { EncounterForm } from "@/components/encounter-form";
import { loadCampaign } from "@/lib/campaigns/context";
import { getEncounter, updateEncounter } from "@/lib/combat/actions";

export default async function EditEncounterPage({
  params,
}: {
  params: Promise<{ id: string; encounterId: string }>;
}) {
  const { id, encounterId } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const encounter = await getEncounter(id, encounterId);
  if (!encounter) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Editar {encounter.name}
      </h1>
      <EncounterForm
        action={updateEncounter}
        campaignId={id}
        encounter={encounter}
      />
    </div>
  );
}
