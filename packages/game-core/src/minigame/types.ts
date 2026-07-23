/**
 * Tipos base del sistema de minijuegos: jugadores, input y modelo de HUD.
 * Todo es serializable (sin clases ni funciones) para poder pasar snapshots al render/HUD y para el
 * `proof` anti-trampa del servidor.
 */
import type { ScoreProof } from "@quantum-party/schemas";

/** Los dos jugadores locales (hotseat). Los bots ocupan slots adicionales pero comparten la interfaz. */
export type PlayerId = "p1" | "p2";

export type QuantumConcept =
  | "superposition"
  | "entanglement"
  | "interference"
  | "annealing"
  | "teleportation"
  | "gates";

export type QuantumCategory = "superposition" | "entanglement" | "interference" | "annealing";

/** Esquema de control que determina el mapeo de teclas/gamepad y el HUD. */
export type ControlScheme = "race" | "rhythm" | "aim" | "select" | "timing";

export type MinigamePhase = "countdown" | "playing" | "finished";

/** Un participante de un minijuego (humano o bot). */
export interface PlayerSlot {
  readonly id: string;
  readonly slot: number;
  readonly name: string;
  readonly character: "alicia" | "conejo";
  readonly isBot: boolean;
  /** Qué esquema de teclado controla a este slot (solo humanos). */
  readonly controlBinding?: PlayerId;
}

/** Estado continuo de un jugador en un frame (ejes normalizados en [-1, 1], botones mantenidos). */
export interface PlayerInput {
  readonly axisX: number;
  readonly axisY: number;
  readonly buttons: Readonly<Record<string, boolean>>;
}

/** Snapshot de input del frame para el paso fijo de la simulación. */
export interface InputSnapshot {
  readonly p1: PlayerInput;
  readonly p2: PlayerInput;
  /** Tiempo de simulación en segundos desde el inicio del minijuego. */
  readonly t: number;
}

/** Acción discreta (edge-triggered): saltar, medir/colapsar, disparar… También la producen los bots. */
export interface InputEvent {
  readonly player: PlayerId | string;
  readonly action: string;
  readonly pressed: boolean;
  readonly t: number;
}

export const emptyPlayerInput = (): PlayerInput => ({ axisX: 0, axisY: 0, buttons: {} });
export const emptyInputSnapshot = (t = 0): InputSnapshot => ({
  p1: emptyPlayerInput(),
  p2: emptyPlayerInput(),
  t,
});

/** Estado de HUD de un jugador (barra de coherencia, score…). Extensible por minijuego. */
export interface PlayerHud {
  readonly slot: number;
  readonly name: string;
  readonly score: number;
  /** 0..1, presente en minijuegos con recurso cuántico (p.ej. barra de coherencia). */
  readonly coherence?: number;
  readonly place?: number;
  /** Nº de veces que el sistema "midió" al jugador y colapsó su superposición. */
  readonly collapses?: number;
  /** Superposición activa ahora mismo (para feedback en vivo). */
  readonly superposed?: boolean;
  /** Agotado tras un colapso: hay que soltar la tecla y recargar antes de volver a superponer. */
  readonly exhausted?: boolean;
}

/** Duelo de preguntas V/F (cuando dos jugadores chocan a la vez), para el overlay del HUD. */
export interface QuizHud {
  readonly statement: string;
  readonly timeLeftMs: number;
  readonly timeTotalMs: number;
  readonly selections: ReadonlyArray<{
    readonly slot: number;
    readonly name: string;
    /** 0 = Falso, 1 = Verdadero, null = sin elegir. */
    readonly choice: 0 | 1 | null;
    /** En la revelación: si el jugador acertó (null mientras se responde). */
    readonly correct?: boolean | null;
  }>;
  /** Fase de revelación: se acabó el tiempo y se muestra la respuesta correcta + el porqué. */
  readonly revealing: boolean;
  /** Respuesta correcta (0 = Falso, 1 = Verdadero) para resaltar la opción en la revelación. */
  readonly answer: 0 | 1;
  /** Explicación del porqué, mostrada al costado durante la revelación. */
  readonly explanation: string;
}

/** Modelo serializable que el overlay HTML dibuja. Se publica throttled (~10–15 Hz), no a 60 fps. */
export interface HudModel {
  readonly phase: MinigamePhase;
  readonly timeLeftMs: number | null;
  readonly players: PlayerHud[];
  readonly message?: string;
  /** Duelo de preguntas activo (o null si se está corriendo). */
  readonly quiz?: QuizHud | null;
  /** Datos específicos del minijuego (heatmaps, fases, energía…) para HUDs a medida. */
  readonly extra?: Readonly<Record<string, number | number[]>>;
}

/** Resultado final: score por jugador + prueba verificable en servidor. */
export interface MinigameResult {
  readonly perPlayer: ReadonlyArray<{
    readonly playerId: string;
    readonly slot: number;
    readonly score: number;
    readonly metrics: Readonly<Record<string, number>>;
  }>;
  readonly proof: ScoreProof;
}
