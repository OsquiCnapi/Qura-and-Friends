# Guía de Desarrollo 👨‍💻

Setup completo para desarrollar localmente **Qura and Friends**.

## 📋 Requisitos Previos

### Node.js y pnpm

```bash
# Node.js 22.x (verificar versión)
node --version
# v22.x.x

# pnpm 10+
npm install -g pnpm@latest
pnpm --version
# 10.31.0
```

### Git

```bash
git --version
# git version 2.x.x
```

---

## 🚀 Setup Inicial

### 1. Clonar Repositorio

```bash
git clone https://github.com/[org]/qura-and-friends.git
cd qura-and-friends
```

### 2. Instalar Dependencias

```bash
# En la raíz del monorepo
pnpm install

# Verificar instalación
pnpm --version  # Debe ser 10+
```

### 3. Verificar Setup

```bash
# Typecheck
pnpm typecheck

# Lint
pnpm lint

# Build (sin cambios en código)
pnpm build
```

---

## 🏃 Levantar Servidor de Desarrollo

### Modo Desarrollo (Todos los Paquetes)

```bash
# En raíz
pnpm dev

# Salida esperada:
# > web: - ready started server on 0.0.0.0:3000, url: http://localhost:3000
# > game-core: - watch mode
# > quantum-engine: - watch mode
# ...
```

Abre navegador en `http://localhost:3000`.

### Desarrollar un Paquete Específico

```bash
# Solo la app web
cd apps/web
pnpm dev

# Solo game-core
cd packages/game-core
pnpm test --watch

# Solo quantum-engine
cd packages/quantum-engine
pnpm test --watch
```

---

## 🔧 Configuración del Editor

### VS Code (Recomendado)

#### Extensiones Necesarias

1. **TypeScript Vue Plugin (Volar)** — Vue Support
   - `Vue.volar`

2. **ESLint** — Linting
   - `dbaeumer.vscode-eslint`

3. **Prettier** — Formateo
   - `esbenp.prettier-vscode`

4. **Tailwind CSS IntelliSense** — Autocompletado de clases
   - `bradlc.vscode-tailwindcss`

5. **GraphQL** (opcional) — Si trabajas con queries
   - `GraphQL.vscode-graphql`

#### Configuración VS Code

Crea `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

#### Workspace Recomendado

VS Code Workspace file (`.code-workspace`):

```json
{
  "folders": [
    { "path": "." },
    { "path": "apps/web", "name": "web" },
    { "path": "packages/game-core", "name": "game-core" },
    { "path": "packages/quantum-engine", "name": "quantum-engine" }
  ],
  "settings": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

---

## 📁 Scripts Disponibles

### En Raíz

```bash
pnpm dev                # Dev servers de todos los paquetes
pnpm build              # Build para producción
pnpm test               # Ejecutar tests
pnpm typecheck          # Verificar tipos TS
pnpm lint               # ESLint en todos los paquetes
pnpm clean              # Limpiar dist, .next, node_modules
```

### Por Paquete

```bash
cd apps/web
pnpm dev                # Next.js dev server (localhost:3000)
pnpm build              # Compilar Next.js
pnpm start              # Servir build de producción
pnpm lint               # Lint solo este paquete

cd packages/game-core
pnpm test               # Vitest + Node test
pnpm test --watch      # Watch mode
pnpm typecheck          # tsc --noEmit
pnpm lint               # ESLint
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
pnpm test

# Solo en game-core
cd packages/game-core && pnpm test

# Watch mode (rerun on change)
pnpm test --watch

# Con cobertura
pnpm test -- --coverage
```

### Escribir Tests

Formato esperado:

```typescript
// src/minigames/cat-race/controller.test.ts
import { describe, it, expect } from "node:test";
import { CatRaceController } from "./controller";
import { createMockContext } from "../__mocks__/context.mock";

describe("CatRaceController", () => {
  it("debería inicializar correctamente", () => {
    const ctx = createMockContext();
    const controller = new CatRaceController(def, ctx);
    
    controller.init();
    
    expect(controller.getRenderState()).toBeDefined();
  });
});
```

Ver [CONTRIBUTING.md#-testing](./CONTRIBUTING.md#-testing) para más.

---

## 🐛 Debugging

### Console y DevTools

```bash
# 1. Abrir Chrome DevTools (F12)

# 2. Console tab: acceso a singleton
window.gameController  // El controller del minijuego activo

# 3. Inspeccionar estado
window.gameController.getRenderState()
window.gameController.getHudState()
window.gameController.def  // Metadata del minijuego

# 4. Trigger events manualmente
window.gameController.onInput({ type: "jump", playerId: "p1" })
```

### Breakpoints en VS Code

1. Abre VS Code debugger (Ctrl+Shift+D)
2. Crea `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js Debug",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

3. Levanta Next.js en debug:
```bash
cd apps/web && NODE_OPTIONS='--inspect' pnpm dev
```

4. Abre debugger en VS Code y conecta.

---

## 🗂️ Estructura de Archivos

Referencia rápida:

```
qura-and-friends/
├── apps/web/                          # Next.js app
│   ├── src/
│   │   ├── app/                       # Rutas y layouts
│   │   ├── components/                # Componentes reutilizables
│   │   ├── game/                      # GameLoop, MinigameHost
│   │   ├── hud/                       # HUD components
│   │   ├── input/                     # Input manager
│   │   ├── lib/                       # Helpers y utils
│   │   ├── scenes/                    # Escenas R3F por minijuego
│   │   └── state/                     # Zustand stores
│   └── public/                        # Assets (modelos, audio)
│
├── packages/
│   ├── game-core/                     # Lógica de minijuegos (puro)
│   ├── quantum-engine/                # Motor cuántico
│   ├── quantum-viz/                   # Visualización (Bloch sphere)
│   ├── curriculum/                    # Contenido pedagógico
│   ├── schemas/                       # Types compartidos
│   └── ui/                            # UI components genéricos
│
├── docs/                              # Documentación
├── services/                          # Servicios backend (Python, Deno)
├── supabase/                          # Config base de datos
│
├── ARCHITECTURE.md                    # Arquitectura técnica ⭐
├── CONTRIBUTING.md                    # Guía de contribución ⭐
├── DEVELOPMENT.md                     # Este archivo ⭐
├── README.md                          # Introducción
├── tsconfig.base.json                 # TS config compartida
├── turbo.json                         # Turborepo config
├── pnpm-workspace.yaml                # Monorepo config
└── .editorconfig                      # Estándares de código
```

---

## 🔗 Path Aliases

Todos importados desde `tsconfig.base.json`:

```typescript
// ✅ SÍ (path alias)
import { Button } from "@quantum-party/ui";
import { useSessionStore } from "@/state/sessionStore";
import { GameLoop } from "@/game/GameLoop";

// ❌ NO (rutas relativas profundas)
import { Button } from "../../../../packages/ui/src";
import { useSessionStore } from "../../../../src/state/sessionStore";
```

**Disponibles:**
- `@quantum-party/*` → packages
- `@/*` → apps/web/src (en web app)

---

## 🌍 Internacionalización (i18n)

### Agregar Traducción

1. Edita `apps/web/src/i18n/messages/{locale}.json`
   ```json
   {
     "minigames": {
       "catRace": {
         "title": "La Carrera del Gato"
       }
     }
   }
   ```

2. En componente:
   ```typescript
   import { useTranslations } from "next-intl";
   
   export function CatRaceHud() {
     const t = useTranslations("minigames.catRace");
     return <div>{t("title")}</div>;
   }
   ```

### Idiomas Soportados

- `es` — Español (default)
- `en` — English (en desarrollo)

---

## 🚀 Build para Producción

```bash
# En raíz
pnpm build

# Resultado:
# - apps/web: .next/
# - packages/*: dist/

# Verificar tamaño de bundle
cd apps/web && pnpm build
# Next.js muestra tamaño de página + assets
```

### Deploy en Vercel

```bash
# Vercel detecta automáticamente Turborepo
# Solo haz push a main:
git add .
git commit -m "feat: nueva feature"
git push origin main

# Vercel build automático → https://[app].vercel.app
```

---

## 🆘 Troubleshooting

### Error: "pnpm: command not found"

```bash
npm install -g pnpm@latest
pnpm --version
```

### Error: "Cannot find module @quantum-party/ui"

```bash
# Verifica que tsconfig.base.json tenga los paths
# Limpia y reinstala
pnpm clean
pnpm install
```

### Error: "The following changes were made to package-lock.json"

```bash
# Si tienes package-lock.json (de npm), elimínalo
rm package-lock.json

# Usa SOLO pnpm
pnpm install
```

### Dev server no inicia

```bash
# 1. Limpia caché
pnpm clean

# 2. Reinstala
pnpm install

# 3. Levanta solo web
cd apps/web && pnpm dev --experimental-app-route
```

### Tests fallan con "Cannot find module"

```bash
# Problema: node test resolver no encuentra path aliases
# Solución: usa rutas relativas en tests o export desde index.ts

// tests/cat-race.test.ts
import { CatRaceController } from "../src/minigames/cat-race/index.js";
```

---

## 📚 Recursos

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Arquitectura técnica
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Guía de contribución
- [Turborepo Docs](https://turbo.build/repo/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Zustand](https://github.com/pmndrs/zustand)
- [XState](https://stately.ai/docs)

---

## ✅ Checklist Pre-Push

Antes de hacer push:

```bash
pnpm typecheck      # ✅ Sin errores de tipos
pnpm lint           # ✅ Estilo OK
pnpm test           # ✅ Tests pasan
pnpm build          # ✅ Build sin errores

# Si todo pasa:
git push origin [rama]
```

¡Listo para desarrollar! 🚀
