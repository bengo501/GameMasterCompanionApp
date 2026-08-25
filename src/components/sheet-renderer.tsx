import type { ActorSheet } from "@/lib/actors/sheet";
import { tryEvalFormula } from "@/lib/templates/formula";
import type { SystemTemplate } from "@/lib/templates";

function fmtMod(n: number | null): string {
  if (n === null) return "";
  return n >= 0 ? `+${n}` : `${n}`;
}

/** Ficha em modo leitura, gerada a partir do template. */
export function SheetRenderer({
  template,
  sheet,
}: {
  template: SystemTemplate;
  sheet: ActorSheet;
}) {
  const attrMod = (key: string): number | null => {
    const a = template.attributes.find((x) => x.key === key);
    if (!a?.derived?.mod) return null;
    return tryEvalFormula(a.derived.mod, { value: sheet.attributes[key] ?? 0 });
  };

  return (
    <div className="space-y-5">
      {template.attributes.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Atributos
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {template.attributes.map((a) => {
              const val = sheet.attributes[a.key] ?? a.default ?? 0;
              const mod = attrMod(a.key);
              return (
                <div
                  key={a.key}
                  className="rounded-lg border border-border p-2 text-center"
                >
                  <div className="text-xs text-muted-foreground">{a.label}</div>
                  <div className="text-lg font-bold">{val}</div>
                  {mod !== null && (
                    <div className="text-xs text-muted-foreground">
                      {fmtMod(mod)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {template.resources.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recursos
          </h3>
          <div className="flex flex-wrap gap-2">
            {template.resources.map((r) => {
              const rv = sheet.resources[r.key] ?? {};
              const display =
                r.track === "current_max"
                  ? `${rv.current ?? 0} / ${rv.max ?? 0}`
                  : r.track === "counter"
                    ? `${rv.current ?? 0}`
                    : `${rv.value ?? 0}`;
              return (
                <div
                  key={r.key}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm"
                >
                  <span className="text-muted-foreground">{r.label}: </span>
                  <span className="font-semibold">{display}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {template.skills.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Perícias
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
            {template.skills.map((s) => {
              const mod = s.attribute ? attrMod(s.attribute) : null;
              return (
                <div key={s.key} className="flex justify-between text-sm">
                  <span>{s.label}</span>
                  {mod !== null && (
                    <span className="text-muted-foreground">{fmtMod(mod)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
