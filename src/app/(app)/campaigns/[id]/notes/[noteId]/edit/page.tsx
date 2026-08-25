import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { NoteForm } from "@/components/note-form";
import { loadCampaign } from "@/lib/campaigns/context";
import { getNote, updateNote } from "@/lib/notes/actions";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string; noteId: string }>;
}) {
  const { id, noteId } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const note = await getNote(id, noteId);
  if (!note) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Editar nota</h1>
      <NoteForm action={updateNote} campaignId={id} note={note} />
    </div>
  );
}
