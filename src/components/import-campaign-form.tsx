"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { importCampaign } from "@/lib/campaigns/import-actions";

export function ImportCampaignForm() {
  const [state, formAction, pending] = useActionState(importCampaign, undefined);
  const [text, setText] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setText(await file.text());
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Arquivo .json da campanha</Label>
        <input
          id="file"
          type="file"
          accept="application/json,.json"
          onChange={onFile}
          className="block text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-transparent file:px-3 file:py-1.5 file:text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payload">…ou cole o JSON aqui</Label>
        <Textarea
          id="payload"
          name="payload"
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='{ "format": "openmaster-campaign", ... }'
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <Button type="submit" disabled={pending || !text.trim()}>
        {pending ? "Importando…" : "Importar campanha"}
      </Button>
    </form>
  );
}
