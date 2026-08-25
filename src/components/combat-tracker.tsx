"use client";

import { ChevronRight, RotateCcw, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  addCombatantFromActor,
  addManualCombatant,
  nextTurn,
  removeCombatant,
  resetEncounter,
  rollAllInitiative,
  toggleCondition,
  updateCombatant,
} from "@/lib/combat/actions";
import { ENCOUNTER_STATUS_LABELS } from "@/lib/combat/constants";
import type { Combatant, Encounter } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { SystemTemplate } from "@/lib/templates";

type ActorOption = { id: string; name: string; kind: "pc" | "npc" };

export function CombatTracker({
  campaignId,
  encounter,
  combatants,
  template,
  actors,
}: {
  campaignId: string;
  encounter: Encounter;
  combatants: Combatant[];
  template: SystemTemplate;
  actors: ActorOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [actorId, setActorId] = useState(actors[0]?.id ?? "");
  const [mName, setMName] = useState("");
  const [mInit, setMInit] = useState("");
  const [mHp, setMHp] = useState("");

  const hpKey = template.combat?.healthResource;
  const defKey = template.combat?.defenseField;
  const hpLabel =
    template.resources.find((r) => r.key === hpKey)?.label ?? "PV";
  const defLabel =
    template.resources.find((r) => r.key === defKey)?.label ?? "Defesa";

  const run = (fn: () => Promise<void>) => startTransition(() => void fn());

  return (
    <div className="space-y-5">
      {/* Barra de turno */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
        <div className="text-lg font-bold">Rodada {encounter.round}</div>
        <span className="rounded bg-muted px-2 py-0.5 text-xs">
          {ENCOUNTER_STATUS_LABELS[encounter.status]}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={pending || combatants.length === 0}
            onClick={() => run(() => nextTurn(encounter.id))}
          >
            <ChevronRight className="h-4 w-4" /> Próximo turno
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending || combatants.length === 0}
            onClick={() => run(() => rollAllInitiative(encounter.id))}
          >
            Rolar iniciativas
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={pending || combatants.length === 0}
            onClick={() => run(() => resetEncounter(encounter.id))}
          >
            <RotateCcw className="h-4 w-4" /> Reiniciar
          </Button>
        </div>
      </div>

      {/* Lista de combatentes */}
      {combatants.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum combatente ainda. Adicione abaixo.
        </p>
      ) : (
        <div className="space-y-2">
          {combatants.map((c) => {
            const active = c.id === encounter.activeCombatantId;
            const hasHp = c.hpCurrent !== null || c.hpMax !== null;
            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-xl border p-3",
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border",
                )}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    type="number"
                    defaultValue={c.initiative}
                    aria-label="Iniciativa"
                    className="w-16 text-center"
                    onBlur={(e) =>
                      run(() =>
                        updateCombatant(c.id, {
                          initiative: Number(e.target.value) || 0,
                        }),
                      )
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {c.isPc ? "PC" : "NPC"}
                      </span>
                      {active && (
                        <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-primary-foreground">
                          turno
                        </span>
                      )}
                    </div>
                  </div>

                  {hasHp && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {hpLabel}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          run(() =>
                            updateCombatant(c.id, {
                              hpCurrent: (c.hpCurrent ?? c.hpMax ?? 0) - 1,
                            }),
                          )
                        }
                      >
                        −
                      </Button>
                      <span className="w-14 text-center tabular-nums">
                        {c.hpCurrent ?? c.hpMax ?? 0}
                        <span className="text-muted-foreground">
                          /{c.hpMax ?? "—"}
                        </span>
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          run(() =>
                            updateCombatant(c.id, {
                              hpCurrent: (c.hpCurrent ?? 0) + 1,
                            }),
                          )
                        }
                      >
                        +
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {defLabel}
                    </span>
                    <Input
                      type="number"
                      defaultValue={c.defense ?? ""}
                      aria-label={defLabel}
                      className="w-16 text-center"
                      onBlur={(e) =>
                        run(() =>
                          updateCombatant(c.id, {
                            defense:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          }),
                        )
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remover"
                    disabled={pending}
                    onClick={() => run(() => removeCombatant(c.id))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {template.conditions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.conditions.map((cond) => {
                      const on = c.conditions?.includes(cond.key);
                      return (
                        <button
                          key={cond.key}
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            run(() => toggleCondition(c.id, cond.key))
                          }
                          className={cn(
                            "rounded px-2 py-0.5 text-xs transition-colors",
                            on
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                              : "bg-muted text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {cond.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Adicionar combatentes */}
      <div className="grid gap-3 rounded-xl border border-dashed border-border p-3 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-medium">A partir de um personagem</div>
          {actors.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhum personagem na campanha.
            </p>
          ) : (
            <div className="flex gap-2">
              <Select
                value={actorId}
                onChange={(e) => setActorId(e.target.value)}
                aria-label="Personagem"
              >
                {actors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.kind === "pc" ? "PC" : "NPC"})
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                disabled={pending || !actorId}
                onClick={() =>
                  run(() => addCombatantFromActor(encounter.id, actorId))
                }
              >
                Adicionar
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            A iniciativa é rolada a partir da ficha ({template.combat?.initiative ?? "—"}).
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Manual</div>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Nome"
              value={mName}
              onChange={(e) => setMName(e.target.value)}
              className="min-w-32 flex-1"
            />
            <Input
              type="number"
              placeholder="Init"
              value={mInit}
              onChange={(e) => setMInit(e.target.value)}
              className="w-20"
              aria-label="Iniciativa"
            />
            <Input
              type="number"
              placeholder={hpLabel}
              value={mHp}
              onChange={(e) => setMHp(e.target.value)}
              className="w-20"
              aria-label={hpLabel}
            />
            <Button
              type="button"
              disabled={pending || !mName.trim()}
              onClick={() => {
                run(() =>
                  addManualCombatant(
                    encounter.id,
                    mName,
                    Number(mInit) || 0,
                    mHp === "" ? null : Number(mHp),
                  ),
                );
                setMName("");
                setMInit("");
                setMHp("");
              }}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
