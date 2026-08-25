# OpenMaster-NarratorHelper — Painel do Mestre 
# (RPG GM Companion)

Ferramenta para mestres de RPG planejarem, organizarem e conduzirem campanhas.
Agnóstica de sistema: o comportamento de fichas, rolagens e combate é dirigido por
**templates JSON** de sistema (d20, percentual, Ordem Paranormal d100, narrativo…).

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Supabase** (Postgres + Auth + Storage + pgvector + RLS)
- **Drizzle ORM** (schema tipado + migrations)
- **Tailwind CSS v4** + componentes estilo shadcn/ui
- **Zod** (validação de templates e formulários)

## Rodando localmente (modo demo, sem banco)

```bash
npm install
npm run dev
```

Abra http://localhost:3000 — a app roda em "modo demo" (sem login/persistência)
até o Supabase ser configurado.

## Configurando o Supabase

1. Crie um projeto grátis em https://supabase.com
2. Copie `.env.local.example` para `.env.local` e preencha as chaves.
3. Gere e aplique o schema (a partir do M1):

```bash
npm run db:generate   # gera a migration a partir de src/lib/db/schema.ts
npm run db:migrate    # aplica no banco
```

## Roadmap (resumo)

- **M0** Scaffold (este passo) ✅
- **M1** Motor de templates + template d20 + CRUD de Campanha
- **M2** Atores (PC/NPC) com ficha schema-driven + Locais
- **M3** Sessões + Cenas + Notas + busca global
- **M4** Rolador de dados + macros + histórico
- **M5** Combate / iniciativa
- **M6** Modo Sessão ao Vivo
- **M7** Export/import + 4 templates + polish
