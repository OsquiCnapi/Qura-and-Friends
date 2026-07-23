-- Realtime + leaderboard. "Todo en tiempo real": se publican las tablas que alimentan el leaderboard
-- en vivo, el progreso y el dashboard docente, para que los clientes se suscriban sin polling.

-- Vista de leaderboard: mejor score validado por minijuego y jugador.
create or replace view public.leaderboard_view as
select
  s.minigame_id,
  s.user_id,
  coalesce(p.display_name, 'Jugador') as display_name,
  max(s.score) as score
from public.scores s
left join public.profiles p on p.id = s.user_id
where s.validated = true
group by s.minigame_id, s.user_id, p.display_name;

-- Publicación de Realtime: al insertar un score validado (o cambiar progreso/sesión), los suscriptores
-- reciben el evento al instante. La Edge Function submit-score dispara esto al hacer INSERT.
alter publication supabase_realtime add table public.scores;
alter publication supabase_realtime add table public.progress;
alter publication supabase_realtime add table public.board_sessions;
alter publication supabase_realtime add table public.classrooms;
