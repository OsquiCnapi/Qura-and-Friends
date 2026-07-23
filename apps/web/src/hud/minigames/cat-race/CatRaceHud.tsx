"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Meter, Panel } from "@quantum-party/ui";
import { useHudStore } from "@/state/hudStore.js";

const playerColor = (slot: number) =>
  slot === 0
    ? "var(--color-player-1)"
    : slot === 1
      ? "var(--color-player-2)"
      : "var(--color-quantum-muted)";

const fmt = (n: number) => n.toLocaleString("es");

/** Datos que van rotando: relación entre el juego y la computación cuántica. */
const QUANTUM_FACTS: string[] = [
  "El escudo azul es SUPERPOSICIÓN: como un qubit, ocupas varios carriles a la vez.",
  "Las réplicas fantasma son las posibilidades del qubit… hasta que se mide.",
  "Atravesar un muro es como una onda que pasa por donde una partícula clásica no podría.",
  "Cuando el escudo se agota, 'te miden' y vuelves a un solo carril: eso es el COLAPSO.",
  "Chocar es DECOHERENCIA: pierdes la ventaja cuántica y vuelves a lo clásico.",
  "La barra de coherencia es tu recurso cuántico: se gasta y hay que recargarla.",
  "Al medir, la naturaleza elige UN resultado al azar — igual que el colapso del juego.",
  "La compuerta Hadamard (H) crea superposición; el escudo hace algo parecido.",
  "El duelo V/F premia el saber: responder bien evita la decoherencia (el aturdimiento).",
  "Cobraveja decide esquivar 'midiendo' un qubit: por la regla de Born, a veces falla.",
];

/**
 * HUD de "La Carrera del Gato":
 *  · arriba-izquierda: escudo (coherencia) por jugador humano.
 *  · arriba-derecha: tabla de puntos en vivo.
 *  · abajo-izquierda: tarjeta rotativa juego ↔ computación cuántica.
 *  · centro: overlay del duelo de preguntas V/F.
 */
export function CatRaceHud() {
  const t = useTranslations("hud");
  const model = useHudStore((s) => s.model);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFactIndex((i) => (i + 1) % QUANTUM_FACTS.length), 6500);
    return () => clearInterval(id);
  }, []);

  if (!model) return null;

  const ranked = [...model.players].sort((a, b) => b.score - a.score);
  const quiz = model.quiz;

  return (
    <>
      {/* Escudo / coherencia (humanos, arriba-izquierda) */}
      <div className="pointer-events-none absolute left-0 top-0 flex flex-col gap-2 p-4">
        {model.players
          .filter((p) => p.coherence !== undefined && p.slot < 2)
          .map((p) => (
            <Panel key={p.slot} className="pointer-events-auto min-w-52">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold" style={{ color: playerColor(p.slot) }}>
                  {p.name}
                </span>
                {p.superposed && (
                  <span className="animate-pulse text-xs font-semibold text-[var(--color-superposition)]">
                    ⟨superposición⟩
                  </span>
                )}
                {p.exhausted && !p.superposed && (
                  <span className="text-xs font-semibold text-[var(--color-annealing)]">↻ recargando</span>
                )}
              </div>
              <Meter value={p.coherence ?? 0} label={t("coherence")} color={playerColor(p.slot)} />
            </Panel>
          ))}
      </div>

      {/* Tabla de puntos en vivo (arriba-derecha) */}
      <div className="pointer-events-none absolute right-0 top-0 p-4">
        <Panel className="pointer-events-auto min-w-64">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-[var(--color-quantum-muted)]">
              {t("scoreboard")}
            </span>
            <span className="text-xs text-[var(--color-quantum-muted)]">{t("collapsesShort")}</span>
          </div>
          <ol className="space-y-1">
            {ranked.map((p, i) => (
              <li
                key={p.slot}
                className="flex items-center gap-2 rounded-md px-2 py-1 tabular-nums"
                style={{
                  background:
                    i === 0 ? "color-mix(in srgb, var(--color-superposition) 14%, transparent)" : undefined,
                }}
              >
                <span className="w-5 text-center text-sm font-bold text-[var(--color-quantum-muted)]">
                  {p.place ? `${p.place}º` : i + 1}
                </span>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: playerColor(p.slot) }} />
                <span className="flex-1 truncate text-sm">{p.name}</span>
                <span className="font-mono text-sm font-semibold">{fmt(p.score)}</span>
                <span
                  className="w-8 text-right text-xs"
                  style={{
                    color: (p.collapses ?? 0) > 0 ? "var(--color-annealing)" : "var(--color-quantum-muted)",
                  }}
                >
                  ✕{p.collapses ?? 0}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {/* Tarjeta rotativa: juego ↔ computación cuántica (abajo-izquierda) */}
      <div className="pointer-events-none absolute bottom-0 left-0 max-w-sm p-4">
        <Panel className="pointer-events-auto border-l-2 border-[var(--color-superposition)]">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-superposition)]">
            ¿Sabías que…?
          </div>
          <p key={factIndex} className="quantum-fact text-sm text-[var(--color-quantum-text)]">
            {QUANTUM_FACTS[factIndex]}
          </p>
        </Panel>
      </div>

      {/* Overlay del duelo de preguntas V/F (centro) */}
      {quiz && <QuizOverlay quiz={quiz} />}
    </>
  );
}

function QuizOverlay({
  quiz,
}: {
  quiz: NonNullable<ReturnType<typeof useHudStore.getState>["model"]>["quiz"];
}) {
  if (!quiz) return null;
  return (
    <div className="pointer-events-auto absolute inset-0 z-20 grid place-items-center overflow-auto bg-black/70 p-4 backdrop-blur-sm">
      {/* Dos fases bien distintas: PREGUNTA (responder) y luego RESULTADO (respuesta + porqué al costado).
          El resultado NO reusa la tarjeta de pregunta, para que no parezca que se pregunta dos veces. */}
      {quiz.revealing ? <QuizReveal quiz={quiz} /> : <QuizAnswering quiz={quiz} />}
    </div>
  );
}

/** Barra de tiempo del duelo (cronómetro al responder / cuenta atrás al revelar). */
function QuizTimer({ label, timeLeftMs, timeTotalMs }: { label: string; timeLeftMs: number; timeTotalMs: number }) {
  const pct = Math.max(0, Math.min(100, (timeLeftMs / timeTotalMs) * 100));
  const seconds = Math.ceil(timeLeftMs / 1000);
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-xs text-[var(--color-quantum-muted)]">
        <span>{label}</span>
        <span className="tabular-nums">{seconds}s</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-quantum-border)]">
        <div
          className="h-full rounded-full transition-[width] duration-100 ease-linear"
          style={{
            width: `${pct}%`,
            background:
              label === "Tiempo"
                ? pct > 30
                  ? "var(--color-entanglement)"
                  : "var(--color-annealing)"
                : "var(--color-superposition)",
          }}
        />
      </div>
    </div>
  );
}

/** FASE 1 — la pregunta: enunciado + opciones V/F donde se ve qué eligió cada jugador. */
function QuizAnswering({
  quiz,
}: {
  quiz: NonNullable<NonNullable<ReturnType<typeof useHudStore.getState>["model"]>["quiz"]>;
}) {
  const options: Array<{ value: 0 | 1; label: string }> = [
    { value: 0, label: "FALSO" },
    { value: 1, label: "VERDADERO" },
  ];
  return (
    <Panel className="w-[min(92vw,40rem)] text-center">
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-superposition)]">
        ¡Choque cuántico! · Duelo Verdadero / Falso
      </div>
      <h2 className="mb-4 text-xl font-semibold leading-snug">{quiz.statement}</h2>

      <QuizTimer label="Tiempo" timeLeftMs={quiz.timeLeftMs} timeTotalMs={quiz.timeTotalMs} />

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const chosenBy = quiz.selections.filter((s) => s.choice === opt.value);
          const active = chosenBy.length > 0;
          return (
            <div
              key={opt.value}
              className="rounded-xl border-2 p-4 transition-colors"
              style={{
                borderColor: active ? "var(--color-superposition)" : "var(--color-quantum-border)",
                background: active
                  ? "color-mix(in srgb, var(--color-superposition) 12%, transparent)"
                  : "transparent",
              }}
            >
              <div className="mb-2 text-lg font-bold">{opt.label}</div>
              <div className="flex min-h-6 flex-wrap justify-center gap-1">
                {chosenBy.map((s) => (
                  <span
                    key={s.slot}
                    className="rounded-full px-2 py-0.5 text-xs font-semibold text-black"
                    style={{ background: playerColor(s.slot) }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center gap-6 text-xs text-[var(--color-quantum-muted)]">
        <span>
          <b style={{ color: "var(--color-player-1)" }}>P1</b>: A = Falso · D = Verdadero
        </span>
        <span>
          <b style={{ color: "var(--color-player-2)" }}>P2</b>: ← = Falso · → = Verdadero
        </span>
      </div>
      <p className="mt-2 text-xs text-[var(--color-quantum-muted)]">
        Sin confirmar: cuenta tu última elección. ¡Quien falle queda aturdido!
      </p>
    </Panel>
  );
}

/**
 * FASE 2 — el resultado: veredicto (respuesta correcta) + cómo le fue a cada jugador, y AL COSTADO
 * el "¿por qué?" explicativo. No repite los botones de la pregunta: se lee como una devolución, no
 * como una segunda pregunta.
 */
function QuizReveal({
  quiz,
}: {
  quiz: NonNullable<NonNullable<ReturnType<typeof useHudStore.getState>["model"]>["quiz"]>;
}) {
  const answerLabel = quiz.answer === 1 ? "VERDADERO" : "FALSO";
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-4">
      {/* Tarjeta de resultado */}
      <Panel className="w-[min(92vw,34rem)] text-center">
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-quantum-muted)]">
          Resultado del duelo
        </div>

        {/* Veredicto: cuál era la respuesta correcta */}
        <div
          className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-lg font-extrabold"
          style={{
            background: "color-mix(in srgb, var(--color-entanglement) 16%, transparent)",
            color: "var(--color-entanglement)",
          }}
        >
          <span aria-hidden>✓</span> La respuesta era {answerLabel}
        </div>

        {/* La afirmación, como repaso (no como pregunta nueva) */}
        <p className="mb-4 text-sm leading-snug text-[var(--color-quantum-muted)]">
          Afirmación: <span className="text-[var(--color-quantum-text)]">«{quiz.statement}»</span>
        </p>

        {/* Cómo le fue a cada jugador */}
        <div className="mb-4 grid gap-2 text-left">
          {quiz.selections.map((s) => {
            const ok = s.correct === true;
            const accent = ok ? "var(--color-entanglement)" : "var(--color-annealing)";
            const verdict =
              s.choice == null ? "No respondió ✗" : ok ? "¡Acertó! ✓" : "Falló ✗";
            return (
              <div
                key={s.slot}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
                style={{
                  borderColor: accent,
                  background: `color-mix(in srgb, ${accent} 8%, transparent)`,
                }}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: playerColor(s.slot) }} />
                  {s.name}
                </span>
                <span className="text-sm font-bold" style={{ color: accent }}>
                  {verdict}
                </span>
              </div>
            );
          })}
        </div>

        <QuizTimer label="Continúa en" timeLeftMs={quiz.timeLeftMs} timeTotalMs={quiz.timeTotalMs} />
      </Panel>

      {/* Explicación al costado: el "por qué" (fase educativa) */}
      <Panel className="flex w-[min(92vw,20rem)] flex-col border-l-2 border-[var(--color-entanglement)] text-left">
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-entanglement)]">
          ¿Por qué?
        </div>
        <p className="text-sm leading-relaxed text-[var(--color-quantum-text)]">{quiz.explanation}</p>
      </Panel>
    </div>
  );
}
