/**
 * Gestor de input como SINGLETON de módulo (no contexto de React).
 *
 * Motivo: React Three Fiber usa un reconciler propio y el contexto de React NO cruza al <Canvas>. El
 * `GameLoop` corre dentro del canvas, así que lee el input desde este singleton en vez de por contexto.
 * Mantiene las teclas pulsadas en un Set (sin re-render) para leerse a 60 fps sin coste de React.
 */
import type { InputSnapshot, PlayerInput } from "@quantum-party/game-core";
import { ALL_GAME_CODES, KEYBOARD_MAP, type GameAction, type KeyBindings } from "./keyboardMap.js";

const pressed = new Set<string>();
let refCount = 0;

function onDown(e: KeyboardEvent) {
  if (ALL_GAME_CODES.has(e.code)) {
    pressed.add(e.code);
    if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
  }
}
function onUp(e: KeyboardEvent) {
  pressed.delete(e.code);
}
function onBlur() {
  pressed.clear();
}

/** Monta los listeners (idempotente por refCount). Llamar en un efecto de React. */
export function startInput(): void {
  if (typeof window === "undefined") return;
  refCount++;
  if (refCount === 1) {
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
  }
}

export function stopInput(): void {
  if (typeof window === "undefined") return;
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0) {
    window.removeEventListener("keydown", onDown);
    window.removeEventListener("keyup", onUp);
    window.removeEventListener("blur", onBlur);
    pressed.clear();
  }
}

function readPlayer(bindings: KeyBindings): PlayerInput {
  const isDown = (action: GameAction) => bindings[action].some((code) => pressed.has(code));
  const buttons: Record<string, boolean> = {
    left: isDown("left"),
    right: isDown("right"),
    up: isDown("up"),
    down: isDown("down"),
    superpose: isDown("superpose"),
    action: isDown("action"),
  };
  const axisX = (buttons.right ? 1 : 0) - (buttons.left ? 1 : 0);
  const axisY = (buttons.up ? 1 : 0) - (buttons.down ? 1 : 0);
  return { axisX, axisY, buttons };
}

/** Snapshot del frame actual para el tiempo de simulación `t`. */
export function buildSnapshot(t: number): InputSnapshot {
  return { t, p1: readPlayer(KEYBOARD_MAP.p1), p2: readPlayer(KEYBOARD_MAP.p2) };
}
