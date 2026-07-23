"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createQuantumEngine, createRng } from "@quantum-party/quantum-engine";
import {
  registerAllMinigames,
  requireMinigame,
  type MinigameContext,
  type MinigameController,
  type MinigameResult,
} from "@quantum-party/game-core";
import { Button, Panel } from "@quantum-party/ui";
import { GameCanvas } from "@/three/GameCanvas.js";
import { GameLoop } from "@/game/GameLoop.js";
import { HudRoot } from "@/hud/HudRoot.js";
import { InputProvider } from "@/input/InputProvider.js";
import { getPresentation } from "@/scenes/minigames/presentation.js";
import { WinnerShowcase } from "@/scenes/minigames/cat-race/WinnerShowcase.js";
import { useSessionStore } from "@/state/sessionStore.js";
import { useHudStore } from "@/state/hudStore.js";
import { useGameControlStore } from "@/state/gameControlStore.js";

/**
 * Audio de victoria por personaje. El orden coincide con RUNNER_MODEL_URLS (slot % 3):
 * 0 = gatuna, 1 = tartígrada, 2 = cobraaveja.
 */
const WIN_AUDIO_BY_MODEL = [
  "/audio/audio_gata.mpeg",
  "/audio/audio_tartigrada.mpeg",
  "/audio/audio_cobra.mpeg",
] as const;

/**
 * Host GENÉRICO de minijuego. Ensambla: contexto (seed + motor cuántico) → controller (lógica pura) →
 * <Canvas> con el GameLoop y la escena → HUD por fuera → overlay de resultados. Añadir un minijuego no
 * requiere tocar este componente: basta con registrarlo (game-core) y su presentación (registry).
 */
export function MinigameHost({ minigameId }: { minigameId: string }) {
  const { seed, difficulty, players } = useSessionStore();
  const t = useTranslations("results");
  const controllerRef = useRef<MinigameController | null>(null);
  const [result, setResult] = useState<MinigameResult | null>(null);
  const winSoundPlayed = useRef(false);
  const clearHud = useHudStore((s) => s.clear);
  const paused = useGameControlStore((s) => s.paused);
  const setPaused = useGameControlStore((s) => s.setPaused);
  const togglePause = useGameControlStore((s) => s.toggle);

  // Inicialización síncrona (una vez) para que la escena pueda leer el render state en el primer frame.
  if (!controllerRef.current) {
    registerAllMinigames();
    const def = requireMinigame(minigameId);
    const ctx: MinigameContext = {
      seed,
      difficulty,
      players,
      rng: createRng(seed),
      quantum: createQuantumEngine(seed),
      services: {},
    };
    const controller = def.createController(ctx);
    controller.init();
    controller.start();
    controllerRef.current = controller;
  }

  useEffect(() => {
    setPaused(false); // arranca siempre despausado (por si una partida anterior quedó en pausa)
    return () => {
      controllerRef.current?.teardown();
      controllerRef.current = null;
      clearHud();
      setPaused(false);
    };
  }, [clearHud, setPaused]);

  // Atajos de teclado para pausar: Escape o P. Se ignora cuando ya hay resultados.
  useEffect(() => {
    if (result) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "KeyP") {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, togglePause]);

  // Sonido de victoria del personaje ganador. El índice coincide con RUNNER_MODEL_URLS:
  // 0 = gatuna, 1 = tartígrada, 2 = cobraaveja.
  useEffect(() => {
    if (!result || winSoundPlayed.current) return;
    winSoundPlayed.current = true;
    const w = result.perPlayer.reduce((a, b) => (b.score > a.score ? b : a));
    const audio = new Audio(WIN_AUDIO_BY_MODEL[w.slot % WIN_AUDIO_BY_MODEL.length]!);
    audio.volume = 0.85;
    void audio.play().catch(() => {
      /* autoplay puede bloquearse hasta la primera interacción; se ignora */
    });
  }, [result]);

  const presentation = getPresentation(minigameId);
  if (!presentation) return <p className="p-8">Minijuego no encontrado: {minigameId}</p>;
  const Scene = presentation.Scene;

  const winner = result?.perPlayer.reduce((a, b) => (b.score > a.score ? b : a));
  const nameFor = (slot: number) => players.find((p) => p.slot === slot)?.name ?? `P${slot + 1}`;
  const colorFor = (slot: number) => (slot === 0 ? "#38bdf8" : slot === 1 ? "#fb7185" : "#a3b0c9");
  const ranked = result ? [...result.perPlayer].sort((a, b) => b.score - a.score) : [];

  return (
    <InputProvider>
      <div className="game-root">
        <GameCanvas>
          <GameLoop controllerRef={controllerRef} onFinish={setResult} />
          <Scene controllerRef={controllerRef} />
        </GameCanvas>

        <HudRoot minigameId={minigameId} />

        {/* Botón de pausa (arriba-centro). Oculto cuando ya hay resultados. */}
        {!result && (
          <button
            type="button"
            onClick={togglePause}
            aria-label="Pausar"
            className="pointer-events-auto absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--color-quantum-border)] bg-[var(--color-quantum-surface)]/80 px-4 py-2 text-sm font-semibold text-[var(--color-quantum-text)] backdrop-blur-sm transition-colors hover:bg-[var(--color-quantum-surface-2)]"
          >
            <span aria-hidden>⏸</span> Pausa
          </button>
        )}

        {/* Overlay de pausa: congela la simulación (ver GameLoop) y ofrece reanudar o salir. */}
        {paused && !result && (
          <div className="pointer-events-auto absolute inset-0 z-40 grid place-items-center bg-black/70 backdrop-blur-sm">
            <Panel className="w-[min(92vw,22rem)] text-center">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-superposition)]">
                Pausa
              </div>
              <h2 className="mb-6 text-2xl font-bold text-[var(--color-quantum-text)]">Juego en pausa</h2>
              <Button className="mb-3 w-full" onClick={() => setPaused(false)}>
                Reanudar
              </Button>
              <a href="/board">
                <Button variant="outline" className="w-full">
                  Salir al tablero
                </Button>
              </a>
              <p className="mt-4 text-xs text-[var(--color-quantum-muted)]">
                Atajo: <b>Esc</b> o <b>P</b> para pausar / reanudar.
              </p>
            </Panel>
          </div>
        )}

        {result && (
          <div className="pointer-events-auto absolute inset-0 overflow-hidden bg-black/70 backdrop-blur-sm">
            <WinnerCelebration />

            {/* Personaje ganador: GRANDE y centrado en pantalla. */}
            {winner && (
              <div className="trophy-pop pointer-events-none absolute left-1/2 top-1/2 z-10 h-[82vh] w-[62vw] max-w-[44rem] -translate-x-1/2 -translate-y-1/2">
                <WinnerShowcase slot={winner.slot} color={colorFor(winner.slot)} />
                <div className="win-title absolute inset-x-0 bottom-4 text-center">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-superposition)]">
                    {t("winner")}
                  </div>
                  <h2 className="text-4xl font-extrabold text-[var(--color-quantum-text)] drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                    {nameFor(winner.slot)}
                  </h2>
                </div>
              </div>
            )}

            {/* Tabla de resultados: esquina inferior-derecha, compacta, para no tapar al ganador. */}
            <div className="absolute bottom-6 right-6 z-20">
              <Panel className="w-[min(90vw,22rem)] text-center">
                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-quantum-muted)]">
                  {t("title")}
                </div>
                <ul className="mb-5 space-y-1 text-left text-sm">
                  {ranked.map((p, i) => (
                    <li
                      key={p.playerId}
                      className="flex items-center justify-between rounded-md px-2 py-1"
                      style={{
                        background:
                          i === 0 ? "color-mix(in srgb, var(--color-superposition) 16%, transparent)" : undefined,
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 text-center font-bold text-[var(--color-quantum-muted)]">
                          {i + 1}º
                        </span>
                        {nameFor(p.slot)}
                      </span>
                      <span className="tabular-nums">
                        {p.score.toLocaleString("es")} pts · {t("collapses")}: {p.metrics.collapses ?? 0}
                      </span>
                    </li>
                  ))}
                </ul>
                <a href="/board">
                  <Button className="w-full">{t("backToBoard")}</Button>
                </a>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </InputProvider>
  );
}

/** Destellos de premio + confeti alrededor de la tarjeta del ganador. Solo presentación. */
function WinnerCelebration() {
  const colors = ["#38bdf8", "#fb7185", "#8b5cf6", "#22d3ee", "#f59e0b", "#facc15"];
  const sparkles = Array.from({ length: 16 }, (_, i) => ({
    a: `${(360 / 16) * i}deg`,
    d: `${120 + (i % 4) * 40}px`,
    color: colors[i % colors.length]!,
    delay: `${(i % 6) * 0.12}s`,
  }));
  const confetti = Array.from({ length: 28 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    color: colors[i % colors.length]!,
    duration: `${2.4 + (i % 5) * 0.4}s`,
    delay: `${(i % 7) * 0.25}s`,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {confetti.map((c, i) => (
        <span
          key={`c-${i}`}
          className="confetti"
          style={{
            left: c.left,
            background: c.color,
            animationDuration: c.duration,
            animationDelay: c.delay,
          }}
        />
      ))}
      {/* Centro de destellos alineado con el ganador (centrado en pantalla) */}
      <div className="absolute left-1/2 top-1/2">
        {sparkles.map((s, i) => (
          <span
            key={`s-${i}`}
            className="sparkle"
            style={
              {
                background: s.color,
                animationDelay: s.delay,
                ["--a" as string]: s.a,
                ["--d" as string]: s.d,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
