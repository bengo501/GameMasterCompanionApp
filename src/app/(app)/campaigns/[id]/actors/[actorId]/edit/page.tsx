import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { ActorForm } from "@/components/actor-form";
import { getActor, updateActor } from "@/lib/actors/actions";
import { loadCampaign } from "@/lib/campaigns/context";

export default async function EditActorPage({
  params,
}: {
  params: Promise<{ id: string; actorId: string }>;
}) {
  const { id, actorId } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const actor = await getActor(id, actorId);
  if (!actor) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Editar {actor.name}</h1>
      <ActorForm
        action={updateActor}
        campaignId={id}
        template={ctx.campaign.systemSnapshot}
        actor={actor}
      />
    </div>
  );
}
