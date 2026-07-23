import type { MinigameContext, MinigameDefinition } from "../../minigame/contract.js";
import { CatRaceController } from "./controller.js";

/**
 * "La Carrera del Gato" — minijuego plantilla (Categoría 1 · superposición).
 * Enseña superposición y colapso por medición: mantener la superposición te deja atravesar obstáculos,
 * pero drena la coherencia; quedarte sin ella te hace colapsar a un carril aleatorio.
 */
export const catRaceDefinition: MinigameDefinition = {
  id: "cat-race",
  i18nKey: "minigames.catRace",
  conceptId: "superposition-basics",
  concept: "superposition",
  category: "superposition",
  difficulty: 1,
  players: { min: 1, max: 2, supportsBots: true },
  controlScheme: "race",
  estimatedDurationSec: 45,
  createController(ctx: MinigameContext) {
    const controller = new CatRaceController(catRaceDefinition, ctx);
    return controller;
  },
};
