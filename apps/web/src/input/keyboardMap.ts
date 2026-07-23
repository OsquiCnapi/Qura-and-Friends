/**
 * Mapeo de teclado para 2 jugadores locales (hotseat). Remapeable en el futuro desde ajustes.
 * P1 = WASD + Espacio; P2 = Flechas + "0" del pad numérico / Enter.
 * Los valores son `KeyboardEvent.code` (independientes de la distribución del teclado).
 */
export type GameAction = "left" | "right" | "up" | "down" | "superpose" | "action";

export type KeyBindings = Record<GameAction, string[]>;

export const KEYBOARD_MAP: { p1: KeyBindings; p2: KeyBindings } = {
  p1: {
    left: ["KeyA"],
    right: ["KeyD"],
    up: ["KeyW"],
    down: ["KeyS"],
    superpose: ["Space"],
    action: ["KeyE"],
  },
  p2: {
    left: ["ArrowLeft"],
    right: ["ArrowRight"],
    up: ["ArrowUp"],
    down: ["ArrowDown"],
    superpose: ["Enter", "Numpad0"],
    action: ["ShiftRight"],
  },
};

/** Todas las teclas que el juego captura (para prevenir el scroll por defecto, etc.). */
export const ALL_GAME_CODES: ReadonlySet<string> = new Set(
  Object.values(KEYBOARD_MAP).flatMap((b) => Object.values(b).flat()),
);
