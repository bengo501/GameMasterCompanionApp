import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listActors } from "@/lib/actors/actions";
import { deleteCampaign } from "@/lib/campaigns/actions";
import { STATUS_LABELS } from "@/lib/campaigns/constants";
import { loadCampaign } from "@/lib/campaigns/context";
import { listEncounters } from "@/lib/combat/actions";
import { listLocations } from "@/lib/locations/actions";
import { listNotes } from "@/lib/notes/actions";
import { listSessions } from "@/lib/sessions/actions";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const campaign = ctx.campaign;
  const tpl = campaign.systemSnapshot;
  const [actors, locations, gameSessions, campaignNotes, campaignEncounters] =
    await Promise.all([
      listActors(id),
      listLocations(id),
      listSessions(id),
      listNotes(id),
      listEncounters(id),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {campaign.name}
            </h1>
            <span className="rounded bg-muted px-2 py-0.5 text-xs">
              {STATUS_LABELS[campaign.status]}
            </span>
          </div>
          <p className="text-muted-foreground">
            {[campaign.genre, campaign.tone, campaign.setting]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/campaigns/${campaign.id}/export`}
            className={buttonVariants({ variant: "outline" })}
          >
            Exportar
          </a>
          <Link href={`/campaigns/${campaign.id}/edit`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteCampaign.bind(null, campaign.id)}>
            <Button variant="ghost" type="submit">
              Excluir
            </Button>
          </form>
        </div>
      </div>

      {campaign.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">
            {campaign.description}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href={`/campaigns/${id}/actors`}>
          <Card className="h-full transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle>Personagens & NPCs</CardTitle>
              <CardDescription>{actors.length} cadastrado(s)</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href={`/campaigns/${id}/locations`}>
          <Card className="h-full transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle>Locais</CardTitle>
              <CardDescription>{locations.length} cadastrado(s)</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href={`/campaigns/${id}/sessions`}>
          <Card className="h-full transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle>Sessões</CardTitle>
              <CardDescription>
                {gameSessions.length} registrada(s)
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href={`/campaigns/${id}/encounters`}>
          <Card className="h-full transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle>Combate</CardTitle>
              <CardDescription>
                {campaignEncounters.length} encontro(s)
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href={`/campaigns/${id}/notes`}>
          <Card className="h-full transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle>Notas</CardTitle>
              <CardDescription>{campaignNotes.length} nota(s)</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistema: {tpl.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            {tpl.attributes.map((a) => (
              <span
                key={a.key}
                className="rounded bg-muted px-2 py-0.5 text-xs"
              >
                {a.label}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground">
            Rolagem base: <code>{tpl.rolls.default.formula}</code> ({tpl.kind})
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
