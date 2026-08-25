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
import { loadCampaign } from "@/lib/campaigns/context";
import { listSessions } from "@/lib/sessions/actions";
import { SESSION_STATUS_LABELS } from "@/lib/sessions/constants";

export default async function SessionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const rows = await listSessions(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sessões</h1>
          <p className="text-muted-foreground">
            Planejado vs. o que aconteceu, com cenas.
          </p>
        </div>
        <Link href={`/campaigns/${id}/sessions/new`}>
          <Button>Nova sessão</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Nenhuma sessão ainda</CardTitle>
            <CardDescription>
              Crie a primeira sessão para planejar suas cenas.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((s) => (
            <Link key={s.id} href={`/campaigns/${id}/sessions/${s.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle>{s.title}</CardTitle>
                  <CardDescription>
                    {s.sessionDate ?? "Sem data"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">
                    {SESSION_STATUS_LABELS[s.status]}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
