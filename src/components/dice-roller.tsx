"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rollDiceAction } from "@/lib/dice/actions";
import type { RollMacro } from "@/lib/templates";

const DICE = [4, 6, 8, 10, 12, 20, 100];

export function DiceRoller({
  campaignId,
  macros,
}: {
  campaignId: string;
  macros: RollMacro[];
}) {
  const [state, formAction, pending] = useActionState(rollDiceAction, undefined);
  const [modifier, setModifier] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [expression, setExpression] = useState("");

  function modSuffix() {
    if (modifier > 0) return `+${modifier}`;
    if (modifier < 0) return `${modifier}`;
    return "";
  }

  function dispatchRoll(expr: string, label?: string) {
    const fd = new FormData();
    fd.set("campaignId", campaignId);
    fd.set("expression", expr);
    if (label) fd.set("label", label);
    if (hidden) fd.set("hidden", "true");
    formAction(fd);
  }

  return (
    <div className="space-y-5">
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      {state?.outcome && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-4">
          <div className="text-sm text-muted-foreground">
            {state.outcome.expression}
          </div>
          <div className="text-4xl font-bold tabular-nums">
            {Math.round(state.outcome.total)}
          </div>
          {state.outcome.detail && (
            <div className="mt-1 text-xs text-muted-foreground">
              {state.outcome.detail}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {DICE.map((d) => (
          <Button
            key={d}
            variant="outline"
            type="button"
            disabled={pending}
            onClick={() => dispatchRoll(`1d${d}${modSuffix()}`, `d${d}`)}
          >
            d{d}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="mod">Modificador</Label>
          <Input
            id="mod"
            type="number"
            value={modifier}
            onChange={(e) => setModifier(Number(e.target.value) || 0)}
            className="w-24"
          />
        </div>
        <Button
          variant="outline"
          type="button"
          disabled={pending}
          onClick={() => dispatchRoll(`2d20kh1${modSuffix()}`, "Vantagem")}
        >
          Vantagem
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={pending}
          onClick={() => dispatchRoll(`2d20kl1${modSuffix()}`, "Desvantagem")}
        >
          Desvantagem
        </Button>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => setHidden(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Rolagem oculta
        </label>
      </div>

      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="campaignId" value={campaignId} />
        {hidden && <input type="hidden" name="hidden" value="true" />}
        <div className="min-w-48 flex-1 space-y-1">
          <Label htmlFor="expression">Expressão</Label>
          <Input
            id="expression"
            name="expression"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="2d6+3 · 4d6kh3 · 1d20+5"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="label">Rótulo (opcional)</Label>
          <Input id="label" name="label" className="w-40" placeholder="Ataque…" />
        </div>
        <Button type="submit" disabled={pending}>
          Rolar
        </Button>
      </form>

      {macros.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Macros do sistema</div>
          <div className="flex flex-wrap gap-2">
            {macros.map((m) => (
              <Button
                key={m.key}
                variant="ghost"
                type="button"
                disabled={pending}
                title={m.formula}
                onClick={() => dispatchRoll(m.formula, m.label)}
              >
                {m.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Variáveis do personagem (ex.: {"{attr.mod}"}) contam como 0 aqui — a
            rolagem a partir da ficha vem no combate (M5).
          </p>
        </div>
      )}
    </div>
  );
}
