-- Row Level Security. El score del cliente NUNCA se confía: la escritura en `scores` la hace solo la
-- Edge Function `submit-score` con service_role (que salta RLS). El cliente solo puede LEER el
-- leaderboard y gestionar SUS propias filas de progreso/sesión.

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.scores enable row level security;
alter table public.board_sessions enable row level security;
alter table public.classrooms enable row level security;

-- profiles: cada quien ve/edita el suyo; el display_name es público (para el leaderboard).
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_upsert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- progress: privado del usuario.
create policy "progress_own" on public.progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- scores: lectura pública (leaderboard); NADA de INSERT/UPDATE desde el cliente.
create policy "scores_select_validated" on public.scores for select using (true);
-- (sin policy de insert/update ⇒ el cliente no puede escribir; solo service_role lo hace)

-- board_sessions: el host gestiona las suyas.
create policy "board_sessions_own" on public.board_sessions for all
  using (auth.uid() = host_user_id) with check (auth.uid() = host_user_id);

-- classrooms: el docente gestiona las suyas; lectura por código se hará vía función en fase posterior.
create policy "classrooms_own" on public.classrooms for all
  using (auth.uid() = host_user_id) with check (auth.uid() = host_user_id);
