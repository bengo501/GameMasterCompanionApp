import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { NoteForm } from "@/components/note-form";
import { loadCampaign } from "@/lib/campaigns/context";
import { createNote } from "@/lib/notes/actions";

export default async function NewNotePage({
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
      <h1 className="text-2xl font-bold tracking-tight">Nova nota</h1>
      <NoteForm action={createNote} campaignId={id} />
    </div>
  );
}
