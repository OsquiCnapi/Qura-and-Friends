# 📖 Índice de Documentación

Guía rápida para encontrar lo que necesitas.

## 🆕 ¡Primera Vez?

1. **Lee [README.md](./README.md)** (5 min) — Qué es Qura
2. **Lee [DEVELOPMENT.md](./DEVELOPMENT.md)** (10 min) — Cómo instalar
3. **Levanta servidor:** `pnpm dev` (2 min)
4. **Prueba el juego:** http://localhost:3000 (5 min)

👉 **Total: 20 minutos** para tener todo funcionando.

---

## 👨‍💻 Para Desarrolladores

### Entender el Proyecto

| Documento | Propósito | Tiempo |
|-----------|-----------|--------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Cómo está construido | 20 min |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Cómo contribuir | 15 min |
| [docs/carrera-del-gato-proposito.md](./docs/carrera-del-gato-proposito.md) | Game Design Document | 30 min |

### Empezar a Codificar

1. **Familiarízate con convenciones:** [CONTRIBUTING.md](./CONTRIBUTING.md#-estructura-y-convenciones)
2. **Entiende la arquitectura:** [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Configura tu editor:** [DEVELOPMENT.md](./DEVELOPMENT.md#-configuración-del-editor)
4. **Sigue patterns existentes** en [packages/game-core/src/minigames/cat-race/](./packages/game-core/src/minigames/cat-race/)

### Testing y Calidad

| Documento | Propósito |
|-----------|-----------|
| [TESTING.md](./TESTING.md) | Cómo escribir tests |
| [CONTRIBUTING.md#-testing](./CONTRIBUTING.md#-testing) | Qué testear |
| [DEVELOPMENT.md#-scripts-disponibles](./DEVELOPMENT.md#-scripts-disponibles) | Comandos útiles |

---

## 🎮 Para Crear Minijuegos

### Guía Paso a Paso

1. Lee [CONTRIBUTING.md#-para-añadir-un-minijuego](./CONTRIBUTING.md#-para-añadir-un-minijuego)
2. Copia estructura de [packages/game-core/src/minigames/cat-race/](./packages/game-core/src/minigames/cat-race/)
3. Implementa `MinigameController` según [ARCHITECTURE.md#-contrato-minijuego](./ARCHITECTURE.md#-contrato-minijuego)
4. Crea escena R3F en [apps/web/src/scenes/minigames/](./apps/web/src/scenes/minigames/)
5. Registra en presentación registry
6. Escribe tests según [TESTING.md](./TESTING.md)

### Referencias

- **Contrato Minijuego:** [packages/game-core/src/minigame/contract.ts](./packages/game-core/src/minigame/contract.ts)
- **Ejemplo Cat-Race:** [packages/game-core/src/minigames/cat-race/](./packages/game-core/src/minigames/cat-race/)
- **Game Loop:** [apps/web/src/game/GameLoop.tsx](./apps/web/src/game/GameLoop.tsx)

---

## 🚀 Desplegar

### Local

```bash
pnpm dev        # Ver DEVELOPMENT.md
```

### Vercel

Ver [README.md#-despliegue](./README.md#-despliegue) o [DEVELOPMENT.md#-despliegue-en-vercel](./DEVELOPMENT.md#-despliegue-en-vercel)

---

## 🔍 Troubleshooting

| Problema | Dónde Buscar |
|----------|--------------|
| Setup no funciona | [DEVELOPMENT.md#-troubleshooting](./DEVELOPMENT.md#-troubleshooting) |
| Tests fallan | [TESTING.md#-troubleshooting](./TESTING.md#-troubleshooting) |
| Arquitectura confusa | [ARCHITECTURE.md](./ARCHITECTURE.md) (lee completo) |
| Convenciones de código | [CONTRIBUTING.md#-estructura-y-convenciones](./CONTRIBUTING.md#-estructura-y-convenciones) |
| Bug de seguridad | [SECURITY.md](./SECURITY.md) |

---

## 📊 Estructura Rápida

```
├── README.md                   ← Empeza aquí
├── ARCHITECTURE.md             ← Arquitectura técnica
├── CONTRIBUTING.md             ← Convenciones y cómo contribuir
├── DEVELOPMENT.md              ← Setup y desarrollo
├── TESTING.md                  ← Testing strategy
├── ROADMAP.md                  ← Visión a largo plazo
├── SECURITY.md                 ← Seguridad
├── CODE_OF_CONDUCT.md          ← Comunidad
│
├── apps/web/                   ← Next.js app (React + R3F)
├── packages/                   ← TS puro (game-core, quantum-engine, etc)
├── services/annealing/         ← Python (FastAPI + OpenJij)
├── supabase/                   ← Configuración BDD
└── docs/                       ← Documentación adicional
```

---

## 🔗 Links Rápidos

### Configuración

- [.editorconfig](./.editorconfig) — Estándares de código
- [.eslintrc.json](./.eslintrc.json) — Linting
- [.prettierrc](./.prettierrc) — Formatting
- [tsconfig.base.json](./tsconfig.base.json) — TypeScript
- [.vscode/settings.json](./.vscode/settings.json) — VSCode

### Desarrollo

- [package.json](./package.json) — Scripts root
- [turbo.json](./turbo.json) — Turborepo config
- [pnpm-workspace.yaml](./pnpm-workspace.yaml) — Monorepo

### Comunidad

- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) — Cómo comportarse
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Cómo contribuir
- [SECURITY.md](./SECURITY.md) — Reportar vulnerabilidades
- [.github/](./.github/) — Templates para issues/PRs

---

## 📚 Para Aprender Conceptos Cuánticos

El juego enseña:

1. **Superposición** → *La Carrera del Gato* (funcional)
2. **Entrelazamiento** → En desarrollo
3. **Interferencia** → En desarrollo
4. **Quantum Annealing** → En desarrollo

Para aprender **mientras juegas**, consulta:
- [docs/carrera-del-gato-proposito.md](./docs/carrera-del-gato-proposito.md)
- `apps/web/src/i18n/messages/es.json` (contenido educativo)
- `packages/curriculum/` (mapeo conceptos-minijuegos)

---

## 🎓 Recursos Externos

### Tecnología

- [Next.js Docs](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Zustand](https://github.com/pmndrs/zustand)
- [XState](https://stately.ai/docs)
- [Turborepo](https://turbo.build/repo/docs)

### Computación Cuántica

- [IBM Quantum](https://quantum-computing.ibm.com/)
- [Qiskit](https://qiskit.org/)
- [OpenJij](https://www.openij.org/)

---

## ✨ Checklist para Nueva Contribución

- [ ] Leí [CONTRIBUTING.md](./CONTRIBUTING.md)
- [ ] Leí [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ ] Ejecuté `pnpm install`
- [ ] Ejecuté `pnpm dev` y funciona
- [ ] Ejecuté `pnpm typecheck` sin errores
- [ ] Ejecuté `pnpm lint` sin errores
- [ ] Executé `pnpm test` (si aplica)
- [ ] Mi código sigue convenciones
- [ ] Escribí tests (si es lógica core)
- [ ] Mis commits tienen mensajes claros

---

## 💬 ¿Preguntas?

- **Issues:** [GitHub Issues](https://github.com/[org]/qura-and-friends/issues)
- **Discussions:** [GitHub Discussions](https://github.com/[org]/qura-and-friends/discussions)
- **Seguridad:** Email privado (ver [SECURITY.md](./SECURITY.md))

---

**Última actualización:** 2026-08-20

---

<div align="center">

🚀 **¡Feliz hacking!** Empieza con [README.md](./README.md) 👇

</div>
