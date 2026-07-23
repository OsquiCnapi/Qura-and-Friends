import { createMachine } from "xstate";

/**
 * Máquina de estados del macro-flujo (XState). Orquesta boot → menú → tablero → minijuego → resultados.
 * El estado de simulación NO vive aquí (eso está en el MinigameController a 60 fps); esta FSM solo
 * gobierna las transiciones de pantalla y el turno del tablero.
 */
export const appMachine = createMachine({
  id: "app",
  initial: "boot",
  states: {
    boot: { on: { READY: "menu" } },
    menu: { on: { START: "board" } },
    board: {
      on: { ROLL: "board", LAUNCH_MINIGAME: "minigame", FINISH_GAME: "gameOver" },
    },
    minigame: {
      on: { MINIGAME_DONE: "results" },
    },
    results: {
      on: { CONTINUE: "board" },
    },
    gameOver: {
      on: { RESTART: "menu" },
    },
  },
});
