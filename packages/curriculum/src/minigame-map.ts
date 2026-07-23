import type { MinigameContentMap } from "./types.js";

/**
 * Mapa minijuego → concepto → categoría. Refleja la tabla de trazabilidad del plan de arquitectura.
 * En este entregable solo "cat-race" tiene lógica; el resto queda documentado para las fases siguientes.
 */
export const MINIGAME_CONTENT_MAP: readonly MinigameContentMap[] = [
  // Categoría 1 · Superposición
  { minigameId: "cat-race", conceptId: "superposition-basics", category: "superposition" },
  { minigameId: "hidden-hatter", conceptId: "superposition-basics", category: "superposition" }, // Grover
  { minigameId: "forest-mirages", conceptId: "superposition-basics", category: "superposition" }, // tomografía

  // Categoría 2 · Entrelazamiento (fases siguientes)
  { minigameId: "blind-mirrors", conceptId: "entanglement-bell", category: "entanglement" },
  { minigameId: "sync-roses", conceptId: "entanglement-bell", category: "entanglement" },

  // Categoría 3 · Interferencia (fases siguientes)
  { minigameId: "false-turtle-song", conceptId: "interference-phase", category: "interference" },
  { minigameId: "mirror-maze", conceptId: "interference-phase", category: "interference" },

  // Categoría 4 · Annealing (fases siguientes)
  { minigameId: "openjij-quake", conceptId: "annealing-qubo", category: "annealing" },
  { minigameId: "rabbit-route", conceptId: "annealing-qubo", category: "annealing" },
];

export function conceptForMinigame(minigameId: string): string | undefined {
  return MINIGAME_CONTENT_MAP.find((m) => m.minigameId === minigameId)?.conceptId;
}
