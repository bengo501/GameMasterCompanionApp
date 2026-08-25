import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { SheetRenderer } from "@/components/sheet-renderer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteActor, getActor } from "@/lib/actors/actions";
import {
  ACTOR_KIND_LABELS,
  ACTOR_NARRATIVE_FIELDS,
  ACTOR_NARRATIVE_LABELS,
} from "@/lib/actors/constants";
import { coerceSheet } from "@/lib/actors/sheet";
import { loadCampaign } from "@/lib/campaigns/context";

export default async function ActorPage({
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

  const tpl = ctx.campaign.systemSnapshot;
  const sheet = coerceSheet(actor.sheet, tpl);
  const data = actor.data as Record<string, unknown>;
  const narrative = ACTOR_NARRATIVE_FIELDS.map((f) => ({
    key: f,
    label: ACTOR_NARRATIVE_LABELS[f],
    value: typeof data[f] === "string" ? (data[f] as string) : "",
  })).filter((x) => x.value);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{actor.name}</h1>
            <span className="rounded bg-muted px-2 py-0.5 text-xs">
              {ACTOR_KIND_LABELS[actor.kind]}
            </span>
          </div>
          <p className="text-muted-foreground">
            {[actor.concept, actor.playerName && `Jogador: ${actor.playerName}`]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/campaigns/${id}/actors/${actor.id}/edit`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteActor.bind(null, id, actor.id)}>
            <Button variant="ghost" type="submit">
              Excluir
            </Button>
          </form>
        </div>
      </div>

      {actor.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">
            {actor.description}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ficha</CardTitle>
        </CardHeader>
        <CardContent>
          <SheetRenderer template={tpl} sheet={sheet} />
        </CardContent>
      </Card>

      {narrative.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Narrativa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {narrative.map((n) => (
              <div key={n.key}>
                <div className="font-medium">{n.label}</div>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {n.value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {actor.notes && (
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle>Notas do mestre</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
            {actor.notes}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
