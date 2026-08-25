"use client";

import { useActionState } from "react";
import { SheetFields } from "@/components/sheet-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTOR_KIND_LABELS,
  ACTOR_KINDS,
  ACTOR_NARRATIVE_FIELDS,
  ACTOR_NARRATIVE_LABELS,
  type ActorFormState,
  type ActorKindValue,
} from "@/lib/actors/constants";
import { coerceSheet, defaultSheetFor } from "@/lib/actors/sheet";
import type { Actor } from "@/lib/db/schema";
import type { SystemTemplate } from "@/lib/templates";

type ActorAction = (
  state: ActorFormState,
  formData: FormData,
) => Promise<ActorFormState>;

function dataStr(data: Record<string, unknown>, key: string): string {
  const v = data[key];
  return typeof v === "string" ? v : "";
}

export function ActorForm({
  action,
  campaignId,
  template,
  actor,
  defaultKind,
}: {
  action: ActorAction;
  campaignId: string;
  template: SystemTemplate;
  actor?: Actor;
  defaultKind?: ActorKindValue;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const sheet = actor
    ? coerceSheet(actor.sheet, template)
    : defaultSheetFor(template);
  const data = (actor?.data ?? {}) as Record<string, unknown>;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <input type="hidden" name="campaignId" value={campaignId} />
      {actor && <input type="hidden" name="id" value={actor.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" required defaultValue={actor?.name ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kind">Tipo</Label>
          <Select
            id="kind"
            name="kind"
            defaultValue={actor?.kind ?? defaultKind ?? "npc"}
          >
            {ACTOR_KINDS.map((k) => (
              <option key={k} value={k}>
                {ACTOR_KIND_LABELS[k]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="concept">Conceito</Label>
          <Input
            id="concept"
            name="concept"
            defaultValue={actor?.concept ?? ""}
            placeholder="Guerreiro taciturno, mercador ganancioso…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="playerName">Jogador (se PC)</Label>
          <Input
            id="playerName"
            name="playerName"
            defaultValue={actor?.playerName ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={actor?.description ?? ""}
          placeholder="Aparência, personalidade, jeito de falar…"
        />
      </div>

      <section className="rounded-xl border border-border p-4">
        <h2 className="mb-4 font-semibold">Ficha — {template.name}</h2>
        <SheetFields template={template} sheet={sheet} />
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">Narrativa</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ACTOR_NARRATIVE_FIELDS.map((f) => (
            <div key={f} className="space-y-2">
              <Label htmlFor={f}>{ACTOR_NARRATIVE_LABELS[f]}</Label>
              <Textarea
                id={f}
                name={f}
                rows={2}
                defaultValue={dataStr(data, f)}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas do mestre (ocultas)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={actor?.notes ?? ""}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Salvando…"
          : actor
            ? "Salvar alterações"
            : "Criar personagem"}
      </Button>
    </form>
  );
}
