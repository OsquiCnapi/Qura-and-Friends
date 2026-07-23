/**
 * @quantum-party/game-core
 *
 * Contrato Minigame + orquestación (registry, game loop, scoring, tablero). TS puro, sin React/three.
 */
export * from "./minigame/types.js";
export * from "./minigame/contract.js";
export * from "./minigame/registry.js";

export { createFixedStepLoop, type FixedStepLoop } from "./loop/fixedStep.js";

export * from "./scoring/score.js";
export * from "./scoring/validators.js";

export * from "./board/tiles.js";
export * from "./board/dice.js";
export * from "./board/board.js";

export { registerAllMinigames } from "./minigames/index.js";
export * from "./minigames/cat-race/index.js";
