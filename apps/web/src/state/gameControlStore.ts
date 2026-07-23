import { create } from "zustand";

interface GameControlState {
  /** Pausa la simulación (el GameLoop congela el paso fijo mientras esté activa). */
  paused: boolean;
  setPaused: (paused: boolean) => void;
  toggle: () => void;
}

/**
 * Control de la partida desacoplado del HUD y de la simulación. El GameLoop lee `paused` con
 * `getState()` cada frame (nunca a través de un hook) para congelar el avance sin re-suscribirse.
 * El botón/overlay de pausa vive en el HUD y sí se suscribe reactivamente.
 */
export const useGameControlStore = create<GameControlState>((set, get) => ({
  paused: false,
  setPaused: (paused) => set({ paused }),
  toggle: () => set({ paused: !get().paused }),
}));
