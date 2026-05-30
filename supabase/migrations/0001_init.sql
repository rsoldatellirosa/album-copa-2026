-- Álbum Copa 2026 — schema inicial
-- Rode no SQL Editor do Supabase (ou via CLI). Idempotente.

-- ── Seleções ────────────────────────────────────────────────
create table if not exists public.teams (
  code           text primary key,           -- sigla FIFA, ex. 'BRA'
  name           text not null,
  "group"        text not null,              -- 'A'..'L'
  flag           text not null default '',   -- emoji
  "order"        int  not null default 0,
  is_placeholder boolean not null default false
);

-- ── Lista mestre de figurinhas (universo de 980) ────────────
create table if not exists public.stickers (
  id        text primary key,                -- ex. 'BRA-1', 'OPN-1', 'MUS-1'
  code      text not null,                    -- display, ex. 'BRA 1'
  team_code text references public.teams(code) on delete cascade,
  number    int  not null,
  section   text not null default 'team',     -- 'team' | 'opening' | 'museum'
  kind      text not null default 'player',   -- 'logo' | 'player' | 'special'
  label     text                              -- nome do jogador (quando conhecido)
);
create index if not exists stickers_team_idx on public.stickers (team_code);

-- ── Minha coleção (single-user) ─────────────────────────────
create table if not exists public.collection (
  sticker_id text primary key references public.stickers(id) on delete cascade,
  owned      boolean not null default false,  -- tenho (no álbum / garantida)
  duplicates int     not null default 0,      -- quantas repetidas pra trocar
  photo_url  text,
  updated_at timestamptz not null default now()
);

-- ── RLS: leitura pública, escrita só via service_role ───────
alter table public.teams      enable row level security;
alter table public.stickers   enable row level security;
alter table public.collection enable row level security;

drop policy if exists "public read teams"      on public.teams;
drop policy if exists "public read stickers"   on public.stickers;
drop policy if exists "public read collection" on public.collection;

create policy "public read teams"      on public.teams      for select using (true);
create policy "public read stickers"   on public.stickers   for select using (true);
create policy "public read collection" on public.collection for select using (true);
-- Sem policies de insert/update/delete: o cliente anon não escreve.
-- A service_role (scripts e Route Handlers do servidor) ignora a RLS.
