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
import { listEncounters } from "@/lib/combat/actions";
import { ENCOUNTER_STATUS_LABELS } from "@/lib/combat/constants";
import { loadCampaign } from "@/lib/campaigns/context";

export default async function EncountersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const rows = await listEncounters(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Combate</h1>
          <p className="text-muted-foreground">
            Encontros e rastreador de iniciativa.
          </p>
        </div>
        <Link href={`/campaigns/${id}/encounters/new`}>
          <Button>Novo encontro</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Nenhum encontro ainda</CardTitle>
            <CardDescription>
              Crie um encontro para montar a iniciativa.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((e) => (
            <Link key={e.id} href={`/campaigns/${id}/encounters/${e.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle>{e.name}</CardTitle>
                  <CardDescription>
                    {ENCOUNTER_STATUS_LABELS[e.status]} · rodada {e.round}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
