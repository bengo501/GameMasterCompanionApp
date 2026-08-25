import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { LiveSession } from "@/components/live-session";
import { listActors } from "@/lib/actors/actions";
import { loadCampaign } from "@/lib/campaigns/context";
import { listCombatants, listEncounters } from "@/lib/combat/actions";
import { listNotes } from "@/lib/notes/actions";
import { listScenes } from "@/lib/scenes/actions";
import { listSessions } from "@/lib/sessions/actions";

export default async function LivePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const template = ctx.campaign.systemSnapshot;
  const [sessions, actorList, noteRows, encounterList] = await Promise.all([
    listSessions(id),
    listActors(id),
    listNotes(id),
    listEncounters(id),
  ]);

  const current =
    (sp.session ? sessions.find((s) => s.id === sp.session) : undefined) ??
    sessions.find((s) => s.status === "running") ??
    sessions[0] ??
    null;

  const scenes = current ? await listScenes(current.id) : [];

  const encounter =
    encounterList.find((e) => e.status === "active") ?? encounterList[0] ?? null;
  const combatants = encounter ? await listCombatants(encounter.id) : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Sessão ao Vivo</h1>
      <LiveSession
        campaignId={id}
        template={template}
        sessions={sessions.map((s) => ({
          id: s.id,
          title: s.title,
          status: s.status,
        }))}
        currentSession={current}
        scenes={scenes}
        encounter={encounter}
        combatants={combatants}
        actors={actorList}
        notes={noteRows.slice(0, 6)}
        macros={template.rolls.macros}
      />
    </div>
  );
}
