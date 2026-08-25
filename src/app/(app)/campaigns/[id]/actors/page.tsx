import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listActors } from "@/lib/actors/actions";
import type { Actor } from "@/lib/db/schema";
import { loadCampaign } from "@/lib/campaigns/context";

function ActorCard({ actor, campaignId }: { actor: Actor; campaignId: string }) {
  return (
    <Link href={`/campaigns/${campaignId}/actors/${actor.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <CardTitle>{actor.name}</CardTitle>
          <CardDescription>
            {[actor.concept, actor.playerName].filter(Boolean).join(" · ") ||
              "—"}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default async function ActorsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const actors = await listActors(id);
  const pcs = actors.filter((a) => a.kind === "pc");
  const npcs = actors.filter((a) => a.kind === "npc");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Personagens & NPCs
          </h1>
          <p className="text-muted-foreground">
            Fichas geradas a partir do sistema da campanha.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/campaigns/${id}/actors/new?kind=pc`}>
            <Button variant="outline">Novo PC</Button>
          </Link>
          <Link href={`/campaigns/${id}/actors/new?kind=npc`}>
            <Button>Novo NPC</Button>
          </Link>
        </div>
      </div>

      {actors.length === 0 ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Ninguém por aqui ainda</CardTitle>
            <CardDescription>
              Crie um personagem jogador ou um NPC para começar.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Personagens dos jogadores ({pcs.length})
            </h2>
            {pcs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum PC ainda.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pcs.map((a) => (
                  <ActorCard key={a.id} actor={a} campaignId={id} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              NPCs ({npcs.length})
            </h2>
            {npcs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum NPC ainda.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {npcs.map((a) => (
                  <ActorCard key={a.id} actor={a} campaignId={id} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
