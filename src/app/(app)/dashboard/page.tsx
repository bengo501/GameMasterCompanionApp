import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const cards = [
  { title: "Próxima sessão", desc: "Nenhuma sessão agendada ainda." },
  { title: "Resumo da última sessão", desc: "Você ainda não registrou sessões." },
  { title: "Personagens ativos", desc: "Nenhum personagem cadastrado." },
  { title: "NPCs importantes", desc: "Nenhum NPC cadastrado." },
  { title: "Missões abertas", desc: "Nenhuma missão em andamento." },
  { title: "Notas rápidas", desc: "Sem notas." },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel do Mestre</h1>
        <p className="text-muted-foreground">
          Visão geral da sua campanha. Os módulos chegam nos próximos marcos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader>
              <CardTitle>{c.title}</CardTitle>
              <CardDescription>{c.desc}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">—</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
