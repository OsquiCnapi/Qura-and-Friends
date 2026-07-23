"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { createRng } from "@quantum-party/quantum-engine";
import {
  createBoardState,
  generateBoard,
  rollAndMove,
  type BoardState,
} from "@quantum-party/game-core";
import { Button, Panel } from "@quantum-party/ui";
import { useSessionStore } from "@/state/sessionStore.js";
import { useSettingsStore } from "@/state/settingsStore.js";

const COMMENTATOR_SFX_URL = "/audio/comentarista.mpeg";

const zoneColor: Record<string, string> = {
  superposition: "var(--color-superposition)",
  entanglement: "var(--color-entanglement)",
  interference: "var(--color-interference)",
  annealing: "var(--color-annealing)",
};

/**
 * Tablero por turnos (versión 2D del scaffold; la escena 3D BoardScene se conecta en fase de arte).
 * Tira el dado, mueve el peón y, al caer en una casilla de minijuego, ofrece jugar. En este entregable
 * el único minijuego jugable es "La Carrera del Gato".
 */
export function BoardView() {
  const t = useTranslations();
  const { seed, players } = useSessionStore();
  const rng = useMemo(() => createRng(seed), [seed]);
  const [state, setState] = useState<BoardState>(() =>
    createBoardState(generateBoard(6), players.length),
  );

  const pawn = state.pawns[state.turn];

  // Locución del comentarista al entrar al tablero. Si el navegador bloquea el
  // autoplay (sin interacción previa), se reintenta al primer clic/tecla. Respeta el mute.
  useEffect(() => {
    if (useSettingsStore.getState().muted) return;
    const audio = new Audio(COMMENTATOR_SFX_URL);
    audio.volume = 0.8;
    const tryPlay = () => {
      void audio.play().catch(() => {});
    };
    tryPlay();
    const onInteract = () => {
      tryPlay();
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
    window.addEventListener("pointerdown", onInteract);
    window.addEventListener("keydown", onInteract);
    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("app.title")}</h1>
        <a href="/lab/bloch-gates" className="text-sm text-[var(--color-entanglement)] underline">
          {t("app.lab")}
        </a>
      </header>

      {/* Pista de casillas */}
      <div className="flex flex-wrap gap-1">
        {state.tiles.map((tl) => {
          const occupied = state.pawns.some((p) => p.tileIndex === tl.index);
          return (
            <div
              key={tl.index}
              title={`${tl.zone} · ${tl.kind}`}
              className="grid h-9 w-9 place-items-center rounded text-xs"
              style={{
                backgroundColor: zoneColor[tl.zone] ?? "var(--color-quantum-surface-2)",
                outline: occupied ? "2px solid white" : "none",
                opacity: tl.index <= (pawn?.tileIndex ?? 0) ? 1 : 0.35,
              }}
            >
              {tl.kind === "star" ? "★" : tl.kind === "minigame" ? "▶" : ""}
            </div>
          );
        })}
      </div>

      <Panel className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span>
            Turno: <strong>{players[state.turn]?.name}</strong> · Ronda {state.round}
          </span>
          {state.lastRoll && <span>🎲 {state.lastRoll}</span>}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setState((s) => rollAndMove(s, rng))}>Tirar dado</Button>

          {/* En este entregable "La Carrera del Gato" es el único minijuego jugable, así que se ofrece
              SIEMPRE (no solo al caer en casilla de minijuego): tras cada tirada puedes jugarla. */}
          <a href="/play/cat-race">
            <Button variant="primary">Jugar: {t("minigames.catRace.title")}</Button>
          </a>
        </div>

        <p className="text-sm text-[var(--color-quantum-muted)]">
          {t("minigames.catRace.howto")}
        </p>
      </Panel>
    </main>
  );
}
