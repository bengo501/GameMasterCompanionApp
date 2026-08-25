import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { loadCampaign } from "@/lib/campaigns/context";
import { getScene, updateScene } from "@/lib/scenes/actions";
import { SCENE_STATUS_LABELS, SCENE_STATUSES } from "@/lib/scenes/constants";

export default async function EditScenePage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string; sceneId: string }>;
}) {
  const { id, sessionId, sceneId } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const scene = await getScene(sessionId, sceneId);
  if (!scene) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Editar cena</h1>
      <form action={updateScene} className="max-w-2xl space-y-5">
        <input type="hidden" name="id" value={scene.id} />
        <input type="hidden" name="campaignId" value={id} />
        <input type="hidden" name="sessionId" value={sessionId} />

        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input id="title" name="title" required defaultValue={scene.title} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="order">Ordem</Label>
            <Input
              id="order"
              name="order"
              type="number"
              defaultValue={scene.order}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={scene.status}>
              {SCENE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {SCENE_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Resumo</Label>
          <Textarea
            id="summary"
            name="summary"
            rows={4}
            defaultValue={scene.summary ?? ""}
          />
        </div>

        <Button type="submit">Salvar cena</Button>
      </form>
    </div>
  );
}
