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
import type { Location } from "@/lib/db/schema";
import { deleteLocation, listLocations } from "@/lib/locations/actions";

type Node = Location & { children: Node[] };

function toTree(items: Location[]): Node[] {
  const map = new Map<string, Node>();
  for (const it of items) map.set(it.id, { ...it, children: [] });
  const roots: Node[] = [];
  for (const it of items) {
    const node = map.get(it.id)!;
    if (it.parentId && map.has(it.parentId)) {
      map.get(it.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function LocationNodes({
  nodes,
  campaignId,
  depth = 0,
}: {
  nodes: Node[];
  campaignId: string;
  depth?: number;
}) {
  return (
    <ul className={depth > 0 ? "ml-4 border-l border-border pl-4" : ""}>
      {nodes.map((n) => (
        <li key={n.id} className="py-1.5">
          <div className="flex items-center gap-2">
            <span className="font-medium">{n.name}</span>
            {n.type && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                {n.type}
              </span>
            )}
            <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
              <Link
                href={`/campaigns/${campaignId}/locations/new?parent=${n.id}`}
                className="hover:text-foreground hover:underline"
              >
                + filho
              </Link>
              <Link
                href={`/campaigns/${campaignId}/locations/${n.id}/edit`}
                className="hover:text-foreground hover:underline"
              >
                editar
              </Link>
              <form action={deleteLocation.bind(null, campaignId, n.id)}>
                <button type="submit" className="hover:text-red-500">
                  excluir
                </button>
              </form>
            </div>
          </div>
          {n.description && (
            <p className="text-sm text-muted-foreground">{n.description}</p>
          )}
          {n.children.length > 0 && (
            <LocationNodes
              nodes={n.children}
              campaignId={campaignId}
              depth={depth + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const locations = await listLocations(id);
  const tree = toTree(locations);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Locais</h1>
          <p className="text-muted-foreground">
            O mundo da campanha, em hierarquia.
          </p>
        </div>
        <Link href={`/campaigns/${id}/locations/new`}>
          <Button>Nova localização</Button>
        </Link>
      </div>

      {locations.length === 0 ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Mundo vazio</CardTitle>
            <CardDescription>
              Crie continentes, cidades, masmorras… e aninhe uns nos outros.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-5">
            <LocationNodes nodes={tree} campaignId={id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
