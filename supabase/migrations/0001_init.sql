-- Esquema inicial de Quantum Party.
-- Multijugador LOCAL hotseat: una cuenta (auth.users) por dispositivo; los 2 jugadores son "slots"
-- dentro de board_sessions. El progreso es por dispositivo en v1.

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Jugador',
  avatar_character text not null default 'alicia',
  locale text not null default 'es',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── progress: desbloqueo/estrellas por concepto-minijuego ────────────────────
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  minigame_id text not null,
  concept_id text not null,
  unlocked boolean not null default false,
  stars smallint not null default 0 check (stars between 0 and 3),
  best_score integer,
  best_time_ms integer,
  updated_at timestamptz not null default now(),
  unique (user_id, minigame_id)
);

-- ── scores: histórico VALIDADO en servidor ──────────────────────────────────
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  minigame_id text not null,
  board_session_id uuid,
  player_slot smallint not null default 0,
  score integer not null,
  metrics jsonb not null default '{}'::jsonb,
  validated boolean not null default false,
  proof jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists scores_minigame_idx on public.scores (minigame_id, validated);

-- ── board_sessions: partida hotseat (2 jugadores locales + bots) ─────────────
create table if not exists public.board_sessions (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references auth.users (id) on delete cascade,
  seed bigint not null,
  player_slots jsonb not null default '[]'::jsonb,
  board_state jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'finished', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── classrooms: aula docente (dashboard en tiempo real — STUB de UI) ─────────
create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_user_id uuid not null references auth.users (id) on delete cascade,
  roster jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
