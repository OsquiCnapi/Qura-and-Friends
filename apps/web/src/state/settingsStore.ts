import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  muted: boolean;
  reducedMotion: boolean;
  toggleMute: () => void;
  setReducedMotion: (v: boolean) => void;
}

/** Ajustes persistentes (audio, accesibilidad). */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      muted: false,
      reducedMotion: false,
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      setReducedMotion: (v) => set({ reducedMotion: v }),
    }),
    { name: "qp-settings" },
  ),
);
