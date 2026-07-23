/**
 * Registry de DEFINICIONES de minijuegos (lógica pura). La presentación (escena R3F + HUD) se resuelve
 * aparte en apps/web (`src/scenes/minigames/registry.ts`) porque depende de React/three y no puede vivir
 * en este paquete framework-agnostic.
 */
import type { MinigameDefinition } from "./contract.js";
import type { QuantumCategory } from "./types.js";

const registry = new Map<string, MinigameDefinition>();

export function registerMinigame(def: MinigameDefinition): void {
  if (registry.has(def.id)) {
    throw new Error(`registerMinigame: id duplicado "${def.id}"`);
  }
  registry.set(def.id, def);
}

export function getMinigame(id: string): MinigameDefinition | undefined {
  return registry.get(id);
}

export function requireMinigame(id: string): MinigameDefinition {
  const def = registry.get(id);
  if (!def) throw new Error(`requireMinigame: no existe "${id}"`);
  return def;
}

export function listMinigames(): MinigameDefinition[] {
  return [...registry.values()];
}

export function listByCategory(category: QuantumCategory): MinigameDefinition[] {
  return listMinigames().filter((d) => d.category === category);
}

/** Ordena por dificultad para la progresión del tablero (fácil → difícil). */
export function listByDifficulty(): MinigameDefinition[] {
  return listMinigames().sort((a, b) => a.difficulty - b.difficulty);
}
