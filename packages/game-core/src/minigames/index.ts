/**
 * Registro de los minijuegos disponibles. Al añadir uno nuevo: crear su carpeta (definition +
 * controller) y registrarlo aquí; la presentación (escena/HUD) se registra aparte en apps/web.
 */
import { registerMinigame } from "../minigame/registry.js";
import { catRaceDefinition } from "./cat-race/index.js";

let registered = false;

/** Idempotente: registra todas las definiciones de minijuegos una sola vez. */
export function registerAllMinigames(): void {
  if (registered) return;
  registerMinigame(catRaceDefinition);
  // TODO(fase siguiente): registrar los 19 minijuegos restantes aquí.
  registered = true;
}

export * from "./cat-race/index.js";
