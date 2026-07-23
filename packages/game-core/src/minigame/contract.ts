/**
 * Contrato `Minigame` — el corazón reutilizable. Dos capas:
 *  - LÓGICA PURA (aquí, en game-core): `MinigameDefinition` (metadata) + `MinigameController`
 *    (ciclo de vida determinista). Testeable sin DOM.
 *  - PRESENTACIÓN (en apps/web): escena R3F + HUD, resueltas por el registry de presentación.
 *
 * Añadir un minijuego = crear una `definition` + un `controller` aquí, la escena/HUD en apps/web, y
 * registrar. El host genérico `play/[minigameId]` no cambia.
 */
import type { QuantumEngineApi, Rng } from "@quantum-party/quantum-engine";
import type {
  ControlScheme,
  HudModel,
  InputEvent,
  InputSnapshot,
  MinigameResult,
  PlayerSlot,
  QuantumCategory,
  QuantumConcept,
} from "./types.js";

/** Cliente hacia el servicio de annealing (OpenJij) — inyectado; el cliente usa el fallback TS si no hay red. */
export interface AnnealClient {
  solve(qubo: {
    n: number;
    linear: number[];
    quadratic: ReadonlyArray<readonly [number, number, number]>;
  }): Promise<{ assignment: ReadonlyArray<0 | 1>; energy: number }>;
}

/** Reloj de audio para minijuegos rítmicos (basado en AudioContext.currentTime). */
export interface AudioClock {
  now(): number;
  scheduleBeat(time: number): void;
}

/** Contexto inyectado a cada minijuego al crearse. */
export interface MinigameContext {
  readonly seed: number;
  readonly difficulty: number;
  readonly players: PlayerSlot[];
  readonly rng: Rng;
  readonly quantum: QuantumEngineApi;
  readonly services: {
    readonly anneal?: AnnealClient;
    readonly audio?: AudioClock;
  };
}

/** Metadata de un minijuego (estática, serializable, sin dependencias de framework). */
export interface MinigameDefinition {
  readonly id: string;
  /** Clave i18n del título/descripción (next-intl). */
  readonly i18nKey: string;
  /** Enlace al contenido pedagógico en @quantum-party/curriculum. */
  readonly conceptId: string;
  readonly concept: QuantumConcept;
  readonly category: QuantumCategory;
  readonly difficulty: 1 | 2 | 3 | 4 | 5;
  readonly players: { readonly min: 1; readonly max: 2; readonly supportsBots: boolean };
  readonly controlScheme: ControlScheme;
  readonly estimatedDurationSec: number;
  /** Crea la instancia de lógica pura para una partida concreta. */
  createController(ctx: MinigameContext): MinigameController;
}

/**
 * Ciclo de vida de un minijuego. `update` es PURO y DETERMINISTA: mismo seed + mismos inputs ⇒ mismo
 * resultado. La puntuación se calcula sobre estado lógico (no floats de física) para fairness y para
 * que el servidor pueda revalidar el `proof`.
 */
export interface MinigameController<TRenderState = unknown> {
  readonly def: MinigameDefinition;
  /** Reserva el estado inicial determinista. */
  init(): void;
  /** Arranca la simulación (tras el countdown). */
  start(): void;
  /** Paso FIJO de simulación (por defecto 1/60 s). */
  update(dtFixed: number, input: InputSnapshot): void;
  /** Acción discreta edge-triggered (saltar, medir, disparar). */
  onInput(ev: InputEvent): void;
  /** Estado que consume la escena R3F para dibujar (posiciones, fases, etc.). */
  getRenderState(): TRenderState;
  /** Modelo throttled para el HUD. */
  getHudState(): HudModel;
  isFinished(): boolean;
  /** Resultado final con `proof` verificable. */
  computeResult(): MinigameResult;
  /** Libera recursos (listeners, buffers). */
  teardown(): void;
}
