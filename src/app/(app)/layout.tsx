import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { GlobalSearch } from "@/components/global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configured = isSupabaseConfigured();
  const user = configured ? await getUser() : null;

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-6">
          <GlobalSearch />
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {user.email}
                </span>
                <form action={signOut}>
                  <Button variant="ghost" size="sm" type="submit">
                    Sair
                  </Button>
                </form>
              </>
            ) : configured ? (
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
            ) : null}
            <ThemeToggle />
          </div>
        </header>

        {!configured && (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-6 py-2 text-sm text-amber-700 dark:text-amber-300">
            Supabase ainda não configurado — preencha <code>.env.local</code>{" "}
            para ativar login e persistência.{" "}
            <span className="font-medium">(modo demo)</span>
          </div>
        )}

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
