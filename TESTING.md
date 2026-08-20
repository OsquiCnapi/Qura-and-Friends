# Testing Guide 🧪

Estrategia de testing para **Qura and Friends**.

## 📋 Tabla de Contenidos

- [Filosofía](#-filosofía)
- [Setup](#-setup)
- [Estructura](#-estructura)
- [Escribir Tests](#-escribir-tests)
- [Ejecutar Tests](#-ejecutar-tests)
- [Cobertura](#-cobertura)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)

---

## 💡 Filosofía

### Qué Testeamos

✅ **SIEMPRE**
- Lógica determinística (`quantum-engine`, `game-core`)
- Funciones puras (sin side-effects)
- Casos edge (límites, errores, valores nulos)
- Reproducibilidad (mismo seed → mismo resultado)

✅ **FRECUENTEMENTE**
- Componentes React críticos (HUD, overlays)
- Integración entre packages

✅ **OCASIONALMENTE**
- Componentes R3F (visualización)
- Edge Functions (deploy local + test)

❌ **NO TESTEAMOS**
- Efectos visuales puros (animaciones)
- Layouts estáticos

### Principio: Puro → Testeable

La mayoría de tests se centran en `game-core` y `quantum-engine` porque son **TS puro**. Los tests son rápidos, confiables y no dependen de DOM.

```typescript
// ✅ TESTEABLE (puro)
export function calculateScore(metrics: Metrics): number {
  return metrics.collapses * 10;
}

// ❌ DIFÍCIL DE TESTEAR (impuro)
export async function submitScore(score: number) {
  await fetch("/api/score", { body: score });
}
```

---

## 🛠️ Setup

### Herramientas

- **Node test runner** (built-in Node.js) — para `game-core` y `quantum-engine`
- **Vitest** (opcional, más avanzado) — para tests con mocking complejo
- **React Testing Library** (opcional) — para componentes React

### Requisitos

```bash
# Verificar Node.js
node --version  # v22.x mínimo

# Instalar tsx (transpiler TS on-the-fly)
npm install -g tsx
```

### Configuración (ya lista)

Los `package.json` de cada package incluyen:

```json
{
  "scripts": {
    "test": "node --import tsx --test \"tests/**/*.test.ts\"",
    "test:watch": "node --watch-path tests --import tsx --test \"tests/**/*.test.ts\""
  }
}
```

---

## 📁 Estructura

### Ubicación de Tests

```
packages/game-core/
├── src/
│   ├── minigames/
│   │   └── cat-race/
│   │       ├── controller.ts
│   │       ├── types.ts
│   │       └── controller.test.ts  ← Test al lado del source
│   └── scoring/
│       ├── score.ts
│       └── score.test.ts
└── tests/                          ← Tests integrales grandes
    └── cat-race.test.ts
```

**Regla simple:**
- Tests pequeños / unitarios: `{module}.test.ts` junto al source
- Tests integrales / fixtures: `tests/{feature}.test.ts`

### Convención de Nombres

```typescript
// ✅ Nombres descriptivos
describe("CatRaceController", () => {
  it("debería inicializar runners con distance 0", () => { ... });
  it("debería colapsar cuando la coherencia llega a 0", () => { ... });
  it("debería ser determinístico con mismo seed", () => { ... });
});

// ❌ Nombres vagos
it("test 1", () => { ... });
it("works", () => { ... });
```

---

## ✍️ Escribir Tests

### Formato Base

```typescript
// src/minigames/cat-race/controller.test.ts
import { describe, it, expect } from "node:test";
import { CatRaceController } from "./controller";
import { createMockContext } from "../__mocks__/context.mock";

describe("CatRaceController", () => {
  it("debería inicializar correctamente", () => {
    const ctx = createMockContext({ seed: 42 });
    const controller = new CatRaceController(definition, ctx);

    controller.init();

    expect(controller.getRenderState().runners).toHaveLength(2);
  });
});
```

### Assertions Comunes

```typescript
import { assert, deepEqual, strictEqual, throws } from "node:assert";

// Igualdad
strictEqual(a, b);              // ===
deepEqual(obj1, obj2);          // Comparación profunda

// Booleanos
assert(condition);              // truthy
assert.strictEqual(x, true);    // Explícito

// Errores
throws(() => {
  badFunction();
}, /expected message/);

// Aproximaciones
const epsilon = 1e-10;
assert(Math.abs(a - b) < epsilon);
```

### Mocks y Fixtures

```typescript
// tests/__fixtures__/context.mock.ts
import type { MinigameContext } from "@quantum-party/game-core";
import { createQuantumEngine, createRng } from "@quantum-party/quantum-engine";

export function createMockContext(overrides?: Partial<MinigameContext>): MinigameContext {
  return {
    seed: 42,
    difficulty: 1,
    players: [
      { id: "p1", slot: 0, name: "P1", character: "alicia", isBot: false },
      { id: "p2", slot: 1, name: "P2", character: "conejo", isBot: false },
    ],
    rng: createRng(42),
    quantum: createQuantumEngine(42),
    services: {},
    ...overrides,
  };
}

export function createMockInput() {
  return { p1: { axisX: 0, axisY: 0, buttons: {} }, p2: { ... }, t: 0 };
}
```

### Casos de Test Críticos

```typescript
// 1. Inicialización
it("init() reserva estado inicial sin crashear", () => {
  const ctx = createMockContext();
  const c = new CatRaceController(def, ctx);
  
  c.init();
  
  const state = c.getRenderState();
  expect(state).toBeDefined();
  expect(state.runners).toBeDefined();
});

// 2. Determinismo
it("mismo seed + inputs → mismo resultado", () => {
  const ctx1 = createMockContext({ seed: 42 });
  const c1 = new CatRaceController(def, ctx1);
  c1.init();
  c1.start();
  
  for (let i = 0; i < 60 * 10; i++) {
    c1.update(1/60, createMockInput());
  }
  
  const result1 = c1.computeResult();
  
  // --- Replay ---
  const ctx2 = createMockContext({ seed: 42 });
  const c2 = new CatRaceController(def, ctx2);
  c2.init();
  c2.start();
  
  for (let i = 0; i < 60 * 10; i++) {
    c2.update(1/60, createMockInput());
  }
  
  const result2 = c2.computeResult();
  
  deepEqual(result1.perPlayer, result2.perPlayer);
});

// 3. Edges
it("lanzar con 0 qubits no crashea", () => {
  const ctx = createMockContext({ players: [] });
  const c = new CatRaceController(def, ctx);
  
  c.init();  // No throw
  c.start();
  c.update(0.016, createMockInput());
});

// 4. Invariantes
it("score siempre ≥ 0", () => {
  const ctx = createMockContext();
  const c = new CatRaceController(def, ctx);
  
  c.init();
  c.start();
  
  for (let i = 0; i < 1000; i++) {
    c.update(1/60, createMockInput());
  }
  
  const result = c.computeResult();
  result.perPlayer.forEach(p => {
    assert(p.score >= 0);
  });
});
```

### Test Helpers

```typescript
// tests/helpers.ts
export function simulateFor(
  controller: MinigameController,
  seconds: number,
  inputFn?: (t: number) => InputSnapshot
) {
  const steps = seconds * 60;
  for (let i = 0; i < steps; i++) {
    const input = inputFn?.(i / 60) ?? createMockInput();
    controller.update(1/60, input);
    if (controller.isFinished()) break;
  }
  return controller.computeResult();
}

// Uso
const result = simulateFor(controller, 5, (t) => ({
  ...createMockInput(),
  p1: { ...createMockInput().p1, axisX: Math.sin(t) }
}));
```

---

## ▶️ Ejecutar Tests

### Comando Base

```bash
# En raíz (todos los packages)
pnpm test

# Específico
cd packages/game-core
pnpm test

# Watch mode (rerun on change)
pnpm test:watch
```

### Opciones Node Test

```bash
# Verbose output
node --test --verbose

# Grep (solo tests que matchean)
node --test tests/scoring.test.ts --grep "score"

# Timeout
node --test --timeout=5000
```

### Con tsx

```bash
# Directo
node --import tsx --test "tests/**/*.test.ts"

# Watch
node --watch-path tests --import tsx --test "tests/**/*.test.ts"
```

---

## 📊 Cobertura

### Generar Reporte

```bash
pnpm test -- --coverage

# O con node directamente
node --import tsx --import ./coverage.js --test "tests/**/*.test.ts"
```

### Targets de Cobertura

- **game-core:** ≥ 80%
- **quantum-engine:** ≥ 90% (crítico para reproducibilidad)
- **App web:** ≥ 50% (muchos componentes visuales)

---

## ✅ Best Practices

### 1. **Aislamiento**

```typescript
// ✅ Cada test es independiente
describe("Scoring", () => {
  it("calcula score P1 correctamente", () => {
    const score = calculateScore({ collapses: 5 }, 1);
    strictEqual(score, 50);
  });

  it("calcula score P2 correctamente", () => {
    const score = calculateScore({ collapses: 3 }, 1);
    strictEqual(score, 30);
  });
});

// ❌ Tests compartiendo state
let score = 0;
describe("Scoring", () => {
  it("incrementa score", () => { score += 10; });
  it("verifica score", () => { strictEqual(score, 10); }); // ⚠️ Depende de orden
});
```

### 2. **Determinismo en Tests**

```typescript
// ✅ Seed fijo
const ctx = createMockContext({ seed: 42 });

// ❌ Aleatoriedad
const ctx = createMockContext({ seed: Math.random() }); // ❌ No reproducible
```

### 3. **Nombres Auto-documentados**

```typescript
// ✅ Claro
it("debería retornar 1 cuando input es [1, 0]", () => { ... });

// ❌ Vago
it("test measure", () => { ... });
```

### 4. **Assertions Específicas**

```typescript
// ✅ Fail messages claros
const actual = controller.getRenderState().runners.length;
assert.strictEqual(
  actual,
  2,
  `Runners count: expected 2, got ${actual}`
);

// ❌ Genéricos
assert(controller.getRenderState().runners);
```

### 5. **No Assertions Excesivas**

```typescript
// ✅ Enfocado
it("debería medir a 0 ó 1", () => {
  const [outcome] = quantum.measure(state, rng);
  assert(outcome === 0 || outcome === 1);
});

// ❌ Sobretest
it("debería medir correctamente", () => {
  const [outcome] = quantum.measure(state, rng);
  assert(outcome >= 0);
  assert(outcome <= 1);
  assert(typeof outcome === "number");
  assert(Number.isInteger(outcome));
  // ... 10 lineas más
});
```

---

## 🆘 Troubleshooting

### Error: "Cannot find module"

```bash
# Node test no detecta path aliases. Solución:
# Importar con ruta relativa o exportar desde index.ts

// ❌
import { CatRaceController } from "@quantum-party/game-core";

// ✅
import { CatRaceController } from "../index.ts";
// O desde tests/:
import { CatRaceController } from "../../src/minigames/cat-race";
```

### Error: "Module not found: tsx"

```bash
npm install -g tsx
# O usar desde node_modules:
./node_modules/.bin/tsx --test tests/**/*.test.ts
```

### Test Colgado (no termina)

```bash
# Timeout explícito
node --test --timeout=5000

# O en el test
it("debería terminar", { timeout: 5000 }, () => { ... });
```

### Seed No es Determinístico

```typescript
// ❌ Error común: usar Math.random()
const seed = Math.random();
const rng = createRng(seed);

// ✅ Correcto: seed explícito
const seed = 42;
const rng = createRng(seed);
```

---

## 📈 Checklist Pre-Commit

```bash
# Antes de hacer commit:

pnpm test              # Todos los tests pasan
pnpm typecheck         # Tipos OK
pnpm lint              # Estilo OK

# Específico si cambié game-core:
cd packages/game-core
pnpm test              # Todos los tests
```

---

## 🔗 Recursos

- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Node Assertions](https://nodejs.org/api/assert.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (opcional)
- [Vitest](https://vitest.dev/) (opcional, alternativa a Node test)
