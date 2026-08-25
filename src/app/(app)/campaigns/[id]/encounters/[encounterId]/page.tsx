import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { CombatTracker } from "@/components/combat-tracker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listActors } from "@/lib/actors/actions";
import { loadCampaign } from "@/lib/campaigns/context";
import {
  deleteEncounter,
  getEncounter,
  listCombatants,
} from "@/lib/combat/actions";
import { ENCOUNTER_STATUS_LABELS } from "@/lib/combat/constants";

export default async function EncounterPage({
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

  const [combatantList, actorList] = await Promise.all([
    listCombatants(encounterId),
    listActors(id),
  ]);

  const actorOptions = actorList.map((a) => ({
    id: a.id,
    name: a.name,
    kind: a.kind,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {encounter.name}
            </h1>
            <span className="rounded bg-muted px-2 py-0.5 text-xs">
              {ENCOUNTER_STATUS_LABELS[encounter.status]}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/campaigns/${id}/encounters/${encounter.id}/edit`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteEncounter.bind(null, id, encounter.id)}>
            <Button variant="ghost" type="submit">
              Excluir
            </Button>
          </form>
        </div>
      </div>

      {encounter.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
            {encounter.notes}
          </CardContent>
        </Card>
      )}

      <CombatTracker
        campaignId={id}
        encounter={encounter}
        combatants={combatantList}
        template={ctx.campaign.systemSnapshot}
        actors={actorOptions}
      />
    </div>
  );
}
