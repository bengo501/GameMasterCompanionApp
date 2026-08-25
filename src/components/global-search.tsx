"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const q = String(fd.get("q") ?? "").trim();
        if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
      className="relative"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        name="q"
        type="search"
        placeholder="Busca global…"
        aria-label="Busca global"
        className="h-9 w-72 rounded-lg border border-border bg-transparent pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </form>
  );
}
