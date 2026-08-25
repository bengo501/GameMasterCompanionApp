"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Dices,
  LayoutDashboard,
  MapPin,
  ScrollText,
  Swords,
  Theater,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, ready: true },
  { href: "/campaigns", label: "Campanhas", icon: BookOpen, ready: true },
  { href: "/actors", label: "Personagens & NPCs", icon: Users, ready: false },
  { href: "/locations", label: "Locais", icon: MapPin, ready: false },
  { href: "/sessions", label: "Sessões", icon: ScrollText, ready: false },
  { href: "/combat", label: "Combate", icon: Swords, ready: false },
  { href: "/dice", label: "Dados", icon: Dices, ready: false },
  { href: "/live", label: "Sessão ao Vivo", icon: Theater, ready: false },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card/40">
      <div className="flex h-14 items-center border-b border-border px-5">
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight">OpenMaster</div>
          <div className="text-xs font-medium text-primary">
            NarratorHelper
          </div>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          if (!item.ready) {
            return (
              <span
                key={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/60"
                aria-disabled="true"
              >
                <Icon className="h-4 w-4" />
                {item.label}
                <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                  em breve
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                active && "bg-muted font-medium text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-3 text-xs text-muted-foreground">v0.1</div>
    </aside>
  );
}
