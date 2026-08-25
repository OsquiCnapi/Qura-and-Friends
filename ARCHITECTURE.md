# Arquitectura de Qura and Friends 🏗️

> Documentación técnica de la estructura, patrones y decisiones arquitectónicas del proyecto.

## 🎯 Visión General

**Qura and Friends** es un monorepo Turborepo que implementa un juego educativo semi-3D tipo Mario Party para enseñar computación cuántica. La arquitectura separa **lógica pura** (determinista, testeable) de **presentación** (React, Three.js).

### Principios Clave

1. **Determinismo**: Mismo seed + inputs → mismo resultado (para validación servidor y replay)
2. **Separación de concerns**: Lógica en `game-core`, presentación en `apps/web`
3. **Type-safety**: TypeScript estricto, sin `any`
4. **Reusabilidad**: Minijuegos y componentes reutilizables
5. **Modularidad**: Paquetes independientes con contratos claros

---

## 📦 Estructura del Monorepo

```
├── apps/
│   └── web/                          # App Next.js + React Three Fiber
│       ├── src/
│       │   ├── app/                  # Rutas Next.js (landing, game, learn)
│       │   ├── components/           # Componentes React (layout, marketing)
│       │   ├── game/                 # GameLoop, MinigameHost
│       │   ├── hud/                  # HUD y overlays
│       │   ├── input/                # Input manager (singleton)
│       │   ├── learn/                # Rutas de aprendizaje
│       │   ├── lib/                  # Helpers y utilidades
│       │   ├── machines/             # XState machines (orquestación)
│       │   ├── scenes/               # Escenas R3F por minijuego
│       │   ├── state/                # Zustand stores (global state)
│       │   ├── three/                # Canvas y config de Three.js
│       │   └── types/                # Type definitions locales
│       └── public/                   # Assets (audio, modelos 3D)
│
├── packages/
│   ├── game-core/                    # ⭐ Núcleo lógico (TS puro)
│   │   └── src/
│   │       ├── minigame/             # Contrato y registry
│   │       ├── minigames/            # Definiciones de minijuegos
│   │       ├── loop/                 # Fixed-step game loop
│   │       ├── board/                # Lógica de tablero
│   │       └── scoring/              # Sistema de puntuación
│   │
│   ├── quantum-engine/               # ⭐ Motor cuántico (TS puro)
│   │   └── src/
│   │       ├── statevector.ts        # Vectores de estado
│   │       ├── gates.ts              # Compuertas cuánticas
│   │       ├── superposition.ts      # Superposición
│   │       ├── entanglement.ts       # Entrelazamiento
│   │       ├── interference.ts       # Interferencia
│   │       └── annealing/            # Quantum annealing
│   │
│   ├── quantum-viz/                  # Visualización cuántica
│   │   └── src/
│   │       ├── BlochSphere.tsx       # Esfera de Bloch 3D
│   │       ├── GateAnimation.tsx     # Animación de compuertas
│   │       └── bloch-xyz.ts          # Cálculos geométricos
│   │
│   ├── curriculum/                   # Contenido pedagógico
│   │   └── src/
│   │       ├── concepts/             # Mapeo conceptos-minijuegos
│   │       ├── minigame-map.ts       # Configuración de dificultad
│   │       └── types.ts              # Tipos de contenido
│   │
│   ├── schemas/                      # ⭐ Tipos compartidos (Zod + TS)
│   │   └── src/
│   │       └── index.ts              # Exporta todos los tipos
│   │
│   └── ui/                           # Componentes genéricos (botones, paneles)
│       └── src/
│           ├── Button.tsx
│           ├── Panel.tsx
│           ├── Meter.tsx
│           ├── DialogueBox.tsx
│           └── theme.css
│
├── services/
│   └── annealing/                    # Servicio Python (quantum annealing)
│       └── app/
│           ├── main.py               # FastAPI
│           ├── solver.py             # Lógica de annealing
│           └── schemas.py            # Modelos Pydantic
│
├── supabase/                         # Configuración BDD en tiempo real
│   ├── migrations/                   # Schema SQL
│   └── functions/                    # Edge functions (Deno)
│
├── docs/                             # Documentación del proyecto
│   └── carrera-del-gato-proposito.md # GDD (Game Design Document)
│
└── root config files
    ├── package.json                  # Workspace root
    ├── pnpm-workspace.yaml           # Definición monorepo
    ├── turbo.json                    # Configuración Turborepo
    ├── tsconfig.base.json            # TS compartido + path aliases
    ├── .editorconfig                 # Estándares de código
    └── .eslintrc.json                # Lint compartido
```

---

## 🔄 Flujo de Datos

### 1️⃣ **Inicialización (Boot)**

```
Landing Page
    ↓
[START] → AppMachine (XState)
    ↓
SessionStore (seed, difficulty, players)
    ↓
Navigate → /game/board
```

### 2️⃣ **Minijuego (Ciclo de Simulación)**

```
MinigameHost
    ├── registerAllMinigames()
    ├── def = requireMinigame(id)
    ├── ctx = MinigameContext { seed, rng, quantum, players }
    └── controller = def.createController(ctx)
        
            controller.init()      ← Estado inicial (determinista)
            controller.start()     ← Arranca la simulación
                ↓
        <Canvas> + GameLoop (60 Hz)
            ├── useFrame(dt) → loop.advance(dt, update)
            │   └── controller.update(fixedDt, input)
            │       ↓
            │       [Physics, Quantum Ops, Bot AI]
            │       ↓
            │       return renderState
            │
            ├── Scene (R3F) → dibuja renderState
            ├── HudRoot → muestra HudState (throttled ~12 Hz)
            │
            └── InputManager (singleton) → lee teclado
                    ↓ (cada 60 Hz)
                buildSnapshot() → InputSnapshot
                    ↓
                controller.update(fixedDt, snapshot)
                
            [Cuando controller.isFinished()]
                ↓
                result = controller.computeResult()
                ↓
                Mostrar ResultsOverlay
                ↓
                [CONTINUE] → Navigate → /game/board
```

### 3️⃣ **Puntuación y Validación**

```
controller.computeResult()
    ├── Calcula score SOLO sobre estado lógico
    │   (no floats de física)
    ├── Genera proof (seed, inputs, opciones de minijuego)
    └── Retorna MinigameResult
        {
          perPlayer: [
            { playerId, score, metrics { collapses, etc } }
          ],
          proof: { ... }
        }
        
    [Servidor puede revalidar:
     controller.update() con mismo seed + mismos inputs
     ⇒ mismo resultado]
```

---

## 🎮 Contrato Minijuego

### Estructura Obligatoria

Cada minijuego vive en `packages/game-core/src/minigames/{id}/`:

```
cat-race/
├── index.ts              # Re-exporta definition, controller, types
├── definition.ts         # MinigameDefinition (metadata)
├── controller.ts         # MinigameController (lógica)
├── types.ts              # RenderState, Config, types locales
├── config.ts             # Generador de config por dificultad
└── [optional] utils.ts   # Helpers específicos
```

### Implementación Mínima

```typescript
// definition.ts
export const catRaceDefinition: MinigameDefinition = {
  id: "cat-race",
  i18nKey: "minigames.catRace",
  conceptId: "superposition-basics",
  concept: "superposition",
  difficulty: 1,
  players: { min: 1, max: 2, supportsBots: true },
  controlScheme: "race",
  estimatedDurationSec: 45,
  createController(ctx) {
    return new CatRaceController(catRaceDefinition, ctx);
  }
};

// controller.ts
export class CatRaceController implements MinigameController<CatRaceRenderState> {
  private phase: MinigamePhase = "countdown";
  
  init() { /* Inicializa estado */ }
  start() { /* Arranca la simulación */ }
  update(dtFixed: number, input: InputSnapshot) {
    // DEBE ser PURO y DETERMINISTA
    // Procesa input, actualiza estado, calcula física
  }
  onInput(ev: InputEvent) { /* Atajos discretos */ }
  getRenderState() { return { /* posiciones, fases, etc */ }; }
  getHudState() { return { /* throttled */ }; }
  isFinished() { /* true si terminó */ }
  computeResult() { return { perPlayer: [...], proof: {...} }; }
  teardown() { /* Libera recursos */ }
}
```

---

## 📍 Patrones Clave

### 1. **Input Manager (Singleton)**

```typescript
// Vive en apps/web/src/input/inputManager.ts
// NO puede ser context porque el GameLoop corre en <Canvas>,
// fuera del árbol de React.

startInput()     // Monta listeners (idempotente por refCount)
stopInput()      // Desmonta listeners
buildSnapshot()  // Lee teclas presionadas → PlayerInput
```

### 2. **State Management (Zustand)**

- `sessionStore`: seed, difficulty, players (global, persiste partida)
- `gameControlStore`: paused, difficulty runtime
- `hudStore`: HUD state (throttled, publish/clear)
- `settingsStore`: preferencias del jugador

Todos en `apps/web/src/state/`. Zustand para simplicidad (sin Redux boilerplate).

### 3. **XState para Orquestación**

```typescript
// appMachine.ts
boot → menu → board → minigame → results → board (loop)
  ↓
  gameOver → restart → menu
```

No aloja lógica de simulación (eso está en MinigameController). Solo coordina transiciones de pantalla.

### 4. **Game Loop de Paso Fijo**

```typescript
// packages/game-core/src/loop/fixedStep.ts
const loop = createFixedStepLoop(60); // 60 Hz determinista

useFrame((_, dt) => {
  loop.advance(dt, (fixedDt) => {
    controller.update(fixedDt, buildSnapshot(time));
  });
});
```

Desacopla render (variable) de simulación (fija) → determinismo.

### 5. **Registry de Presentación**

```typescript
// apps/web/src/scenes/minigames/presentation.ts
const registry: Record<string, MinigamePresentation> = {
  "cat-race": {
    Scene: CatRaceScene,
    HudOverlay: CatRaceHud,
  }
};

export function getPresentation(id: string) {
  return registry[id];
}
```

Permite registrar escenas R3F sin tocar `MinigameHost`.

---

## 🧪 Quantum Engine

### Motor de Estados Cuánticos (TS Puro)

```
Statevector (vector de amplitudes complejas)
    ↓
Gates (aplicar compuertas unitarias)
    ├── Hadamard (superposición)
    ├── CNOT (entrelazamiento)
    ├── Pauli-X/Y/Z
    └── Rotaciones
    ↓
Medición (colapso probabilístico)
    └── seed determinista → reproducible
    ↓
Visualización (Bloch sphere, animaciones)
```

### Uso en Minijuegos

```typescript
const quantum = ctx.quantum;
const gate = quantum.hadamard(0);
const statevector = quantum.apply(initialState, gate);
const [outcome, collapsed] = quantum.measure(statevector, ctx.rng);
// outcome: 0 o 1 (probabilístico pero reproducible)
// collapsed: nuevo estado tras medición
```

---

## 🎨 Presentación (React Three Fiber)

### Componente Base: GameCanvas

```typescript
<GameCanvas>
  <GameLoop controllerRef={controllerRef} onFinish={...} />
  <Scene controllerRef={controllerRef} />
</GameCanvas>
```

- `GameCanvas`: Configura Three.js, lighting, postprocessing
- `GameLoop`: Ciclo de 60 Hz, lee input, llama `controller.update()`
- `Scene`: Dibuja la escena según `controller.getRenderState()`

### HUD Throttled

```typescript
// GameLoop throttlea a ~12 Hz para no re-render a 60 fps
hudAccumulator += dt;
if (hudAccumulator >= 0.08) {
  publish(controller.getHudState());
  hudAccumulator = 0;
}
```

Zustand + selector permite que `<HudElement>` se suscriba a cambios.

---

## 📱 Rutas de la App

```
/                           Landing page (hero, features)
/game
  /board                    Tablero (en desarrollo)
  /play/:minigameId         Minijuego (genérico)
/learn
  /aula                     Aula teórica
  /lab                      Laboratorio interactivo (Bloch sphere, gates)
/api/...                    Endpoints (auth, scoring, etc)
```

---

## 🛠️ Toolchain

| Herramienta | Propósito |
|---|---|
| **Turborepo** | Orquestación del monorepo, build cache |
| **Next.js 15** | Framework web (SSR, rutas, i18n) |
| **React 19** | UI library |
| **React Three Fiber** | Renderer Three.js declarativo |
| **TypeScript 5.7** | Type safety |
| **Zustand** | State management (global stores) |
| **XState 5** | State machines (flujo macro) |
| **Zod** | Validación de schemas + type inference |
| **next-intl** | i18n (ES, EN, etc) |
| **Vitest/Node test** | Testing |
| **ESLint** | Linting |
| **Supabase** | BDD en tiempo real + auth |

---

## 🚀 Build y Deploy

### Local

```bash
pnpm install
pnpm dev              # Todos los paquetes en paralelo
pnpm build            # Compilar: web, packages
pnpm test             # Vitest + Node test
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint
```

### Vercel (CI/CD)

- Automático en push a `main`
- Build cacheado por Turborepo
- Preview en PRs

---

## 🔐 Validación Servidor (Proof)

El `proof` de cada minijuego permite que el servidor revalide honestidad:

```typescript
MinigameResult {
  perPlayer: [...],
  proof: {
    seed,           // Usado para generar RNG
    minigameId,
    difficulty,
    inputs: [...]   // Todos los input events
  }
}

// Servidor:
controller2 = createController(seed, minigameId, difficulty)
controller2.update(...inputEvents)
result2 = controller2.computeResult()
assert(result.perPlayer[0].score === result2.perPlayer[0].score)
```

---

## 🔑 Auth & Permisos

Identidad **anónima por dispositivo** (Supabase Auth `signInAnonymously`, sin login) + autorización en dos capas:

1. **RLS** (`supabase/migrations/0002_rls.sql`) — cada quien lee/edita SUS propias filas (`auth.uid()`).
2. **RBAC** (`supabase/migrations/0004_rbac.sql`) — un rol global (`profiles.role`: `student`/`teacher`) más
   `classroom_members` para relación aula↔alumno, con toda mutación que cruza filas de otro usuario
   (unirse a un aula, otorgarse el rol docente) mediada por funciones `SECURITY DEFINER`, nunca por
   INSERT/UPDATE directo del cliente — el mismo principio que ya usaba `submit-score` con `service_role`.

Explicación completa (teoría aplicada, diagramas de flujo, cómo escalar) en **[docs/auth-permissions.md](docs/auth-permissions.md)**.

---

## 📚 Recursos Educativos

- `docs/carrera-del-gato-proposito.md` — Game Design Document
- `@quantum-party/curriculum` — Mapeo minijuego ↔ concepto
- Archivos `i18n/messages/*.json` — Contenido pedagógico multiidioma

---

## 🔗 Referencias

- [Contrato Minijuego](packages/game-core/src/minigame/contract.ts)
- [Cat Race (Ejemplo)](packages/game-core/src/minigames/cat-race/)
- [Input Manager](apps/web/src/input/inputManager.ts)
- [Game Loop](apps/web/src/game/GameLoop.tsx)
- [MinigameHost](apps/web/src/game/MinigameHost.tsx)
