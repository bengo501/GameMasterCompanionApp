"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ENCOUNTER_STATUS_LABELS,
  ENCOUNTER_STATUSES,
  type EncounterFormState,
} from "@/lib/combat/constants";
import type { Encounter } from "@/lib/db/schema";

type EncounterAction = (
  state: EncounterFormState,
  formData: FormData,
) => Promise<EncounterFormState>;

export function EncounterForm({
  action,
  campaignId,
  encounter,
}: {
  action: EncounterAction;
  campaignId: string;
  encounter?: Encounter;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <input type="hidden" name="campaignId" value={campaignId} />
      {encounter && <input type="hidden" name="id" value={encounter.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={encounter?.name ?? ""}
          placeholder="Ex.: Emboscada na estrada"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          name="status"
          defaultValue={encounter?.status ?? "planned"}
        >
          {ENCOUNTER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ENCOUNTER_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={encounter?.notes ?? ""}
          placeholder="Objetivo do encontro, ambiente, táticas…"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Salvando…"
          : encounter
            ? "Salvar alterações"
            : "Criar encontro"}
      </Button>
    </form>
  );
}
