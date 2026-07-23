/**
 * Lógica pura de "La Carrera del Gato". Determinista: mismo seed + mismos inputs ⇒ mismo resultado.
 * La escena R3F (apps/web) solo lee `getRenderState()`; la puntuación se calcula sobre la distancia
 * lógica, no sobre floats de física.
 */
import type { MinigameContext, MinigameController, MinigameDefinition } from "../../minigame/contract.js";
import type { HudModel, InputEvent, InputSnapshot, PlayerInput } from "../../minigame/types.js";
import { placementScore, scaledScore } from "../../scoring/score.js";
import { catRaceConfig, type CatRaceConfig } from "./config.js";
import { decideBotLane } from "./bot.js";
import { chooseQuestion, type QuizQuestion } from "./questions.js";
import type { CatRaceRenderState, QuizState, RunnerState } from "./state.js";

/** Segundos que dura el escudo si se mantiene pulsado con la carga llena. */
export const SHIELD_DURATION = 2;
/** Segundos para recargar el escudo por completo al soltar (enfriamiento largo). */
export const SHIELD_COOLDOWN = 6;
/** Carga mínima (0..1) que hay que recuperar tras agotarlo para volver a usarlo (≈3.6 s de espera). */
const EXHAUST_RECOVER = 0.6;
/** Tiempo del duelo de preguntas (s), igual para ambos jugadores. */
const QUIZ_TIME = 7;

interface ActiveQuiz {
  question: QuizQuestion;
  timeLeft: number;
  participants: number[]; // slots
  selection: Map<number, 0 | 1 | null>; // slot → 0 Falso / 1 Verdadero / null
}

export class CatRaceController implements MinigameController<CatRaceRenderState> {
  private config!: CatRaceConfig;
  private runners: RunnerState[] = [];
  private time = 0;
  private started = false;
  private finishedCount = 0;
  private mode: "race" | "quiz" = "race";
  private quiz: ActiveQuiz | null = null;
  private quizCount = 0;
  private askedQuestions = new Set<number>();

  constructor(
    public readonly def: MinigameDefinition,
    private readonly ctx: MinigameContext,
  ) {}

  init(): void {
    const rng = this.ctx.rng;
    this.config = catRaceConfig(this.ctx.difficulty, () => rng.int(1_000_000));
    this.runners = this.ctx.players.map((p) => ({
      slot: p.slot,
      isBot: p.isBot,
      distance: 0,
      lane: 1,
      superposed: false,
      charge: 1,
      exhausted: false,
      stunnedFor: 0,
      quizzedThisStun: false,
      botPlannedIdx: -1,
      botPlannedDodge: false,
      laneCooldown: 0,
      nextObstacle: 0,
      finished: false,
      finishTime: null,
      place: null,
      collapses: 0,
      wallHits: 0,
    }));
    this.time = 0;
    this.finishedCount = 0;
    this.mode = "race";
    this.quiz = null;
    this.quizCount = 0;
    this.askedQuestions = new Set<number>();
  }

  start(): void {
    this.started = true;
  }

  private inputFor(binding: "p1" | "p2" | undefined, snap: InputSnapshot): PlayerInput {
    return binding === "p2" ? snap.p2 : snap.p1;
  }

  update(dtFixed: number, input: InputSnapshot): void {
    if (!this.started) return;
    this.time += dtFixed;

    // Durante el duelo de preguntas la carrera se congela.
    if (this.mode === "quiz") {
      this.updateQuiz(dtFixed, input);
      return;
    }

    // Ritmo de referencia de los humanos: el bot se adapta a cómo van los competidores.
    const humans = this.runners.filter((r) => !r.isBot);
    const humanRef =
      humans.length > 0 ? humans.reduce((s, r) => s + r.distance, 0) / humans.length : 0;

    for (let i = 0; i < this.runners.length; i++) {
      const r = this.runners[i] as RunnerState;
      if (r.finished) continue;

      r.laneCooldown = Math.max(0, r.laneCooldown - dtFixed);

      // ── Intención del corredor ────────────────────────────────────────────
      let superposeHeld = false;
      let laneDir = 0; // -1 izquierda, +1 derecha
      if (r.isBot) {
        const decision = decideBotLane(r, this.config, this.ctx.rng, this.ctx.difficulty);
        laneDir = Math.sign(decision.targetLane - r.lane);
      } else {
        const player = this.ctx.players.find((p) => p.slot === r.slot);
        const pin = this.inputFor(player?.controlBinding, input);
        superposeHeld = pin.buttons["superpose"] === true;
        laneDir = pin.buttons["left"] ? -1 : pin.buttons["right"] ? 1 : Math.sign(pin.axisX);
      }

      // ── Escudo de superposición: se MANTIENE pulsado (úsalo justo antes de la puerta) ──
      // Al mantenerlo, la carga baja (dura SHIELD_DURATION s con carga llena); al soltar, recarga.
      // Si se vacía, queda "agotado" hasta recuperar EXHAUST_RECOVER (evita el parpadeo/strobing).
      const wantShield = superposeHeld && !r.exhausted && r.charge > 0;
      r.superposed = wantShield;
      if (wantShield) {
        r.charge = Math.max(0, r.charge - dtFixed / SHIELD_DURATION);
        if (r.charge === 0) r.exhausted = true;
      } else {
        r.charge = Math.min(1, r.charge + dtFixed / SHIELD_COOLDOWN);
        if (r.exhausted && r.charge >= EXHAUST_RECOVER) r.exhausted = false;
      }

      // ── Cambio de carril (permitido en superposición; bloqueado si aturdido) ──
      if (r.stunnedFor <= 0 && laneDir !== 0 && r.laneCooldown <= 0) {
        const target = r.lane + laneDir;
        if (target >= 0 && target < this.config.lanes) {
          r.lane = target;
          r.laneCooldown = this.config.laneSwitchCooldown;
        }
      }

      // ── Avance / aturdimiento ─────────────────────────────────────────────
      if (r.stunnedFor > 0) {
        r.stunnedFor = Math.max(0, r.stunnedFor - dtFixed);
      } else {
        r.quizzedThisStun = false; // recuperado: vuelve a ser elegible para un futuro duelo
        const prev = r.distance;
        // El bot ajusta su velocidad al ritmo de los humanos (rubber-banding): acelera si se
        // rezaga, afloja si va por delante → carrera reñida y siempre visible en pantalla.
        let factor = 1;
        if (r.isBot) {
          const gap = humanRef - r.distance; // + = el bot va por detrás
          factor = Math.max(0.82, Math.min(1.25, 1 + gap * 0.015));
        }
        r.distance += this.config.baseSpeed * factor * dtFixed;
        this.resolveObstacles(r, prev);
        if (r.distance >= this.config.trackLength) {
          r.distance = this.config.trackLength;
          r.finished = true;
          r.finishTime = this.time;
          r.place = ++this.finishedCount;
        }
      }
    }

    // ── Duelo: si DOS humanos están aturdidos a la vez (no hace falta que sea el mismo
    //    instante), se lanza una pregunta. Cada uno solo dispara uno por episodio de stun. ──
    const eligible = this.runners
      .filter((r) => !r.isBot && !r.finished && r.stunnedFor > 0 && !r.quizzedThisStun)
      .map((r) => r.slot);
    if (eligible.length >= 2) this.startQuiz(eligible);
  }

  /** Colisiones con obstáculos entre `prev` y la distancia actual. Devuelve true si chocó. */
  private resolveObstacles(r: RunnerState, prev: number): boolean {
    while (r.nextObstacle < this.config.obstacles.length) {
      const obs = this.config.obstacles[r.nextObstacle];
      if (!obs || obs.distance > r.distance) break;
      if (obs.distance >= prev) {
        if (!r.superposed && obs.lane === r.lane) {
          // Choque clásico: aturdimiento y retroceso mínimo.
          r.stunnedFor = this.config.stunSeconds;
          r.distance = Math.max(prev, obs.distance - 0.5);
          r.collapses++;
          r.wallHits++;
          r.nextObstacle++;
          return true;
        }
      }
      r.nextObstacle++;
    }
    return false;
  }

  // ── Duelo de preguntas V/F ───────────────────────────────────────────────────
  private startQuiz(participants: number[]): void {
    this.mode = "quiz";
    const { index, question } = chooseQuestion(this.quizCount++, this.ctx.rng, this.askedQuestions);
    this.askedQuestions.add(index);
    const selection = new Map<number, 0 | 1 | null>();
    participants.forEach((s) => {
      selection.set(s, null);
      // Marca el episodio como "ya con duelo" para no relanzarlo mientras siga aturdido.
      const rr = this.runners.find((r) => r.slot === s);
      if (rr) rr.quizzedThisStun = true;
    });
    this.quiz = { question, timeLeft: QUIZ_TIME, participants, selection };
  }

  private updateQuiz(dtFixed: number, input: InputSnapshot): void {
    const q = this.quiz;
    if (!q) {
      this.mode = "race";
      return;
    }
    // Selección sin confirmar: la última dirección pulsada manda (izq = Falso, der = Verdadero).
    for (const slot of q.participants) {
      const player = this.ctx.players.find((p) => p.slot === slot);
      const pin = this.inputFor(player?.controlBinding, input);
      if (pin.buttons["left"]) q.selection.set(slot, 0);
      else if (pin.buttons["right"]) q.selection.set(slot, 1);
    }

    q.timeLeft -= dtFixed;
    if (q.timeLeft <= 0) this.resolveQuiz();
  }

  private resolveQuiz(): void {
    const q = this.quiz;
    if (!q) return;
    const correct: 0 | 1 = q.question.answer ? 1 : 0;
    for (const slot of q.participants) {
      const r = this.runners.find((rr) => rr.slot === slot);
      if (!r) continue;
      const choice = q.selection.get(slot);
      if (choice === correct) {
        // Acierta → sale del aturdimiento y sigue corriendo.
        r.stunnedFor = 0;
      } else {
        // Falla (o no responde) → queda aturdido de nuevo + decoherencia.
        r.stunnedFor = this.config.stunSeconds;
        r.collapses++;
      }
    }
    this.quiz = null;
    this.mode = "race";
  }

  onInput(_ev: InputEvent): void {
    // Estado continuo (botones mantenidos); no consume eventos discretos.
  }

  getRenderState(): CatRaceRenderState {
    return {
      time: this.time,
      mode: this.mode,
      runners: this.runners,
      trackLength: this.config.trackLength,
      lanes: this.config.lanes,
      obstacles: this.config.obstacles,
    };
  }

  /** Puntos EN VIVO (rango amplio, estilo runner): distancia × 20 − penalización por choque. */
  private livePoints(r: RunnerState): number {
    return Math.max(0, Math.round(r.distance * 20) - r.collapses * 250);
  }

  /** Estado del duelo serializado para el HUD/escena. */
  quizState(): QuizState | null {
    const q = this.quiz;
    if (!q) return null;
    return {
      statement: q.question.statement,
      answer: q.question.answer,
      timeLeft: Math.max(0, q.timeLeft),
      timeTotal: QUIZ_TIME,
      selections: q.participants.map((slot) => ({ slot, choice: q.selection.get(slot) ?? null })),
    };
  }

  getHudState(): HudModel {
    const quiz = this.quizState();
    return {
      phase: this.isFinished() ? "finished" : this.started ? "playing" : "countdown",
      timeLeftMs: null,
      players: this.runners.map((r) => ({
        slot: r.slot,
        name: this.ctx.players.find((p) => p.slot === r.slot)?.name ?? `P${r.slot + 1}`,
        score: this.livePoints(r),
        coherence: r.charge,
        place: r.place ?? undefined,
        collapses: r.collapses,
        superposed: r.superposed,
        exhausted: r.exhausted,
      })),
      quiz: quiz
        ? {
            statement: quiz.statement,
            timeLeftMs: Math.round(quiz.timeLeft * 1000),
            timeTotalMs: quiz.timeTotal * 1000,
            selections: quiz.selections.map((s) => ({
              slot: s.slot,
              name: this.ctx.players.find((p) => p.slot === s.slot)?.name ?? `P${s.slot + 1}`,
              choice: s.choice,
            })),
          }
        : null,
    };
  }

  /** La partida termina apenas UN corredor llega a la meta (no espera a los demás). */
  isFinished(): boolean {
    return this.finishedCount >= 1;
  }

  computeResult() {
    const total = this.runners.length;
    // Asigna puestos a quienes no llegaron: por distancia descendente tras los que sí terminaron.
    const pending = this.runners
      .filter((r) => r.place == null)
      .sort((a, b) => b.distance - a.distance);
    let nextPlace = this.finishedCount + 1;
    for (const r of pending) r.place = nextPlace++;

    return {
      perPlayer: this.runners.map((r) => {
        const progress = r.distance / this.config.trackLength;
        const distancePts = scaledScore(progress, this.ctx.difficulty, 3000);
        const placeBonus = r.place ? placementScore(r.place, total, 1000) : 0;
        const base = Math.max(0, distancePts + placeBonus - r.collapses * 250);
        return {
          playerId: this.ctx.players.find((p) => p.slot === r.slot)?.id ?? `slot-${r.slot}`,
          slot: r.slot,
          score: base,
          metrics: {
            progress,
            collapses: r.collapses,
            place: r.place ?? -1,
            finishTime: r.finishTime ?? -1,
          },
        };
      }),
      proof: {
        seed: this.ctx.seed,
        durationMs: Math.round(this.time * 1000),
      },
    };
  }

  teardown(): void {
    this.runners = [];
    this.quiz = null;
  }
}
