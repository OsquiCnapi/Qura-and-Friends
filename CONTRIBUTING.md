# Guía de Contribución 🤝

¡Gracias por contribuir a **Qura and Friends**! Esta guía explica cómo colaborar eficientemente.

## 📋 Contenidos

- [Cómo Configurar tu Entorno](#-cómo-configurar-tu-entorno)
- [Estructura y Convenciones](#-estructura-y-convenciones)
- [Flujo de Contribución](#-flujo-de-contribución)
- [Testing](#-testing)
- [Commit y PR](#-commit-y-pr)
- [FAQ](#-faq)

---

## 🛠️ Cómo Configurar tu Entorno

Ver [DEVELOPMENT.md](./DEVELOPMENT.md) para setup detallado.

**Resumen rápido:**

```bash
# Clonar
git clone https://github.com/[org]/qura-and-friends.git
cd qura-and-friends

# Instalar (usa pnpm, no npm ni yarn)
pnpm install

# Levantar dev server
pnpm dev

# Abrir en navegador
http://localhost:3000
```

---

## 📐 Estructura y Convenciones

### Convenciones de Nombres

| Concepto | Patrón | Ejemplo |
|---|---|---|
| **Archivo componente React** | PascalCase | `HudRoot.tsx`, `Button.tsx` |
| **Archivo función/clase TS** | camelCase o kebab-case | `inputManager.ts`, `fixed-step.ts` |
| **Archivo de tipos** | types.ts | `minigame/types.ts` |
| **Archivo de constantes** | constants.ts o UPPERCASE_SNAKE | `GAME_CONFIG.ts` |
| **Archivo de tests** | `{source}.test.ts` | `statevector.test.ts` |
| **Variables globales** | camelCase | `sessionStore`, `gameConfig` |
| **Constantes globales** | UPPER_SNAKE_CASE | `MAX_PLAYERS`, `FIXED_TIMESTEP` |
| **Tipos/Interfaces** | PascalCase | `MinigameController`, `PlayerSlot` |
| **Enums** | PascalCase (valores UPPER_SNAKE) | `enum Difficulty { EASY, HARD }` |

### Estructura de Carpetas

Mantén una estructura clara y predecible:

```
src/
├── [feature-folder]/
│   ├── index.ts              # Re-exporta públicos
│   ├── {Component}.tsx       # Componentes React
│   ├── types.ts              # Types locales
│   ├── constants.ts          # Constantes locales
│   ├── {helper}.ts           # Funciones auxiliares
│   └── __tests__/            # Tests
│       └── {Component}.test.ts
```

**Evita:**
- ❌ Crear archivos sueltos sin carpeta temática
- ❌ Importar desde `../../../..`
- ❌ Mezclar lógica de negocio con presentación

**Prefiere:**
- ✅ Agrupar por feature
- ✅ Usar path aliases (`@/components`, `@quantum-party/game-core`)
- ✅ Exportar desde `index.ts` central

### TypeScript Strict Mode

Trabajamos con TypeScript **ESTRICTO**. No toleramos:

```typescript
// ❌ NO
const result: any = compute(); // NUNCA

// ❌ NO
function process(data) { ... }  // parámetro sin type

// ✅ SÍ
const result: number = compute();

// ✅ SÍ
function process(data: InputSnapshot): void { ... }
```

### Imports

**Orden recomendado:**

```typescript
// 1. Imports de librerías externas
import { useState, useEffect } from "react";
import { create } from "zustand";

// 2. Imports de packages del monorepo
import { createQuantumEngine } from "@quantum-party/quantum-engine";
import { Button } from "@quantum-party/ui";

// 3. Imports locales
import { useSessionStore } from "@/state/sessionStore";
import { GameLoop } from "@/game/GameLoop";
import type { GameConfig } from "./types";

// 4. Imports de estilos
import "./styles.css";
```

**Nota:** Usa `import type` para importaciones de tipos puros (reduce bundle).

### Componentes React

#### Funcionales (preferido)

```typescript
interface Props {
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export function MyComponent({ title, onClose, children }: Props) {
  return <div>{title}</div>;
}

// Para componentes grandes, separa en archivo de props
// MyComponent.tsx → import type { MyComponentProps } from "./types"
```

#### Exportación Nombrada

```typescript
// ✅ Prefiere
export function Button() { ... }

// ❌ Evita default exports (dificulta refactoring)
export default function Button() { ... }
```

#### Documentación JSDoc (cuando sea no-trivial)

```typescript
/**
 * Host genérico de minijuego. Monta el canvas, game loop y overlay de resultados.
 * 
 * @param minigameId - ID del minijuego a jugar
 * @returns Componente React para la pantalla de juego
 * 
 * @example
 * <MinigameHost minigameId="cat-race" />
 */
export function MinigameHost({ minigameId }: { minigameId: string }) {
  // ...
}
```

### Lógica de Negocio (TS Puro)

Las funciones core deben ser **puras** y **determinísticas**:

```typescript
// ✅ PURO: No side-effects, mismo input → mismo output
export function calculateScore(
  metrics: PlayerMetrics,
  difficulty: number
): number {
  return metrics.collapses * difficulty * 10;
}

// ❌ IMPURO: Lee/escribe estado global
let globalScore = 0;
export function addScore(n: number) {
  globalScore += n; // ❌ Side-effect
}

// ❌ IMPURO: No determinístico
export function randomSeed(): number {
  return Math.random(); // ❌ No reproducible
}

// ✅ PURO: Usa RNG inyectado
export function randomSeed(rng: Rng): number {
  return rng.int(1_000_000);
}
```

### State Management (Zustand)

```typescript
// ✅ Estructura clara con tipos
interface SessionState {
  seed: number;
  difficulty: number;
  setSeed: (s: number) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  seed: 0,
  difficulty: 1,
  setSeed: (seed) => set({ seed }),
}));

// Uso
const seed = useSessionStore((s) => s.seed);
useSessionStore.setState({ difficulty: 2 });
```

---

## 🎮 Flujo de Contribución

### Para Añadir un Minijuego

1. **Crear estructura** en `packages/game-core/src/minigames/{id}/`:
   ```
   cat-race/
   ├── index.ts
   ├── definition.ts
   ├── controller.ts
   ├── types.ts
   ├── config.ts
   └── utils.ts (opcional)
   ```

2. **Implementar `definition.ts`** (metadata):
   ```typescript
   export const definition: MinigameDefinition = {
     id: "cat-race",
     conceptId: "superposition-basics",
     // ... resto de metadata
   };
   ```

3. **Implementar `controller.ts`** (lógica):
   - Extends `MinigameController<RenderState>`
   - `init()`, `start()`, `update()`, `getRenderState()`, etc.
   - ⚠️ Debe ser PURO y DETERMINÍSTICO

4. **Registrar en `packages/game-core/src/minigames/index.ts`**:
   ```typescript
   registerMinigame(catRaceDefinition);
   ```

5. **Crear presentación en `apps/web/src/scenes/minigames/{id}/`**:
   - `Scene.tsx` (componente R3F)
   - `HudOverlay.tsx` (opcional)

6. **Registrar presentación en `apps/web/src/scenes/minigames/presentation.ts`**:
   ```typescript
   registry["cat-race"] = {
     Scene: CatRaceScene,
     HudOverlay: CatRaceHud,
   };
   ```

7. **Añadir contenido pedagógico** en `packages/curriculum/src/concepts/`

8. **Traducir** en `apps/web/src/i18n/messages/`

### Para Modificar Lógica Core

1. **Ubicación:** `packages/game-core/src/`
2. **Impacto:** Puede afectar determinismo → ⚠️ Requiere testing
3. **Reproducibilidad:** Usa `ctx.rng` para cualquier aleatoriedad
4. **Validación servidor:** El `proof` debe permitir revalidar

### Para Cambios en UI/Componentes

1. **Ubicación:** `apps/web/src/components/` o `packages/ui/src/`
2. **Testing:** Screenshots visuales si es complejo
3. **Accesibilidad:** Mantén `aria-*` labels
4. **Responsivo:** Testea en mobile + tablet

---

## 🧪 Testing

### Lógica Core (game-core, quantum-engine)

```bash
# Ejecutar tests
pnpm test

# Con cobertura
pnpm test -- --coverage
```

**Formato requerido:**

```typescript
// cat-race.test.ts
import { describe, it, expect } from "node:test";
import { CatRaceController } from "./controller";

describe("CatRaceController", () => {
  it("debería inicializar con estado vacío", () => {
    const ctx = createMockContext();
    const controller = new CatRaceController(def, ctx);
    
    controller.init();
    
    expect(controller.getRenderState().runners).toHaveLength(2);
  });

  it("debería ser determinístico con mismo seed", () => {
    const result1 = simulate({ seed: 42 });
    const result2 = simulate({ seed: 42 });
    
    expect(result1).toEqual(result2);
  });
});
```

### Componentes React

Usa snapshots o Vitest con React Testing Library:

```typescript
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renderiza correctamente", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

### Regla de Oro

**Toda lógica determinística debe tener tests.** Funciones puras = tests confiables.

---

## 📝 Commit y PR

### Commit Message

Sigue [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Tipos:**
- `feat`: Nueva feature
- `fix`: Corrección de bug
- `refactor`: Cambio de código sin alterar funcionalidad
- `docs`: Cambios en documentación
- `test`: Añadir/mejorar tests
- `chore`: Tasks, deps, CI/CD
- `perf`: Mejoras de performance

**Ejemplos:**

```
feat(minigames): añadir "La Carrera del Gato"

Implementa primer minijuego de superposición.
- Nueva categoría "race" en game-core
- Controlador con validación cuántica
- Escena R3F con 3 carriles y obstáculos

Fixes #42
```

```
fix(input): corregir bug en lectura dual de joystick
```

```
docs(architecture): mejorar diagrama de flujo
```

### Pull Request

1. **Rama temática:** `feat/cat-race`, `fix/input-binding`, etc.
2. **Descripción clara:**
   ```markdown
   ## Qué
   Describe brevemente qué hace el PR.
   
   ## Por qué
   Motiva la decisión.
   
   ## Cómo se testea
   Pasos para validar los cambios.
   
   ## Checklist
   - [ ] Tests agregados/pasados
   - [ ] Documentación actualizada
   - [ ] Linting y typecheck OK
   - [ ] Commits claros
   ```

3. **Antes de mergedear:**
   ```bash
   pnpm build          # Debe compilar sin errores
   pnpm test           # Todos los tests pasan
   pnpm typecheck      # Sin errores de tipos
   pnpm lint           # ESLint OK
   ```

---

## ⚠️ Reglas Importantes

### ❌ NUNCA

- Usar `any` en TypeScript
- Commit sin tests si es lógica core
- Importar de `../../../..` (usa path aliases)
- Modificar `tsconfig.base.json` sin discussion
- Cambiar API de `MinigameController` sin agregar minijuegos nuevos para validar

### ✅ SIEMPRE

- Usa `pnpm` (no npm, no yarn)
- Implementa tipos TypeScript
- Escribe tests para lógica core
- Mantén componentes pequeños y enfocados
- Documenta APIs no-triviales
- Verifica `pnpm lint` y `pnpm typecheck` antes de push

---

## 🆘 FAQ

### ¿Cómo agregar una dependencia?

```bash
# En el paquete específico
cd packages/game-core
pnpm add lodash

# En la app web
cd apps/web
pnpm add @radix-ui/react-dialog

# En root (dev dependency compartida)
cd . && pnpm add -D eslint -w
```

### ¿Cómo debuggear un minijuego?

1. Abre DevTools (F12)
2. Usa `window.gameController` en la consola (inyectado en dev)
3. Llama `window.gameController.getRenderState()` para inspeccionar

### ¿Dónde van las constantes?

- **Globales (todas las apps):** `packages/schemas/src/constants.ts`
- **Específicas de game-core:** `packages/game-core/src/constants.ts`
- **Específicas de web:** `apps/web/src/lib/constants.ts`

### ¿Cómo añadir traducciones?

1. Edita `apps/web/src/i18n/messages/{locale}.json`
2. Importa en componente: `const t = useTranslations("minigames.catRace")`
3. Usa: `<div>{t("title")}</div>`

### ¿Cómo validar que mi minijuego es determinístico?

```typescript
// Ejecuta varias veces con mismo seed
for (let i = 0; i < 100; i++) {
  const r1 = simulate({ seed: 42, inputs });
  const r2 = simulate({ seed: 42, inputs });
  assert(r1.score === r2.score);
}
```

---

## 📞 Contacto

- **Problemas o dudas:** Abre un issue en GitHub
- **Discusiones arquitectónicas:** GitHub Discussions
- **Security issues:** Email privado (nunca en public issues)

¡Gracias por contribuir! 🚀
