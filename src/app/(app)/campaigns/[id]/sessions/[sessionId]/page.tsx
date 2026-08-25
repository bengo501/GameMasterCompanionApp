import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { loadCampaign } from "@/lib/campaigns/context";
import { createScene, deleteScene, listScenes } from "@/lib/scenes/actions";
import { SCENE_STATUS_LABELS, SCENE_STATUSES } from "@/lib/scenes/constants";
import { deleteSession, getSession } from "@/lib/sessions/actions";
import { SESSION_STATUS_LABELS } from "@/lib/sessions/constants";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const session = await getSession(id, sessionId);
  if (!session) notFound();

  const scenes = await listScenes(sessionId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {session.title}
            </h1>
            <span className="rounded bg-muted px-2 py-0.5 text-xs">
              {SESSION_STATUS_LABELS[session.status]}
            </span>
          </div>
          <p className="text-muted-foreground">
            {session.sessionDate ?? "Sem data"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/campaigns/${id}/sessions/${session.id}/edit`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <form action={deleteSession.bind(null, id, session.id)}>
            <Button variant="ghost" type="submit">
              Excluir
            </Button>
          </form>
        </div>
      </div>

      {session.plannedSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo planejado</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">
            {session.plannedSummary}
          </CardContent>
        </Card>
      )}

      {session.actualSummary && (
        <Card>
          <CardHeader>
            <CardTitle>O que aconteceu</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">
            {session.actualSummary}
          </CardContent>
        </Card>
      )}

      {session.gmNotes && (
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle>Notas do mestre</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
            {session.gmNotes}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cenas ({scenes.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scenes.length > 0 && (
            <div className="space-y-2">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      #{scene.order}
                    </span>
                    <span className="font-medium">{scene.title}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {SCENE_STATUS_LABELS[scene.status]}
                    </span>
                    <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                      <Link
                        href={`/campaigns/${id}/sessions/${sessionId}/scenes/${scene.id}/edit`}
                        className="hover:text-foreground hover:underline"
                      >
                        editar
                      </Link>
                      <form
                        action={deleteScene.bind(null, id, sessionId, scene.id)}
                      >
                        <button type="submit" className="hover:text-red-500">
                          excluir
                        </button>
                      </form>
                    </div>
                  </div>
                  {scene.summary && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {scene.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <form
            action={createScene}
            className="space-y-2 rounded-lg border border-dashed border-border p-3"
          >
            <input type="hidden" name="campaignId" value={id} />
            <input type="hidden" name="sessionId" value={sessionId} />
            <Input name="title" placeholder="Título da nova cena" required />
            <Textarea name="summary" placeholder="Resumo (opcional)" rows={2} />
            <div className="flex items-center gap-2">
              <Input
                name="order"
                type="number"
                defaultValue={scenes.length}
                className="w-20"
                aria-label="Ordem"
              />
              <Select name="status" defaultValue="planned" className="w-40">
                {SCENE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {SCENE_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
              <Button type="submit">Adicionar cena</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
