import { create } from "zustand";
import type { HudModel } from "@quantum-party/game-core";

interface HudState {
  model: HudModel | null;
  /** Publica un snapshot del HUD. Se llama throttled (~10–15 Hz) desde el loop, NO a 60 fps. */
  publish: (model: HudModel) => void;
  clear: () => void;
}

/**
 * Estado del HUD desacoplado de la simulación. El controller vive mutable en un ref y avanza a 60 fps;
 * solo publica aquí un snapshot serializable con baja frecuencia para evitar tormentas de re-render.
 */
export const useHudStore = create<HudState>((set) => ({
  model: null,
  publish: (model) => set({ model }),
  clear: () => set({ model: null }),
}));
