"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Location } from "@/lib/db/schema";
import {
  LOCATION_TYPE_SUGGESTIONS,
  type LocationFormState,
} from "@/lib/locations/constants";

type LocationAction = (
  state: LocationFormState,
  formData: FormData,
) => Promise<LocationFormState>;

export function LocationForm({
  action,
  campaignId,
  location,
  parents,
  defaultParentId,
}: {
  action: LocationAction;
  campaignId: string;
  location?: Location;
  parents: { id: string; name: string }[];
  defaultParentId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const currentParent = location?.parentId ?? defaultParentId ?? "";

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <input type="hidden" name="campaignId" value={campaignId} />
      {location && <input type="hidden" name="id" value={location.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={location?.name ?? ""}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Input
            id="type"
            name="type"
            list="location-types"
            defaultValue={location?.type ?? ""}
            placeholder="Cidade, masmorra…"
          />
          <datalist id="location-types">
            {LOCATION_TYPE_SUGGESTIONS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentId">Pertence a</Label>
          <Select id="parentId" name="parentId" defaultValue={currentParent}>
            <option value="">— (raiz)</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={location?.description ?? ""}
          placeholder="Atmosfera, perigos, rumores, segredos…"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Salvando…"
          : location
            ? "Salvar alterações"
            : "Criar localização"}
      </Button>
    </form>
  );
}
