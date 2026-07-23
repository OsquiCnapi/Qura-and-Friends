import { create } from "zustand";
import type { PlayerSlot } from "@quantum-party/game-core";

interface SessionState {
  seed: number;
  difficulty: number;
  players: PlayerSlot[];
  setSeed: (seed: number) => void;
  setDifficulty: (d: number) => void;
}

/** Configuración de la partida local (hotseat): 2 humanos + bots de relleno. */
// El nombre coincide con el modelo .glb por slot (RUNNER_MODEL_URLS): 0 = Gatuna, 1 = Tartigrada, 2 = Cobraveja.
const defaultPlayers: PlayerSlot[] = [
  { id: "p1", slot: 0, name: "Gatuna", character: "alicia", isBot: false, controlBinding: "p1" },
  { id: "p2", slot: 1, name: "Tartigrada", character: "conejo", isBot: false, controlBinding: "p2" },
  { id: "bot1", slot: 2, name: "Cobraveja", character: "conejo", isBot: true },
];

export const useSessionStore = create<SessionState>((set) => ({
  // Seed fija por defecto (determinismo). En producción se genera al crear la board_session.
  seed: 20260723,
  difficulty: 1,
  players: defaultPlayers,
  setSeed: (seed) => set({ seed }),
  setDifficulty: (difficulty) => set({ difficulty }),
}));
