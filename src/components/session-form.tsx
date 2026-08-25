"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { GameSession } from "@/lib/db/schema";
import {
  SESSION_STATUS_LABELS,
  SESSION_STATUSES,
  type SessionFormState,
} from "@/lib/sessions/constants";

type SessionAction = (
  state: SessionFormState,
  formData: FormData,
) => Promise<SessionFormState>;

export function SessionForm({
  action,
  campaignId,
  session,
}: {
  action: SessionAction;
  campaignId: string;
  session?: GameSession;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <input type="hidden" name="campaignId" value={campaignId} />
      {session && <input type="hidden" name="id" value={session.id} />}

      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={session?.title ?? ""}
          placeholder="Ex.: Sessão 3 — A queda de Pedravale"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sessionDate">Data</Label>
          <Input
            id="sessionDate"
            name="sessionDate"
            type="date"
            defaultValue={session?.sessionDate ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={session?.status ?? "planned"}
          >
            {SESSION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {SESSION_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="plannedSummary">Resumo planejado</Label>
        <Textarea
          id="plannedSummary"
          name="plannedSummary"
          rows={4}
          defaultValue={session?.plannedSummary ?? ""}
          placeholder="O que você pretende que aconteça."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="actualSummary">O que aconteceu</Label>
        <Textarea
          id="actualSummary"
          name="actualSummary"
          rows={4}
          defaultValue={session?.actualSummary ?? ""}
          placeholder="Preencha depois da sessão."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gmNotes">Notas privadas do mestre</Label>
        <Textarea
          id="gmNotes"
          name="gmNotes"
          rows={3}
          defaultValue={session?.gmNotes ?? ""}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : session ? "Salvar alterações" : "Criar sessão"}
      </Button>
    </form>
  );
}
