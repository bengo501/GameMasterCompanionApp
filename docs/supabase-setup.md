# Configurando o Supabase (passo a passo)

Este guia liga a **persistência e o login** do OpenMaster-NarratorHelper. Leva ~5–10 min.
Você escolheu a **opção A (Supabase Cloud / free tier)** — sem Docker.

> Enquanto não fizer isto, a app roda em **modo demo**: você vê a interface,
> mas não cria/salva campanhas.

---

## 1. Criar a conta e o projeto

1. Acesse https://supabase.com e crie uma conta (pode usar GitHub/Google).
2. Clique em **New project**.
3. Defina:
   - **Name:** `openmaster` (ou o que quiser)
   - **Database Password:** crie uma senha forte e **guarde** — você vai usá-la na connection string.
   - **Region:** escolha a mais próxima (ex.: `South America (São Paulo)`).
4. Aguarde ~2 min até o projeto provisionar.

---

## 2. Pegar as chaves da API

No painel do projeto: **Project Settings (engrenagem) → API**.

- **Project URL** → vai em `NEXT_PUBLIC_SUPABASE_URL`
- **Project API keys → `anon` `public`** → vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 3. Pegar a connection string (DATABASE_URL)

**Project Settings → Database → Connection string → URI.**

- Copie a URI. Ela vem com `[YOUR-PASSWORD]` — troque pela senha que você criou no passo 1.
- Use a string do **"Session pooler"** (ou a conexão direta). Evite o
  "Transaction pooler" (porta 6543) para as **migrations**, pois ele não lida
  bem com DDL. Para a app, qualquer uma funciona (o código já usa `prepare: false`).

Exemplo do formato:
```
postgresql://postgres.abcdefgh:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## 4. Criar o arquivo `.env.local`

Na raiz do projeto, copie o exemplo e preencha:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
DATABASE_URL=postgresql://postgres.SEU-REF:SUA_SENHA@aws-0-...:5432/postgres
```

> `.env.local` está no `.gitignore` — suas chaves não vão para o git.

---

## 5. Criar as tabelas (migrations)

A migration já foi gerada em `drizzle/`. Aplique no banco:

```bash
npm run db:migrate
```

Se preferir empurrar o schema sem arquivo de migration (bom em dev):

```bash
npm run db:push
```

Confira no Supabase: **Table Editor** deve mostrar a tabela `campaign`.

---

## 6. Ativar a segurança (RLS)

No Supabase: **SQL Editor → New query**, cole o conteúdo de
[`supabase/policies.sql`](../supabase/policies.sql) e clique em **Run**.

Isso garante que cada usuário só enxergue as próprias campanhas pela API pública.

---

## 7. Criar seu usuário de mestre

Por padrão o Supabase pede confirmação de e-mail. Para desenvolver mais rápido:

- **Authentication → Providers → Email** → desligue **"Confirm email"** → Save.

Depois, com a app rodando (`npm run dev`), abra `/login`, clique em
**"Não tem conta? Cadastre-se"**, e crie sua conta.

> Alternativa: **Authentication → Users → Add user** (cria já confirmado).

---

## 8. Rodar e testar

```bash
npm run dev
```

1. Abra http://localhost:3000 → entre com seu usuário.
2. Vá em **Campanhas → Nova campanha**, escolha o sistema **d20 Fantasia** e salve.
3. A campanha deve aparecer na lista e abrir na página de detalhe. 🎉

---

## Problemas comuns

- **`password authentication failed`** → a senha na `DATABASE_URL` está errada (troque o `[YOUR-PASSWORD]`).
- **App conecta mas migration falha** → use a connection string do **Session pooler / direta (5432)** para as migrations.
- **Login não entra e nada aparece** → confirmação de e-mail ainda ativa (passo 7) ou usuário não confirmado.
- **Vejo dados de outro usuário** → rode o `policies.sql` (passo 6).

Quando estiver tudo funcionando, me avise que seguimos para o **M2 (Personagens/NPCs + Locais)**.
