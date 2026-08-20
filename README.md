<div align="center">

# Qura and Friends 🐇🎩⚛️

**Juego educativo 3D tipo Mario Party para enseñar computación cuántica.** Dos jugadores locales (hotseat) recorren un tablero por turnos; cada casilla lanza un minijuego que enseña un concepto cuántico *real* con un motor cuántico de verdad.

Temática: *Alicia en el País de las Maravillas*. Determinístico, reproducible, anti-trampa.

<br>

![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs) ![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![R3F](https://img.shields.io/badge/React_Three_Fiber-9-black) ![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript) ![pnpm 10](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm) ![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo) ![Supabase](https://img.shields.io/badge/Supabase-Realtime-3FCF8E?logo=supabase)

**[📖 Documentación Completa](./ARCHITECTURE.md)** • **[🤝 Contribuir](./CONTRIBUTING.md)** • **[🛠️ Setup Dev](./DEVELOPMENT.md)**

</div>

---

## 📌 Inicio Rápido

```bash
# Clonar y configurar
git clone https://github.com/[org]/qura-and-friends.git
cd qura-and-friends
pnpm install

# Levantar servidor de desarrollo
pnpm dev

# Abrir en navegador
# http://localhost:3000
```

Para setup completo, ver [DEVELOPMENT.md](./DEVELOPMENT.md).

---

## 📚 Contenidos

1. [¿Qué es Qura?](#-qué-es-qura)
2. [Conceptos Que Enseña](#-conceptos-que-enseña)
3. [Arquitectura](#-arquitectura-cliente--servidor)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Cómo Funciona](#-cómo-funciona)
6. [Deploy](#-deploy)
7. [Recursos y Documentación](#-recursos-y-documentación)

---

## 🎮 ¿Qué es Qura?

Un **juego educativo 3D** que convierte conceptos de computación cuántica en minijuegos interactivos. Cada minijuego ejecuta simulaciones cuánticas reales en el navegador:

- **Superposición y colapso:** *La Carrera del Gato* — mantener superposición vs. riesgo de colapso
- **Entrelazamiento:** Correlaciones cuánticas entre qubits
- **Interferencia:** Fase y amplitudes complejas
- **Quantum Annealing:** Optimización con recocido cuántico (delegado a Python/OpenJij)

**No es un simulador decorativo.** El motor cuántico es auténtico:
- Vectores de estado (amplitudes complejas)
- Compuertas unitarias (Hadamard, CNOT, Pauli, rotaciones)
- Medición probabilística (con seed determinístico para reproducibilidad)
- Esfera de Bloch en 3D (laboratorio interactivo)

---

## 📊 Conceptos que Enseña

| Dificultad | Categoría | Minijuego Plantilla | Motor |
|---|---|---|---|
| ⭐ | Superposición | *La Carrera del Gato* | `superposition.ts` |
| ⭐⭐ | Entrelazamiento | (en desarrollo) | `entanglement.ts` |
| ⭐⭐⭐ | Interferencia | (en desarrollo) | `interference.ts` |
| ⭐⭐⭐⭐ | Quantum Annealing | (en desarrollo) | `annealing/` + OpenJij |

Todos los minijuegos usan la **esfera de Bloch** como herramienta visual central.

---

## 🏗️ Arquitectura Cliente ↔ Servidor

### Frontend (Todo en el navegador)

```
Next.js 15 (SSR estático)
  ├── React 19
  │   ├── Zustand (state management)
  │   ├── XState (orquestación de pantallas)
  │   └── next-intl (i18n)
  │
  └── React Three Fiber v9
      ├── Three.js (rendering 3D)
      ├── Rapier (física)
      └── Postprocessing (efectos)
          ↓ usa
      quantum-engine (TS puro)
          ├── statevector (amplitudes complejas)
          ├── gates (compuertas)
          ├── measurement (colapso probabilístico)
          └── annealing (Ising → QUBO)
```

### Backend (Minimalista)

```
Supabase
  ├── Postgres (sesiones, perfiles, scores)
  ├── Realtime (leaderboards en vivo)
  └── Edge Functions (Deno)
      ├── submit-score (validación anti-trampa)
      └── anneal (proxy a Python)
         ↓
Python Microservicio (FastAPI + OpenJij)
  └── Resuelve problemas de annealing
```

**Decisión arquitectónica:** El cliente ejecuta toda la lógica de juego. El servidor solo persiste y valida. Esto permite:
- Gameplay offline
- Cero latencia
- Reproducibilidad (seed → validación)

---

## 📁 Estructura del Proyecto

### Monorepo pnpm + Turborepo

```
qura-and-friends/
│
├── apps/web/                              Next.js + React + R3F
│   └── src/
│       ├── app/                           App Router (landing, game, learn)
│       ├── components/                    Componentes React genéricos
│       ├── game/                          GameLoop.tsx, MinigameHost.tsx
│       ├── scenes/minigames/              Escenas 3D por minijuego
│       ├── hud/                           HUD en DOM (throttled ~12 Hz)
│       ├── input/                         Input manager (singleton)
│       ├── state/                         Zustand stores (global)
│       ├── machines/                      XState (orquestación)
│       ├── lib/                           Helpers y clientes (Supabase)
│       └── i18n/                          Traducciones (ES, EN)
│
├── packages/                              Código compartido TS puro
│   ├── quantum-engine/                    Motor de estados cuánticos
│   │   └── src/ statevector · gates · superposition ·
│   │           entanglement · interference · annealing
│   │
│   ├── game-core/                         Contrato de minijuegos
│   │   └── src/ minigame/contract · registry · minigames/cat-race ·
│   │           loop/fixedStep · board/ · scoring/
│   │
│   ├── quantum-viz/                       Visualización (Bloch sphere)
│   ├── curriculum/                        Contenido educativo
│   ├── schemas/                           Tipos Zod compartidos + constantes
│   └── ui/                                Design system (Button, Panel, etc)
│
├── services/                              Backend services
│   └── annealing/                         Python FastAPI + OpenJij
│
├── supabase/                              Configuración BDD
│   ├── migrations/                        Schema SQL
│   └── functions/                         Edge Functions (Deno)
│
├── docs/                                  Game Design Document
├── ARCHITECTURE.md                        ⭐ Arquitectura técnica detallada
├── CONTRIBUTING.md                        ⭐ Guía de contribución
├── DEVELOPMENT.md                         ⭐ Setup y desarrollo
├── .editorconfig                          Estándares de código
├── tsconfig.base.json                     TypeScript compartido
├── turbo.json                             Configuración Turborepo
└── pnpm-workspace.yaml                    Definición del monorepo
```

Para detalles profundos, ver [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## ⚙️ Cómo Funciona

### Flujo de Minijuego (60 Hz Determinístico)

```typescript
MinigameHost
  ├── Inicializa contexto (seed, quantum engine, RNG)
  ├── Crea controller: def.createController(ctx)
  │   └── Controller es PURO y DETERMINÍSTICO
  │
  └── <Canvas> (React Three Fiber)
      ├── GameLoop (useFrame @ 60 Hz)
      │   ├── controller.update(fixedDt, inputSnapshot)
      │   │   └── [Simulación: física, AI bot, compuertas cuánticas]
      │   └── publish HudState (throttled ~12 Hz)
      │
      ├── Scene (R3F)
      │   └── controller.getRenderState()
      │       ├── Posiciones
      │       ├── Animaciones
      │       └── Estados de carril/colapso
      │
      └── HudRoot (DOM)
          └── Scores, métricas, estado

[Cuando isFinished()]
  └── result = controller.computeResult()
      ├── perPlayer scores
      └── proof (seed + inputs para validación)
      
      → Enviar a Supabase / Edge Function
```

**Clave:** La simulación corre en un `useRef` mutable (sin re-renders). El HUD se publica throttled para mantener React fluido.

### Input (Singleton)

Teclas pulsadas en un `Set<string>` (no contexto de React porque R3F usa su propio reconciler):

```typescript
startInput()      // Monta listeners (idempotente)
buildSnapshot()   // Lee teclas → { p1: { axisX, axisY, buttons }, t }
controller.update(fixedDt, snapshot)
```

Bindings:
- P1: `WASD` (axes) + `Space` (action) + `Shift+L` (superpose)
- P2: Flechas + `Enter` + `Shift+R`

### State Management (Zustand)

Tres stores:
- `sessionStore`: seed, difficulty, players (persiste sesión)
- `gameControlStore`: paused, togglePause
- `hudStore`: HUD throttled, publish/clear

---

## 🚀 Setup Local

### 1. Requisitos

- **Node.js 22.x** → `node --version`
- **pnpm 10+** → `npm install -g pnpm@latest`
- **Git**

### 2. Clonar e Instalar

```bash
git clone https://github.com/[org]/qura-and-friends.git
cd qura-and-friends
pnpm install
```

### 3. Verificar Setup

```bash
pnpm typecheck      # TypeScript OK
pnpm lint           # ESLint OK
pnpm build          # Build sin errores
```

### 4. Desarrollo

```bash
pnpm dev                    # Todos los servidores
# http://localhost:3000

# O paquete específico
cd apps/web && pnpm dev
cd packages/game-core && pnpm test --watch
```

Para configuración completa (IDE, CI/CD, debugging), ver [DEVELOPMENT.md](./DEVELOPMENT.md).

---

## 📦 Scripts Disponibles

| Comando | Qué hace | Scope |
|---------|----------|-------|
| `pnpm dev` | Dev servers de todos | Root |
| `pnpm build` | Build del workspace | Root |
| `pnpm test` | Suites (Vitest + Node test) | Root |
| `pnpm typecheck` | `tsc --noEmit` | Root |
| `pnpm lint` | ESLint | Root |
| `pnpm clean` | Limpia artefactos | Root |
| `pnpm --filter web dev` | Dev solo web app | Root |
| `pnpm --filter @quantum-party/game-core test --watch` | Watch tests | Root |

---

## 🌐 Despliegue

### Vercel (Frontend)

Solo la app web (`apps/web`) se despliega en Vercel:

1. **Importar repo:** https://vercel.com/new
2. **Configurar:**
   - Root Directory: `apps/web`
   - Node.js: 22.x
3. **Variables de entorno** (Settings → Environment Variables):
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ANNEAL_SERVICE_URL
   ANNEAL_SERVICE_TOKEN
   ```
4. **Deploy:** `git push origin main` automático

> Vercel detecta el workspace pnpm automáticamente.

### Supabase (BDD + Edge Functions)

```bash
# Local
supabase start

# Deploy funciones Deno
supabase functions deploy submit-score --project-id <tu-id>
supabase functions deploy anneal --project-id <tu-id>

# Aplicar migraciones
supabase db push
```

### Servicio de Annealing (Python)

Despliega aparte en Railway, Fly.io, Render o Cloud Run:

```bash
cd services/annealing
uvicorn app:app --host 0.0.0.0 --port 8000
```

Ver [services/annealing/README.md](./services/annealing/README.md).

---

## 🧪 Testing

### Tests Unitarios

```bash
# Quantum engine y game-core (node --test + tsx)
pnpm test

# Watch mode
cd packages/game-core && pnpm test --watch

# Cobertura
pnpm test -- --coverage
```

### Validación Local

```bash
pnpm build          # Compilar
pnpm typecheck      # Tipos OK
pnpm lint           # Estilo OK
```

---

## 🔧 Configuración

### TypeScript (Estricto)

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "paths": {
      "@quantum-party/*": ["./packages/*/src/index.ts"],
      "@/*": ["./apps/web/src/*"]
    }
  }
}
```

### Convenciones de Código

- **Componentes React:** PascalCase, named exports
- **Funciones/tipos:** camelCase, PascalCase
- **Constantes:** UPPER_SNAKE_CASE (centralizadas en `packages/schemas/src/constants.ts`)
- **Imports:** Orden: librerías externas → monorepo → locales
- **Tipos:** `import type { T }` (reduce bundle)

Para más, ver [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 🎓 Conceptos Clave

### 1. Determinismo

Mismo seed + inputs → mismo resultado. Crítico para:
- **Reproducibilidad:** replays de sesiones
- **Testing:** validar lógica cuántica
- **Anti-trampa:** validar scores en servidor

Todos los RNG son inyectados y sembrados.

### 2. Separación Lógica ↔ Presentación

- **game-core:** TS puro, determinístico, sin React
- **apps/web/scenes:** React + R3F, renderiza estados
- **Contrato `MinigameController`:** define la interfaz

Permite testear sin DOM y reutilizar lógica.

### 3. Game Loop a Paso Fijo (60 Hz)

```typescript
loop.advance(dt, (fixedDt) => {
  controller.update(fixedDt, input);
});
```

Desacopla simulación (fija) de render (variable) → reproducibilidad.

### 4. HUD Throttled

```typescript
hudAccumulator += dt;
if (hudAccumulator >= 0.08) {  // ~12 Hz
  publish(controller.getHudState());
  hudAccumulator = 0;
}
```

React no re-renderiza a 60 fps, solo a 12 fps → fluidez.

---

## 📚 Recursos y Documentación

| Recurso | Contenido |
|---------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura técnica, patrones, flujos |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Convenciones, cómo añadir minijuegos, commit messages |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Setup dev, scripts, debugging, i18n |
| [docs/carrera-del-gato-proposito.md](./docs/carrera-del-gato-proposito.md) | Game Design Document |

### Documentación Técnica Oficial

- [Turborepo](https://turbo.build/repo/docs)
- [Next.js 15](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Zustand](https://github.com/pmndrs/zustand)
- [XState 5](https://stately.ai/docs)
- [Supabase](https://supabase.com/docs)

---

## ⚠️ Buenas Prácticas

### Obligatorias

- ✅ **Nunca `any`** en TypeScript
- ✅ **Lógica core determinística** (usa RNG inyectado)
- ✅ **Componentes pequeños y enfocados**
- ✅ **Imports con `.js`** (verbatimModuleSyntax)
- ✅ **Path aliases** en lugar de `../../../`
- ✅ **Zustand para state** (nunca `useContext` en Canvas)

### Testing

- ✅ Toda lógica `game-core` tiene tests
- ✅ Funciones puras son testables
- ✅ Seed inyectado en tests

---

## 🗺️ Roadmap

- [ ] Minijuegos Categoría 2 (Entrelazamiento)
- [ ] Minijuegos Categoría 3 (Interferencia)
- [ ] Minijuegos Categoría 4 (Quantum Annealing)
- [ ] Panel docente (Learn / Aula)
- [ ] Soporte multijugador en red (opcional)
- [ ] Mobile (responsive UI)

---

## 📄 Licencia

MIT. Libre para usar, modificar y distribuir.

---

## 🙋 Preguntas o Sugerencias

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Seguridad:** Email privado (no public issues)

**¡Contribuciones bienvenidas!** Ver [CONTRIBUTING.md](./CONTRIBUTING.md).

---

<div align="center">

🚀 **Hecho con ❤️ en una hackathon. Refactorizado y documentado para el futuro.**

</div>
