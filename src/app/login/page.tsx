"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) return;
    setLoading(true);
    setMsg(null);

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) return setMsg(error.message);
      if (data.session) {
        window.location.href = "/dashboard";
      } else {
        setMsg(
          "Conta criada! Se a confirmação de e-mail estiver ativa, confirme pelo link enviado. Senão, entre normalmente.",
        );
        setMode("signin");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) return setMsg(error.message);
    window.location.href = "/dashboard";
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            OpenMaster<span className="text-primary">-NarratorHelper</span>
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Entre para acessar suas campanhas."
              : "Crie sua conta de mestre."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <p className="text-sm text-muted-foreground">
              Configure o Supabase em <code>.env.local</code> para habilitar o
              login. Veja <code>docs/supabase-setup.md</code>.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Aguarde…"
                  : mode === "signin"
                    ? "Entrar"
                    : "Criar conta"}
              </Button>
              {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
              <button
                type="button"
                className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() =>
                  setMode((m) => (m === "signin" ? "signup" : "signin"))
                }
              >
                {mode === "signin"
                  ? "Não tem conta? Cadastre-se"
                  : "Já tem conta? Entrar"}
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
