"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Campaign } from "@/lib/db/schema";
import {
  CAMPAIGN_STATUSES,
  STATUS_LABELS,
  type CampaignFormState,
} from "@/lib/campaigns/constants";

type CampaignAction = (
  state: CampaignFormState,
  formData: FormData,
) => Promise<CampaignFormState>;

type TemplateOption = { key: string; name: string };

export function CampaignForm({
  action,
  templates,
  campaign,
}: {
  action: CampaignAction;
  templates: TemplateOption[];
  campaign?: Campaign;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isEdit = Boolean(campaign);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {isEdit && <input type="hidden" name="id" defaultValue={campaign!.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">Nome da campanha *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={campaign?.name ?? ""}
          placeholder="Ex.: As Sombras de Valdoria"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="systemKey">Sistema</Label>
          {isEdit ? (
            <Input
              id="systemKey"
              defaultValue={
                templates.find((t) => t.key === campaign!.systemKey)?.name ??
                campaign!.systemKey
              }
              disabled
            />
          ) : (
            <Select id="systemKey" name="systemKey" defaultValue={templates[0]?.key}>
              {templates.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.name}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={campaign?.status ?? "planning"}
          >
            {CAMPAIGN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="genre">Gênero</Label>
          <Input
            id="genre"
            name="genre"
            defaultValue={campaign?.genre ?? ""}
            placeholder="Fantasia, terror, sci-fi…"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Tom</Label>
          <Input
            id="tone"
            name="tone"
            defaultValue={campaign?.tone ?? ""}
            placeholder="Heroico, sombrio, cômico…"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="setting">Cenário / Mundo</Label>
        <Input
          id="setting"
          name="setting"
          defaultValue={campaign?.setting ?? ""}
          placeholder="Onde a campanha se passa"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={campaign?.description ?? ""}
          placeholder="Resumo da premissa, ganchos, expectativas…"
          rows={5}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando…"
            : isEdit
              ? "Salvar alterações"
              : "Criar campanha"}
        </Button>
      </div>
    </form>
  );
}
