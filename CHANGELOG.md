# Changelog

Todos los cambios notables en este proyecto se documentan aquí.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/es/spec/v2.0.0.html).

## [Unreleased]

### Added

- ARCHITECTURE.md documentación completa
- CONTRIBUTING.md con convenciones de código
- DEVELOPMENT.md guía de setup
- TESTING.md estrategia de testing
- Constantes centralizadas en `packages/schemas/src/constants.ts`
- ESLint y Prettier configuración estandarizada
- .editorconfig para estándares de código
- VSCode settings recomendados

### Changed

- Mejorado README.md con estructura más clara
- Actualizado tsconfig.base.json con path aliases expandidos

### Fixed

- Documentación incompleta del proyecto

---

## [0.1.0] - 2026-08-20

### Added

- ✨ Minijuego plantilla: *La Carrera del Gato* (superposición)
- 🎮 Game loop determinístico a 60 Hz
- 🧪 Motor cuántico (vectores de estado, compuertas, medición)
- 📊 Sistema de scoring determinístico
- 💾 Supabase Realtime para leaderboards
- 🎨 Design system con Tailwind CSS
- 🌍 i18n con next-intl (ES principal)

### Technology Stack

- Next.js 15 + React 19
- React Three Fiber v9 (3D rendering)
- TypeScript 5.7 (strict mode)
- Zustand (state management)
- XState (state machines)
- Supabase (BDD + Realtime)
- Turborepo (monorepo orchestration)
- pnpm (package manager)

---

## Notas

- **Estado:** MVP en desarrollo activo
- **Minijuegos funcionales:** 1 de 4 categorías
- **Roadmap completo:** Ver CONTRIBUTING.md

---

[Unreleased]: https://github.com/[org]/qura-and-friends/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/[org]/qura-and-friends/releases/tag/v0.1.0
