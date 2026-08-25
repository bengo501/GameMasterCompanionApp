"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Note } from "@/lib/db/schema";
import type { NoteFormState } from "@/lib/notes/constants";

type NoteAction = (
  state: NoteFormState,
  formData: FormData,
) => Promise<NoteFormState>;

export function NoteForm({
  action,
  campaignId,
  note,
}: {
  action: NoteAction;
  campaignId: string;
  note?: Note;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <input type="hidden" name="campaignId" value={campaignId} />
      {note && <input type="hidden" name="id" value={note.id} />}

      <div className="space-y-2">
        <Label htmlFor="title">Título (opcional)</Label>
        <Input id="title" name="title" defaultValue={note?.title ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Nota *</Label>
        <Textarea
          id="body"
          name="body"
          rows={10}
          required
          defaultValue={note?.body ?? ""}
          placeholder="Ideias, pendências, ganchos, lembretes…"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="pinned"
          value="true"
          defaultChecked={note?.pinned ?? false}
          className="h-4 w-4 rounded border-border"
        />
        Fixar no topo
      </label>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : note ? "Salvar alterações" : "Criar nota"}
      </Button>
    </form>
  );
}
