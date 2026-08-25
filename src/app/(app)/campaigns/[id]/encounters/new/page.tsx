import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { EncounterForm } from "@/components/encounter-form";
import { createEncounter } from "@/lib/combat/actions";
import { loadCampaign } from "@/lib/campaigns/context";

export default async function NewEncounterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Novo encontro</h1>
      <EncounterForm action={createEncounter} campaignId={id} />
    </div>
  );
}
