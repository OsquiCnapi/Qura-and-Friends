# Roadmap 2026-2027

Visión a largo plazo de **Qura and Friends** y nuestros planes para expandir la plataforma educativa.

## 🎯 Fases

### 🟩 Fase 1: MVP (En Progreso)

**Objetivo:** Establecer fundaciones sólidas con un minijuego funcional.

**Status:** 50% completado

- [x] Arquitectura de monorepo
- [x] Motor cuántico TS (superposición)
- [x] Minijuego plantilla (*La Carrera del Gato*)
- [x] Game loop determinístico a 60 Hz
- [x] Sistema de scoring
- [x] Supabase Realtime
- [x] Documentación técnica
- [ ] Testing completo
- [ ] Optimización de performance
- [ ] Landing page pulida

**Timeline:** Q3-Q4 2026

---

### 🟨 Fase 2: Expansión de Minijuegos

**Objetivo:** Implementar las 4 categorías de conceptos cuánticos.

**Status:** No iniciado

#### Categoría 2: Entrelazamiento (⭐⭐)

- [ ] Minijuego "Pares de Bell"
- [ ] Visualización de correlaciones
- [ ] Mecánica: medir vs. no medir
- [ ] Tests de correlación cuántica
- [ ] Contenido pedagógico
- [ ] i18n (ES, EN)

**Timeline:** Q1 2027

#### Categoría 3: Interferencia (⭐⭐⭐)

- [ ] Minijuego "Experimento de Doble Rendija"
- [ ] Visualización de fase
- [ ] Animación de amplitudes complejas
- [ ] Esfera de Bloch avanzada
- [ ] Tests de patrón de interferencia
- [ ] Contenido pedagógico

**Timeline:** Q2 2027

#### Categoría 4: Quantum Annealing (⭐⭐⭐⭐)

- [ ] Minijuego "Viajante del Recocido"
- [ ] Integración con OpenJij (Python service)
- [ ] Resolver QUBO en tiempo real
- [ ] Visualización de energía
- [ ] Benchmark vs. soluciones clásicas
- [ ] Contenido pedagógico avanzado

**Timeline:** Q3 2027

---

### 🟦 Fase 3: Panel Docente (Learn / Aula)

**Objetivo:** Crear herramientas educativas para profesores.

**Status:** Infraestructura lista, UI pendiente

- [ ] Vista de lecciones por concepto
- [ ] Laboratorio interactivo (Bloch sphere)
- [ ] Simulador de circuitos cuánticos
- [ ] Notas de profesor
- [ ] Ejercicios progresivos
- [ ] Quiz interactivas
- [ ] Progreso del estudiante

**Timeline:** Q2-Q4 2027

---

### 🟧 Fase 4: Multijugador en Red (Opcional)

**Objetivo:** Soporte para jugar contra otros en línea.

**Status:** Diseño preliminary

- [ ] Arquitectura cliente-servidor escalable
- [ ] Matchmaking
- [ ] Ranking global
- [ ] Lobby y salas
- [ ] Streaming de resultados
- [ ] Anti-cheat mejorado

**Timeline:** 2028+

---

## 📊 Características por Fase

| Feature | Fase 1 | Fase 2 | Fase 3 | Fase 4 |
|---------|--------|--------|--------|--------|
| Minijuego hotseat local | ✅ | ✅ | ✅ | ✅ |
| Motor cuántico | ✅ | ✅ | ✅ | ✅ |
| Scoring determinístico | ✅ | ✅ | ✅ | ✅ |
| 4 categorías de conceptos | ❌ | ✅ | ✅ | ✅ |
| Panel docente | ❌ | ❌ | ✅ | ✅ |
| Multijugador en red | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Objetivos Transversales

### Calidad de Código

- [x] TypeScript estricto
- [x] Documentación técnica (ARCHITECTURE.md, etc)
- [x] Convenciones claras (CONTRIBUTING.md)
- [ ] 80%+ test coverage (game-core, quantum-engine)
- [ ] CI/CD automatizado
- [ ] Code reviews obligatorios

### Rendimiento

- [ ] Lazy-loading de modelos 3D
- [ ] Compresión de assets (Git LFS)
- [ ] Bundle size < 500 KB (gzipped)
- [ ] Tiempo de carga < 2 segundos
- [ ] Juego fluido a 60 FPS
- [ ] Optimización de Quantum Engine

### Accesibilidad

- [ ] WCAG 2.1 AA compliance
- [ ] Soporte de screen readers
- [ ] Contraste de color para daltonismo
- [ ] Soporte de `prefers-reduced-motion`
- [ ] Navegación solo con teclado

### Internacionalización

- [x] Español (ES) principal
- [ ] Inglés (EN)
- [ ] Más idiomas TBD

---

## 🔧 Mejoras Técnicas Planificadas

### Backend

- [ ] Migrar Edge Functions a funciones TypeScript compiladas
- [ ] Mejorar validación anti-trampa con ML
- [ ] Cacheo de resultados de annealing
- [ ] Webhook para eventos de juego

### Frontend

- [ ] Upgrade a React 20 (cuando esté stable)
- [ ] Turbopack (en lugar de webpack)
- [ ] PWA (Progressive Web App)
- [ ] Offline mode mejorado

### DevOps

- [ ] GitHub Actions para CI/CD
- [ ] Automated deploys a Vercel
- [ ] Monitoring con Sentry
- [ ] Analytics con Posthog

---

## 📈 Métricas de Éxito

Por Fase:

### Fase 1
- ✅ MVP jugable con 1 minijuego
- ✅ Score reproducible y validable
- ✅ Documentación técnica completa
- ⏳ 100+ actividades de contribuidores externos

### Fase 2
- Adopción en 50+ aulas
- 1000+ partidas jugadas/mes
- Score system bulletproof (0 fraudes)
- 4 minijuegos completamente testados

### Fase 3
- Adopción en 200+ aulas
- Plataforma docente usada activamente
- Contenido pedagógico en 3+ idiomas

### Fase 4
- Comunidad global de jugadores
- Ranking internacional
- Campeonatos educativos

---

## 🤝 Invitamos a Contribuidores

Abierto a Pull Requests para:

- Minijuegos nuevos (sigue [CONTRIBUTING.md](./CONTRIBUTING.md))
- Optimizaciones de quantum-engine
- Mejoras de UI/UX
- Localización de idiomas
- Documentación y traducción

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles.

---

## 📞 Feedback

¿Tienes ideas para el roadmap?

- Abre un GitHub Issue
- Discute en GitHub Discussions
- Email al equipo de mantenimiento

---

**Última actualización:** 2026-08-20

**Próxima revisión:** Q3 2026
