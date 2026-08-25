import { notFound } from "next/navigation";
import { DemoNotice, LoginNotice } from "@/components/access-notices";
import { DiceRoller } from "@/components/dice-roller";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loadCampaign } from "@/lib/campaigns/context";
import { clearRolls, listRolls } from "@/lib/dice/actions";

export default async function DicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await loadCampaign(id);
  if (ctx.status === "demo") return <DemoNotice />;
  if (ctx.status === "login") return <LoginNotice />;
  if (ctx.status === "notfound") notFound();

  const macros = ctx.campaign.systemSnapshot.rolls.macros;
  const rolls = await listRolls(id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rolador de dados</h1>
        <p className="text-muted-foreground">
          Sistema: {ctx.campaign.systemSnapshot.name}
        </p>
      </div>

      <Card>
        <CardContent className="pt-5">
          <DiceRoller campaignId={id} macros={macros} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico</CardTitle>
            {rolls.length > 0 && (
              <form action={clearRolls.bind(null, id)}>
                <Button variant="ghost" size="sm" type="submit">
                  Limpar
                </Button>
              </form>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {rolls.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma rolagem ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {rolls.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {r.label || r.expression}
                      </span>
                      {r.hidden && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          oculta
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {r.detail || r.expression}
                    </div>
                  </div>
                  <div className="text-2xl font-bold tabular-nums">
                    {r.total}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
