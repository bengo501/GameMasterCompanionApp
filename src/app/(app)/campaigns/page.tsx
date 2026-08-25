import Link from "next/link";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { listCampaigns } from "@/lib/campaigns/actions";
import { STATUS_LABELS } from "@/lib/campaigns/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function CampaignsPage() {
  if (!isSupabaseConfigured()) return <DemoNotice />;
  const user = await getUser();
  if (!user) return <LoginNotice />;

  const rows = await listCampaigns();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground">Suas mesas e mundos.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/campaigns/import">
            <Button variant="outline">Importar</Button>
          </Link>
          <Link href="/campaigns/new">
            <Button>Nova campanha</Button>
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Nenhuma campanha ainda</CardTitle>
            <CardDescription>
              Crie sua primeira campanha para começar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/campaigns/new">
              <Button>Criar campanha</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => (
            <Link key={c.id} href={`/campaigns/${c.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle>{c.name}</CardTitle>
                  <CardDescription>
                    {[c.genre, c.tone].filter(Boolean).join(" · ") ||
                      "Sem gênero definido"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="rounded bg-muted px-2 py-0.5 text-xs">
                    {STATUS_LABELS[c.status]}
                  </span>
                  <span className="text-xs">{c.systemSnapshot.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
