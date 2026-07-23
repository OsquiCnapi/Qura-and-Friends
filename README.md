<div align="center">

# Qura and Friends 🐇🎩⚛️

**Juego web educativo semi-3D tipo _Mario Party_ para enseñar computación cuántica a jóvenes**, con temática de _Alicia en el País de las Maravillas_.

Dos jugadores locales (_hotseat_) recorren un tablero por turnos; cada casilla lanza un minijuego que enseña un concepto cuántico **real**, no una animación decorativa.

<br>

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![R3F](https://img.shields.io/badge/React_Three_Fiber-9-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript) ![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm) ![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo) ![Supabase](https://img.shields.io/badge/Supabase-Realtime-3FCF8E?logo=supabase)

</div>

---

## Tabla de contenidos

- [¿Qué es?](#qué-es)
- [Conceptos que enseña](#conceptos-que-enseña-fácil--difícil)
- [Arquitectura](#arquitectura)
- [Organización del código](#organización-del-código)
- [Cómo funciona](#cómo-funciona)
- [Puesta en marcha](#puesta-en-marcha)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Scripts](#scripts)
- [Buenas prácticas y convenciones](#buenas-prácticas-y-convenciones)
- [Estabilidad y calidad](#estabilidad-y-calidad)
- [Rutas de la app](#rutas-de-la-app)
- [Roadmap](#roadmap)

---

## ¿Qué es?

**Qura and Friends** convierte los fundamentos de la computación cuántica en un _party game_ por turnos. En vez de explicar la teoría con diapositivas, la **simula de verdad**: cada minijuego corre sobre un motor de estados cuánticos escrito desde cero (vectores de estado, compuertas, medición probabilística), de modo que lo que el jugador ve en pantalla es el resultado auténtico de la física.

- 🎲 **Tablero por turnos** — dados + casillas, estilo Mario Party.
- 👥 **Multijugador local _hotseat_** — P1 con `WASD`, P2 con las flechas. Sin red en tiempo real.
- 🧪 **Laboratorio interactivo** — la esfera de Bloch y las compuertas como rotaciones.
- 📊 **Plataforma en vivo** — marcadores, progreso y sesiones sincronizados con Supabase Realtime.
- 🎓 **Contenido trazable** — el material pedagógico se destila de `../qbronze_docs` (básico) y `../qsilver_docs` (intermedio/avanzado).

---

## Conceptos que enseña (fácil → difícil)

| # | Categoría | Qué se aprende | Motor |
|---|-----------|----------------|-------|
| 1 | **Superposición** | Medición/colapso, `prob = \|amplitud\|²`, búsqueda de Grover | `superposition.ts` |
| 2 | **Entrelazamiento** | Pares de Bell, correlación/anticorrelación, teleportación | `entanglement.ts` |
| 3 | **Interferencia** | Fase, interferencia constructiva/destructiva | `interference.ts` |
| 4 | **Optimización / _Quantum Annealing_** | Ising → QUBO, recocido | `annealing/` + OpenJij |

**Transversal:** las **compuertas como rotaciones** y la **esfera de Bloch** (laboratorio interactivo). El minijuego plantilla funcional es **_La Carrera del Gato_** (superposición y colapso por medición).

---

## Arquitectura

Monorepo **pnpm + Turborepo**. El navegador ejecuta todo el juego (motor cuántico incluido) en el cliente; el backend solo persiste y sincroniza estado en vivo. El recocido cuántico (Categoría 4) se delega a un microservicio Python.

```
┌──────────────────────────────────────────────────────────────────┐
│                          Navegador (cliente)                       │
│                                                                    │
│   apps/web  ── Next.js 15 · React 19 · React Three Fiber v9        │
│   ┌────────────┐   ┌────────────┐   ┌──────────────────────────┐  │
│   │  HUD (DOM) │◄──│  Zustand   │◄──│  <Canvas> R3F (60 Hz)     │  │
│   │  React     │   │  (stores)  │   │  MinigameController + sim │  │
│   └────────────┘   └────────────┘   └──────────────────────────┘  │
│         ▲                                     │                    │
│         │   input singleton (WASD / flechas)  │ usa               │
│         └───────────────┬─────────────────────┘                   │
│                         ▼                                          │
│        packages/quantum-engine · game-core · quantum-viz          │
└───────────────────────────────┬───────────────────────────────────┘
                                 │ HTTPS (fetch)
                 ┌───────────────┴───────────────┐
                 ▼                                ▼
   ┌───────────────────────────┐   ┌──────────────────────────────┐
   │  Supabase                 │   │  services/annealing (Python)  │
   │  Postgres + RLS           │   │  FastAPI + OpenJij            │
   │  Realtime (leaderboards)  │◄──│  resuelve QUBO/Ising          │
   │  Edge Functions (Deno)    │   └──────────────────────────────┘
   │   · submit-score (anti-   │        ▲
   │     trampa, service_role) │        │ Edge Function `anneal`
   │   · anneal (proxy + auth) │────────┘   (JWT + token interno)
   └───────────────────────────┘
```

**Decisiones clave**

- **Cliente-first:** el motor cuántico es TypeScript puro y corre en el navegador → cero latencia y funciona offline salvo persistencia.
- **Backend delgado:** Supabase para datos en vivo (Realtime) y validación anti-trampa en Edge Functions; nunca lógica de juego.
- **Annealing aislado:** OpenJij (Python) vive en su propio servicio; la Edge Function `anneal` actúa de proxy autenticado (JWT de usuario **+** token interno Edge→Python).
- **"Todo en tiempo real con Supabase"** = plataforma en vivo (marcadores/progreso/sesiones), **no** multijugador en red.

---

## Organización del código

```
proyecto/
├── apps/
│   └── web/                     Next.js 15 + React 19 + R3F — el juego
│       └── src/
│           ├── app/             App Router (rutas y layouts)
│           │   ├── (game)/      board · play/[minigameId] · results
│           │   ├── (learn)/     lab/[conceptId] · aula (stub docente)
│           │   ├── api/         anneal · score (route handlers)
│           │   ├── page.tsx     landing (Qura and Friends)
│           │   └── layout.tsx   root + NextIntlClientProvider
│           ├── components/      landing marketing (navbar, hero, features)
│           ├── three/           GameCanvas (raíz R3F)
│           ├── scenes/          escenas 3D por minijuego
│           ├── game/            GameLoop · MinigameHost
│           ├── hud/             HUD en DOM superpuesto al canvas
│           ├── input/           inputManager (singleton) + keyboardMap
│           ├── state/           stores Zustand (hud, session, settings)
│           ├── machines/        XState (appMachine)
│           ├── learn/           laboratorio (Bloch, LabView)
│           ├── lib/             supabase clients, motion utils
│           └── i18n/            next-intl (monolingüe: es)
├── packages/
│   ├── quantum-engine/          Motor de estados cuánticos — TS puro, testeado, sin framework
│   │   └── src/  statevector · gates · superposition · entanglement ·
│   │             interference · math/{complex,rng} · annealing/{ising,qubo,sa}
│   ├── game-core/               Contrato Minigame, registry, game loop, tablero
│   │   └── src/  board/{board,dice,tiles} · loop/fixedStep ·
│   │             minigame/{contract,registry,types} · minigames/cat-race ·
│   │             scoring/{score,validators}
│   ├── quantum-viz/             Visualizaciones R3F (esfera de Bloch, compuertas, energía)
│   ├── curriculum/              Contenido educativo (TS/MDX) trazable a los docs
│   ├── schemas/                 Schemas Zod compartidos (cliente ↔ Edge Functions)
│   └── ui/                      Design system (Tailwind v4, tokens CSS-first)
├── services/
│   └── annealing/               Microservicio Python (FastAPI + OpenJij) — Categoría 4
├── supabase/
│   ├── migrations/              0001_init · 0002_rls · 0003_realtime_leaderboard
│   ├── functions/               Edge Functions Deno: submit-score · anneal · _shared
│   └── config.toml
├── docs/                        Notas de diseño
├── turbo.json                   Pipeline Turborepo
├── pnpm-workspace.yaml          apps/* · packages/* · services/*
└── tsconfig.base.json           Config TS compartida
```

**Frontera de responsabilidades**

| Capa | Hace | No hace |
|------|------|---------|
| `quantum-engine` | Álgebra cuántica pura y determinista | Nada de React, DOM ni I/O |
| `game-core` | Reglas de juego, contrato de minijuegos, scoring | Renderizado, red |
| `quantum-viz` / `scenes` | Presentación 3D (R3F) | Reglas de juego |
| `hud` + `state` | UI en DOM y estado de presentación | Simulación a 60 Hz |
| `apps/web/app` | Rutas, layout, data-fetching | Lógica cuántica |
| Supabase / Edge | Persistencia, Realtime, anti-trampa | Lógica de juego |

---

## Cómo funciona

**Bucle de juego (60 Hz).** El `MinigameController` corre una **simulación a paso fijo de 60 Hz** dentro de `useFrame` (mutable, sin re-render). El HUD se publica _throttled_ (~12 Hz) al `hudStore` de Zustand — **nunca a 60 fps** — para no saturar React.

**Input.** React Three Fiber usa su **propio reconciler**: el _contexto_ de React **no cruza** al `<Canvas>`. Por eso el input es un **singleton de módulo** (`src/input/inputManager.ts`) en vez de contexto. El HUD, en cambio, usa Zustand (también singleton), que sí funciona a través de la frontera del canvas.

**Turno típico.**
1. El jugador tira el dado (`game-core/board/dice`) y avanza por el tablero.
2. La casilla resuelve a un minijuego vía el **registry** (`minigame/registry`).
3. `MinigameHost` monta la escena 3D (`scenes/`) + el HUD (`hud/`) y arranca el controller.
4. El controller pide física cuántica real al `quantum-engine` (superposición, colapso…).
5. Al terminar, el score se valida y se envía a la Edge Function `submit-score`.
6. La Categoría 4 (annealing) envía el QUBO a la API `anneal` → Edge Function → servicio Python OpenJij.

**Backend.** Supabase Postgres con **RLS** (`0002_rls.sql`) guarda perfiles/sesiones/scores; Realtime (`0003`) alimenta los marcadores en vivo. Las inserciones de score pasan **siempre** por la Edge Function con `service_role` para aplicar validación anti-trampa.

---

## Puesta en marcha

**Requisitos:** Node ≥ 20.11, pnpm 10, (opcional) Deno + CLI de Supabase, Python 3.11+ para el servicio de annealing.

```bash
# 1. Instalar todo el workspace
pnpm install

# 2. Variables de entorno del cliente
cp .env.example apps/web/.env.local     # rellenar con `supabase start` o el panel

# 3. Arrancar el juego → http://localhost:3000
pnpm --filter web dev

# 4. (opcional) Backend local: Postgres + Realtime + Edge Functions
pnpm dlx supabase start

# 5. (opcional) Servicio de annealing (Categoría 4)
cd services/annealing && uvicorn app:app --reload   # ver services/annealing/README.md
```

> **Variables** (`.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (cliente); `SUPABASE_SERVICE_ROLE_KEY` (solo servidor, **nunca** al cliente); `ANNEAL_SERVICE_URL`, `ANNEAL_SERVICE_TOKEN` (Edge → Python).

---

## Despliegue en Vercel

Solo se despliega la app web (`apps/web`). El proyecto ya trae la configuración lista (`apps/web/vercel.json`, `engines.node = 22.x`).

### 1. Importar el repo

En [vercel.com/new](https://vercel.com/new) importa `DanielUsuario001/Qura-and-Friends` y configura:

| Ajuste | Valor |
|--------|-------|
| **Root Directory** | `apps/web` ⟵ **imprescindible** (monorepo) |
| Framework Preset | Next.js _(autodetectado)_ |
| Build Command | `next build` _(desde `vercel.json`)_ |
| Install Command | `pnpm install --frozen-lockfile` _(desde `vercel.json`)_ |
| Node.js Version | 22.x _(desde `engines`)_ |

> Vercel detecta el workspace pnpm por el `pnpm-lock.yaml` del repo y enlaza los `packages/*` automáticamente (deja activado _"Include files outside the Root Directory"_).

### 2. Variables de entorno

En **Settings → Environment Variables** añade (Production + Preview):

```
NEXT_PUBLIC_SUPABASE_URL        = https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = <anon key del panel de Supabase>
SUPABASE_SERVICE_ROLE_KEY       = <service role key>   # solo servidor
ANNEAL_SERVICE_URL              = https://<tu-servicio-annealing>
ANNEAL_SERVICE_TOKEN            = <token interno Edge→Python>
```

> El build **no** requiere estas variables (la landing y las rutas estáticas compilan sin ellas), pero sí hacen falta en runtime para las funciones de Supabase. Recuerda que `NEXT_PUBLIC_*` se **inyectan en build**: si las cambias, hay que **redeploy**.

### 3. Deploy

`git push` a `main` dispara el deploy automáticamente. Alternativa por CLI:

```bash
npm i -g vercel
cd apps/web && vercel --prod
```

### Qué NO va en Vercel

- **`services/annealing`** (Python/OpenJij) → despliégalo aparte (Railway, Fly.io, Render, Cloud Run) y apunta `ANNEAL_SERVICE_URL` a su URL.
- **`supabase/`** (migraciones + Edge Functions Deno) → se gestiona con la CLI de Supabase (`supabase db push`, `supabase functions deploy`), no con Vercel.

> ⚠️ **Assets pesados:** `apps/web/public/` incluye modelos `.glb` de ~63 MB (191 MB en total). Se sirven vía la CDN de Vercel sin problema, pero para acelerar builds y evitar límites conviene moverlos a almacenamiento de objetos (Supabase Storage / Cloudflare R2) y/o **Git LFS**.

---

## Scripts

Desde la raíz (orquestados por Turborepo):

| Comando | Qué hace |
|---------|----------|
| `pnpm dev` | Arranca todos los procesos `dev` en paralelo |
| `pnpm build` | Build de todo el workspace (respeta el grafo de dependencias) |
| `pnpm test` | Ejecuta las suites (`node --test` + `tsx`) |
| `pnpm typecheck` | `tsc --noEmit` en cada paquete |
| `pnpm lint` | Lint del workspace |
| `pnpm clean` | Limpia artefactos y `node_modules` |

Por paquete: `pnpm --filter web dev`, `pnpm --filter @quantum-party/quantum-engine test`, etc.

---

## Buenas prácticas y convenciones

Estas reglas **no son opcionales**: varias evitan bugs sutiles ya diagnosticados. Verifícalas antes de tocar el código.

- **Paquetes internos consumidos como _fuente_** (no se compilan): `tsconfig` con `noEmit`, sin `composite`/`rootDir`. Next los transpila vía `transpilePackages`.
- **Imports con extensión `.js`** (por `verbatimModuleSyntax`), incluso para archivos `.ts`/`.tsx`. Webpack necesita `resolve.extensionAlias { ".js": [".ts", ".tsx", ".js"] }` en `next.config.ts`; sin eso el build falla con _"Module not found"_. **Turbopack no está configurado** → usar `next dev`/`next build` (webpack).
- **R3F no comparte contexto de React** con el `<Canvas>`: usa singletons de módulo (input) o Zustand (HUD), nunca `useContext` cruzando la frontera.
- **Simulación a 60 Hz mutable** en `useFrame`; el HUD se publica _throttled_ (~12 Hz), jamás a 60 fps.
- **Edge Functions son Deno**: no pueden importar paquetes pnpm. La validación anti-trampa se **duplica** a propósito en `supabase/functions/_shared/validateEnergy.ts`.
- **Motor cuántico:** convención **little-endian** (como Qiskit y los docs) y **RNG sembrado e inyectado** — nunca `Math.random` directo.
- **SVG con floats redondeados** (`round2`) para evitar _hydration mismatch_ entre servidor y cliente.
- **i18n:** todo el copy vive en `src/i18n/messages/es.json`; los componentes usan `useTranslations`.
- **Design system:** colores vía tokens CSS (`--color-*`) en `packages/ui/theme.css`, no hex sueltos.

---

## Estabilidad y calidad

- ✅ **Determinismo reproducible:** RNG sembrado inyectado en todo el motor y en los bots → mismas semillas, mismos resultados; imprescindible para tests y para la validación anti-trampa.
- ✅ **Física verificada:** `quantum-engine` y `game-core` tienen suites con `node --test` + `tsx` (álgebra de estados, compuertas, medición, scoring).
- ✅ **Anti-trampa:** los scores se validan en la Edge Function con `service_role`; la lógica de energía se duplica en Deno para no confiar en el cliente.
- ✅ **Seguridad de datos:** Postgres con **Row Level Security**; la `service_role_key` nunca se expone al cliente.
- ✅ **Accesibilidad:** paleta pensada para contraste AA y segura para daltonismo (crítica en los minijuegos de interferencia); soporte de `prefers-reduced-motion` en toda la app.
- ✅ **Rendimiento:** separación estricta entre la sim a 60 Hz (mutable) y el estado de UI (throttled) para mantener React fluido.
- ✅ **CI local:** `pnpm build` genera las rutas estáticas de `apps/web` sin errores; `pnpm typecheck` valida tipos en todo el monorepo.

> **Estado del proyecto:** _MVP en desarrollo activo._ Minijuego plantilla (**cat-race**) funcional; el resto de categorías y el panel docente `(learn)/aula` son **stubs** con la infraestructura (rutas, tablas, Realtime) ya preparada.

---

## Rutas de la app

| Ruta | Descripción |
|------|-------------|
| `/` | Landing de Qura and Friends |
| `/board` | Tablero por turnos (partida local 2 jugadores) |
| `/play/[minigameId]` | Minijuego activo (escena 3D + HUD) |
| `/results` | Resultados de la partida |
| `/lab/[conceptId]` | Laboratorio cuántico (esfera de Bloch, compuertas) |
| `/aula` | Panel docente en tiempo real _(stub)_ |
| `/api/anneal`, `/api/score` | Route handlers → Edge Functions |

---

## Roadmap

- [ ] Minijuegos de las Categorías 2–4 (entrelazamiento, interferencia, annealing).
- [ ] Panel docente `(learn)/aula` en vivo con Supabase Realtime.
- [ ] Ampliar el _curriculum_ trazable a `qbronze_docs` / `qsilver_docs`.
- [ ] Modo multi-locale (la estructura i18n ya lo permite).

---

<div align="center">
<sub>Hecho con ⚛️ para acercar la computación cuántica a quienes empiezan.</sub>
</div>
