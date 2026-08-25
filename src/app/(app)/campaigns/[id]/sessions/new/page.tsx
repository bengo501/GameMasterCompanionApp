import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { SessionForm } from "@/components/session-form";
import { loadCampaign } from "@/lib/campaigns/context";
import { createSession } from "@/lib/sessions/actions";

export default async function NewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Nova sessão</h1>
      <SessionForm action={createSession} campaignId={id} />
    </div>
  );
}
