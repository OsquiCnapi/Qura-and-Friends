# supabase — Postgres + Realtime + Edge Functions

Backend de Quantum Party. **No** es un workspace pnpm (las Edge Functions son Deno).

## Local

```bash
pnpm dlx supabase start                     # Postgres + Studio + Realtime + Edge runtime
pnpm dlx supabase db reset                  # aplica migrations/*.sql
pnpm dlx supabase functions serve           # sirve submit-score y anneal
```

## Migraciones
- `0001_init.sql` — tablas: profiles, progress, scores, board_sessions, classrooms.
- `0002_rls.sql` — RLS: el cliente nunca escribe en `scores` (solo la Edge Function con service_role).
- `0003_realtime_leaderboard.sql` — vista `leaderboard_view` + publicación Realtime de las tablas.

## Edge Functions (Deno)
- `submit-score/` — valida el `proof` (recomputa energía QUBO + límites) e inserta con service_role; el
  INSERT dispara Realtime → el leaderboard se actualiza en vivo en todos los clientes.
- `anneal/` — proxy autenticado al servicio Python (`services/annealing`).
- `_shared/` — CORS y la copia mínima de validación (no puede importar el paquete pnpm game-core).

Anti-trampa: el score del cliente nunca se confía. Ver `_shared/validateEnergy.ts`.
