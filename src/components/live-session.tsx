"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { DiceRoller } from "@/components/dice-roller";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { coerceSheet } from "@/lib/actors/sheet";
import {
  nextTurn,
  updateCombatant,
} from "@/lib/combat/actions";
import {
  quickAddLocation,
  quickAddNote,
  quickAddNpc,
} from "@/lib/live/actions";
import { setSceneStatus } from "@/lib/scenes/actions";
import { SCENE_STATUS_LABELS } from "@/lib/scenes/constants";
import { setSessionStatus } from "@/lib/sessions/actions";
import { SESSION_STATUS_LABELS } from "@/lib/sessions/constants";
import type {
  Actor,
  Combatant,
  Encounter,
  GameSession,
  Note,
  Scene,
} from "@/lib/db/schema";
import type { RollMacro, SystemTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

type SessionOption = {
  id: string;
  title: string;
  status: GameSession["status"];
};

export function LiveSession({
  campaignId,
  template,
  sessions,
  currentSession,
  scenes,
  encounter,
  combatants,
  actors,
  notes,
  macros,
}: {
  campaignId: string;
  template: SystemTemplate;
  sessions: SessionOption[];
  currentSession: GameSession | null;
  scenes: Scene[];
  encounter: Encounter | null;
  combatants: Combatant[];
  actors: Actor[];
  notes: Note[];
  macros: RollMacro[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<void>) => startTransition(() => void fn());

  const sceneList = scenes;

  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [currentSession?.id]);

  const [npcName, setNpcName] = useState("");
  const [locName, setLocName] = useState("");
  const [noteBody, setNoteBody] = useState("");

  const hpKey = template.combat?.healthResource;
  const scene =
    sceneList.length > 0
      ? sceneList[Math.min(idx, sceneList.length - 1)]
      : null;

  function pcHp(actor: Actor): string | null {
    if (!hpKey) return null;
    const sheet = coerceSheet(actor.sheet, template);
    const r = sheet.resources[hpKey];
    if (!r) return null;
    const cur = r.current ?? r.value ?? r.max ?? 0;
    return r.max != null ? `${cur}/${r.max}` : `${cur}`;
  }

  const pcs = actors.filter((a) => a.kind === "pc");

  return (
    <div className="space-y-4">
      {/* Seletor de sessão */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-5">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma sessão.{" "}
              <Link
                href={`/campaigns/${campaignId}/sessions/new`}
                className="text-primary hover:underline"
              >
                Crie uma
              </Link>{" "}
              para usar o modo ao vivo.
            </p>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">Sessão:</span>
              <Select
                className="w-auto"
                value={currentSession?.id ?? ""}
                onChange={(e) =>
                  router.push(
                    `/campaigns/${campaignId}/live?session=${e.target.value}`,
                  )
                }
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} · {SESSION_STATUS_LABELS[s.status]}
                  </option>
                ))}
              </Select>
              {currentSession && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    run(() =>
                      setSessionStatus(
                        currentSession.id,
                        currentSession.status === "running" ? "done" : "running",
                      ),
                    )
                  }
                >
                  {currentSession.status === "running"
                    ? "Encerrar sessão"
                    : "Iniciar sessão"}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Cena atual */}
        <Card>
          <CardHeader>
            <CardTitle>Cena atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!currentSession ? (
              <p className="text-sm text-muted-foreground">
                Selecione uma sessão.
              </p>
            ) : sceneList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Esta sessão não tem cenas.{" "}
                <Link
                  href={`/campaigns/${campaignId}/sessions/${currentSession.id}`}
                  className="text-primary hover:underline"
                >
                  Adicionar
                </Link>
              </p>
            ) : (
              scene && (
                <>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={idx <= 0}
                      onClick={() => setIdx((i) => Math.max(0, i - 1))}
                      aria-label="Cena anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Cena {idx + 1} de {sceneList.length}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={idx >= sceneList.length - 1}
                      onClick={() =>
                        setIdx((i) => Math.min(sceneList.length - 1, i + 1))
                      }
                      aria-label="Próxima cena"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{scene.title}</h3>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {SCENE_STATUS_LABELS[scene.status]}
                    </span>
                  </div>
                  {scene.summary && (
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {scene.summary}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      run(() =>
                        setSceneStatus(
                          scene.id,
                          scene.status === "done" ? "planned" : "done",
                        ),
                      )
                    }
                  >
                    {scene.status === "done"
                      ? "Marcar como prevista"
                      : "Marcar como jogada"}
                  </Button>
                </>
              )
            )}
          </CardContent>
        </Card>

        {/* Combate */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Combate</CardTitle>
              {encounter && (
                <Link
                  href={`/campaigns/${campaignId}/encounters/${encounter.id}`}
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  abrir
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!encounter ? (
              <p className="text-sm text-muted-foreground">
                Sem encontro ativo.{" "}
                <Link
                  href={`/campaigns/${campaignId}/encounters/new`}
                  className="text-primary hover:underline"
                >
                  Criar
                </Link>
              </p>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{encounter.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Rodada {encounter.round}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    className="ml-auto"
                    disabled={pending || combatants.length === 0}
                    onClick={() => run(() => nextTurn(encounter.id))}
                  >
                    Próximo turno
                  </Button>
                </div>
                {combatants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum combatente.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {combatants.map((c) => {
                      const active = c.id === encounter.activeCombatantId;
                      const hasHp =
                        c.hpCurrent !== null || c.hpMax !== null;
                      return (
                        <div
                          key={c.id}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-1 text-sm",
                            active && "bg-primary/10",
                          )}
                        >
                          <span className="w-6 text-center tabular-nums text-muted-foreground">
                            {c.initiative}
                          </span>
                          <span className="flex-1 truncate">{c.name}</span>
                          {hasHp && (
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={pending}
                                onClick={() =>
                                  run(() =>
                                    updateCombatant(c.id, {
                                      hpCurrent:
                                        (c.hpCurrent ?? c.hpMax ?? 0) - 1,
                                    }),
                                  )
                                }
                              >
                                −
                              </Button>
                              <span className="w-12 text-center tabular-nums">
                                {c.hpCurrent ?? c.hpMax ?? 0}/{c.hpMax ?? "—"}
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Dados */}
        <Card>
          <CardHeader>
            <CardTitle>Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <DiceRoller campaignId={campaignId} macros={macros} />
          </CardContent>
        </Card>

        {/* Criação rápida + jogadores */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Criação rápida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="NPC rápido"
                  value={npcName}
                  onChange={(e) => setNpcName(e.target.value)}
                />
                <Button
                  type="button"
                  disabled={pending || !npcName.trim()}
                  onClick={() => {
                    run(() => quickAddNpc(campaignId, npcName));
                    setNpcName("");
                  }}
                >
                  + NPC
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Local rápido"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                />
                <Button
                  type="button"
                  disabled={pending || !locName.trim()}
                  onClick={() => {
                    run(() => quickAddLocation(campaignId, locName));
                    setLocName("");
                  }}
                >
                  + Local
                </Button>
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Nota rápida…"
                  rows={2}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                />
                <Button
                  type="button"
                  disabled={pending || !noteBody.trim()}
                  onClick={() => {
                    run(() => quickAddNote(campaignId, noteBody));
                    setNoteBody("");
                  }}
                >
                  + Nota
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jogadores</CardTitle>
            </CardHeader>
            <CardContent>
              {pcs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum personagem jogador.
                </p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {pcs.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between"
                    >
                      <Link
                        href={`/campaigns/${campaignId}/actors/${a.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {a.name}
                      </Link>
                      {pcHp(a) && (
                        <span className="tabular-nums text-muted-foreground">
                          {pcHp(a)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notas recentes */}
      {notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notas recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {notes.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/campaigns/${campaignId}/notes/${n.id}/edit`}
                    className="hover:text-primary"
                  >
                    <span className="font-medium">
                      {n.title || "Sem título"}:{" "}
                    </span>
                    <span className="text-muted-foreground">
                      {n.body.slice(0, 80)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
