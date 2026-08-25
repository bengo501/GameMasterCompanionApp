"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function CampaignTabs({
  campaignId,
  campaignName,
}: {
  campaignId: string;
  campaignName: string;
}) {
  const pathname = usePathname();
  const base = `/campaigns/${campaignId}`;
  const tabs = [
    { href: base, label: "Visão geral", exact: true },
    { href: `${base}/actors`, label: "Personagens & NPCs" },
    { href: `${base}/locations`, label: "Locais" },
    { href: `${base}/sessions`, label: "Sessões" },
    { href: `${base}/encounters`, label: "Combate" },
    { href: `${base}/notes`, label: "Notas" },
    { href: `${base}/dice`, label: "Dados" },
    { href: `${base}/live`, label: "Sessão ao Vivo" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/campaigns" className="hover:underline">
          Campanhas
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{campaignName}</span>
      </div>
      <nav className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => {
          const active = t.exact
            ? pathname === t.href
            : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "border-b-2 border-transparent px-3 py-2 text-sm transition-colors hover:text-foreground",
                active
                  ? "border-primary font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
