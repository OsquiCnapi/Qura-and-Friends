# Quantum Party 🐇🎩

Juego web educativo **semi-3D tipo Mario Party** para enseñar computación cuántica a jóvenes, con temática
de *Alicia en el País de las Maravillas*. Dos jugadores locales (hotseat) recorren un tablero por turnos;
las casillas lanzan minijuegos organizados en 4 categorías de dificultad creciente.

## Conceptos que enseña (fácil → difícil)

1. **Superposición** — medición/colapso, prob = amplitud², búsqueda de Grover.
2. **Entrelazamiento** — pares de Bell, correlación/anticorrelación, teleportación.
3. **Interferencia** — fase, interferencia constructiva/destructiva.
4. **Optimización / Quantum Annealing** — Ising → QUBO, recocido (OpenJij).

Transversal: **compuertas como rotaciones** y la **esfera de Bloch** (laboratorio interactivo).

El contenido pedagógico se destila de la documentación consolidada del workspace: `../qbronze_docs`
(básico) y `../qsilver_docs` (intermedio/avanzado).

## Estructura (monorepo pnpm + Turborepo)

```
apps/web            Next.js 15 + React 19 + R3F (el juego)
packages/
  quantum-engine    Motor de estados cuánticos, TS puro y testeado (sin framework)
  game-core         Contrato Minigame, registry, game loop, tablero
  quantum-viz       Visualizaciones R3F: esfera de Bloch, compuertas, paisaje de energía
  curriculum        Contenido educativo (MDX/TS) trazable a los docs
  schemas           Schemas zod compartidos (cliente ↔ edge functions)
  ui                Design system (Tailwind v4)
services/annealing  Microservicio Python (FastAPI + OpenJij) para la Categoría 4
supabase            Postgres + Realtime + Edge Functions (Deno)
```

## Puesta en marcha

```bash
pnpm install                     # instala todo el workspace
cp .env.example apps/web/.env.local
pnpm --filter web dev            # arranca el juego en http://localhost:3000
pnpm --filter @quantum-party/quantum-engine test   # tests del motor cuántico
pnpm dlx supabase start          # backend local (Postgres + Realtime + Edge Functions)
```

Ver el plan de arquitectura completo en `~/.claude/plans/`.
