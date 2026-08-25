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
import { deleteNote, listNotes } from "@/lib/notes/actions";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const rows = await listNotes(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas</h1>
          <p className="text-muted-foreground">
            Ideias soltas, pendências e lembretes da campanha.
          </p>
        </div>
        <Link href={`/campaigns/${id}/notes/new`}>
          <Button>Nova nota</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Sem notas ainda</CardTitle>
            <CardDescription>Anote a primeira ideia.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((n) => {
            const editHref = `/campaigns/${id}/notes/${n.id}/edit`;
            return (
              <Card key={n.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      <Link href={editHref} className="hover:underline">
                        {n.title || "Sem título"}
                      </Link>
                    </CardTitle>
                    {n.pinned && (
                      <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-primary">
                        Fixada
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                    {n.body}
                  </p>
                  <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                    <Link href={editHref} className="hover:text-foreground hover:underline">
                      editar
                    </Link>
                    <form action={deleteNote.bind(null, id, n.id)}>
                      <button type="submit" className="hover:text-red-500">
                        excluir
                      </button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
