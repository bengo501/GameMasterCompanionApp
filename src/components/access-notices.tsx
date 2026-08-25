import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DemoNotice() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Modo demo</CardTitle>
        <CardDescription>
          Este módulo precisa do banco de dados. Configure o Supabase em{" "}
          <code>.env.local</code> para criar e salvar campanhas.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Passo a passo em <code>docs/supabase-setup.md</code>.
      </CardContent>
    </Card>
  );
}

export function LoginNotice() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Entre para continuar</CardTitle>
        <CardDescription>
          Você precisa estar logado para acessar suas campanhas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/login">
          <Button>Ir para o login</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
