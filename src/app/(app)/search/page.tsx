import Link from "next/link";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ACTOR_KIND_LABELS } from "@/lib/actors/constants";
import { getUser } from "@/lib/auth";
import { searchAll } from "@/lib/search";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Hit = { href: string; primary: string; secondary?: string };

function ResultGroup({ title, hits }: { title: string; hits: Hit[] }) {
  if (hits.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {title} ({hits.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {hits.map((h) => (
          <Link
            key={h.href}
            href={h.href}
            className="flex items-center justify-between gap-3 py-2 text-sm hover:text-primary"
          >
            <span>{h.primary}</span>
            {h.secondary && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {h.secondary}
              </span>
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!isSupabaseConfigured()) return <DemoNotice />;
  const user = await getUser();
  if (!user) return <LoginNotice />;

  const q = ((await searchParams).q ?? "").trim();

  if (!q) {
    return (
      <p className="text-muted-foreground">
        Digite um termo na busca global, no topo.
      </p>
    );
  }

  const res = await searchAll(q);
  const name = (cid: string) => res.campaignNames.get(cid) ?? "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Resultados para “{q}”
        </h1>
        <p className="text-muted-foreground">
          {res.total} resultado(s) nas suas campanhas.
        </p>
      </div>

      {res.total === 0 ? (
        <p className="text-muted-foreground">Nada encontrado.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ResultGroup
            title="Campanhas"
            hits={res.campaigns.map((c) => ({
              href: `/campaigns/${c.id}`,
              primary: c.name,
            }))}
          />
          <ResultGroup
            title="Personagens & NPCs"
            hits={res.actors.map((a) => ({
              href: `/campaigns/${a.campaignId}/actors/${a.id}`,
              primary: `${a.name} · ${ACTOR_KIND_LABELS[a.kind]}`,
              secondary: name(a.campaignId),
            }))}
          />
          <ResultGroup
            title="Locais"
            hits={res.locations.map((l) => ({
              href: `/campaigns/${l.campaignId}/locations/${l.id}/edit`,
              primary: l.name,
              secondary: name(l.campaignId),
            }))}
          />
          <ResultGroup
            title="Sessões"
            hits={res.sessions.map((s) => ({
              href: `/campaigns/${s.campaignId}/sessions/${s.id}`,
              primary: s.title,
              secondary: name(s.campaignId),
            }))}
          />
          <ResultGroup
            title="Notas"
            hits={res.notes.map((n) => ({
              href: `/campaigns/${n.campaignId}/notes/${n.id}/edit`,
              primary: n.title || n.body.slice(0, 60) || "Sem título",
              secondary: name(n.campaignId),
            }))}
          />
        </div>
      )}
    </div>
  );
}
