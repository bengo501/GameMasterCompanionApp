import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { SessionForm } from "@/components/session-form";
import { loadCampaign } from "@/lib/campaigns/context";
import { getSession, updateSession } from "@/lib/sessions/actions";

export default async function EditSessionPage({
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Editar {session.title}
      </h1>
      <SessionForm action={updateSession} campaignId={id} session={session} />
    </div>
  );
}
