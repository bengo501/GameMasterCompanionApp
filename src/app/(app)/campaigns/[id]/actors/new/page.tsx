import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { ActorForm } from "@/components/actor-form";
import { createActor } from "@/lib/actors/actions";
import type { ActorKindValue } from "@/lib/actors/constants";
import { loadCampaign } from "@/lib/campaigns/context";

export default async function NewActorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kind?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const kind: ActorKindValue = sp.kind === "pc" ? "pc" : "npc";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Novo {kind === "pc" ? "personagem" : "NPC"}
      </h1>
      <ActorForm
        action={createActor}
        campaignId={id}
        template={ctx.campaign.systemSnapshot}
        defaultKind={kind}
      />
    </div>
  );
}
