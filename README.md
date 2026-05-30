# ⚽ Álbum Copa 2026

App pessoal para controlar minhas figurinhas da Copa do Mundo FIFA 2026: o que **tenho**, o que **falta** e minhas **repetidas** pra trocar. Link público (só-leitura) pra divulgar; edição protegida por PIN.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · Supabase (Postgres) · Vercel · PWA instalável.

## Como funciona
- **Lista mestre:** 980 figurinhas — 48 seleções × 20 (`SELEÇÃO N`, ex. `BRA 10`) + 20 especiais.
- **Leitura pública** via RLS; ninguém escreve com a chave anon.
- **Edição** só pelo dono: o app manda o header `x-edit-token` (seu PIN) para `/api/collection`, que grava com a `service_role` no servidor.

## Configuração (primeira vez)
1. Crie um projeto em [supabase.com](https://supabase.com) (free tier serve).
2. Em **Project Settings → API**, copie:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (secreta!) → `SUPABASE_SERVICE_ROLE_KEY`
3. Copie `.env.local.example` para `.env.local` e cole as chaves. Defina um `EDIT_TOKEN` (seu PIN).
4. No **SQL Editor** do Supabase, rode o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
5. Popule a lista mestre e importe as repetidas:
   ```bash
   npm install
   npm run seed                # cria as 980 figurinhas
   npm run import-duplicatas   # marca as repetidas do Drive
   npm run dev                 # http://localhost:3000
   ```

## Deploy (Vercel)
- Suba o repo no GitHub e importe na Vercel.
- Configure as 4 variáveis de ambiente (as 3 do Supabase + `EDIT_TOKEN`) e `NEXT_PUBLIC_SITE_URL` com a URL final (pra OG image).

## Estrutura
- `app/` — páginas (`page` álbum, `repetidas`, `faltam`) + `api/collection` (edição protegida) + PWA/OG.
- `components/` — `TeamCard`, `StickerCell`, `ProgressBar`, `SiteHeader`, `EditProvider`.
- `lib/` — clientes Supabase (`supabase`, `supabaseAdmin`), `types`, `album` (fetch/save).
- `scripts/` — `seed.mjs`, `import-duplicatas.mjs`, `teams.mjs`.
