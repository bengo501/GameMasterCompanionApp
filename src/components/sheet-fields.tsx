"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActorSheet } from "@/lib/actors/sheet";
import { tryEvalFormula } from "@/lib/templates/formula";
import type { SystemTemplate } from "@/lib/templates";

/** Campos de ficha editáveis, gerados a partir do template. */
export function SheetFields({
  template,
  sheet,
}: {
  template: SystemTemplate;
  sheet: ActorSheet;
}) {
  const [attrs, setAttrs] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const a of template.attributes)
      init[a.key] = sheet.attributes[a.key] ?? a.default ?? 10;
    return init;
  });

  return (
    <div className="space-y-5">
      {template.attributes.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Atributos</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {template.attributes.map((a) => {
              const mod = a.derived?.mod
                ? tryEvalFormula(a.derived.mod, { value: attrs[a.key] ?? 0 })
                : null;
              return (
                <div key={a.key} className="space-y-1">
                  <Label htmlFor={`attr.${a.key}`}>
                    {a.label}
                    {mod !== null && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({mod >= 0 ? "+" : ""}
                        {mod})
                      </span>
                    )}
                  </Label>
                  <Input
                    id={`attr.${a.key}`}
                    name={`attr.${a.key}`}
                    type="number"
                    value={attrs[a.key]}
                    onChange={(e) =>
                      setAttrs((s) => ({ ...s, [a.key]: Number(e.target.value) }))
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {template.resources.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Recursos</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {template.resources.map((r) => {
              const rv = sheet.resources[r.key] ?? {};
              if (r.track === "current_max") {
                return (
                  <div key={r.key} className="space-y-1">
                    <Label>{r.label}</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        name={`res.${r.key}.current`}
                        type="number"
                        defaultValue={rv.current ?? 0}
                        aria-label={`${r.label} atual`}
                      />
                      <span className="text-muted-foreground">/</span>
                      <Input
                        name={`res.${r.key}.max`}
                        type="number"
                        defaultValue={rv.max ?? 0}
                        aria-label={`${r.label} máximo`}
                      />
                    </div>
                  </div>
                );
              }
              const field = r.track === "counter" ? "current" : "value";
              return (
                <div key={r.key} className="space-y-1">
                  <Label htmlFor={`res.${r.key}.${field}`}>{r.label}</Label>
                  <Input
                    id={`res.${r.key}.${field}`}
                    name={`res.${r.key}.${field}`}
                    type="number"
                    defaultValue={
                      field === "current" ? (rv.current ?? 0) : (rv.value ?? 0)
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
