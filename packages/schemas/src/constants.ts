/**
 * Constantes globales compartidas en toda la aplicación.
 * Centraliza magic numbers, strings y configuraciones.
 */

// ============================================================================
// 🎮 GAME CONFIG
// ============================================================================

/** Timestep fijo de simulación (segundos) */
export const GAME_FIXED_TIMESTEP = 1 / 60; // 60 Hz

/** Número de jugadores máximo por partida */
export const MAX_PLAYERS = 3;

/** Número de jugadores humanos (hotseat) */
export const HUMAN_PLAYERS = 2;

// ============================================================================
// 🧪 QUANTUM CONFIG
// ============================================================================

/** Número máximo de qubits soportados */
export const MAX_QUBITS = 20;

/** Tolerancia para comparaciones numéricas (floating point) */
export const EPSILON = 1e-10;

// ============================================================================
// 🎯 MINIGAME CONFIG
// ============================================================================

/** Duración máxima de un minijuego (segundos) */
export const MAX_MINIGAME_DURATION = 120;

/** Duración de countdown antes de iniciar (segundos) */
export const COUNTDOWN_DURATION = 3;

/** Duración de animación de victoria (segundos) */
export const VICTORY_ANIMATION_DURATION = 3;

// ============================================================================
// 🎨 AUDIO CONFIG
// ============================================================================

/** Volumen de sonido de victoria */
export const VICTORY_SOUND_VOLUME = 0.85;

/** Rutas de audio por personaje (orden: gatuna, tartigrada, cobraveja) */
export const WIN_AUDIO_PATHS = [
  "/audio/audio_gata.mpeg",
  "/audio/audio_tartigrada.mpeg",
  "/audio/audio_cobra.mpeg",
] as const;

/** Rutas de modelos 3D por personaje */
export const RUNNER_MODEL_URLS = [
  "/models/gatuna.glb",
  "/models/tartigrada.glb",
  "/models/cobraveja.glb",
] as const;

// ============================================================================
// 🎲 DIFFICULTY LEVELS
// ============================================================================

export const DIFFICULTY_LEVELS = {
  EASY: 1,
  NORMAL: 2,
  HARD: 3,
  VERY_HARD: 4,
  EXTREME: 5,
} as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[keyof typeof DIFFICULTY_LEVELS];

// ============================================================================
// 👥 PLAYER SLOTS
// ============================================================================

/** Configuración de slots de jugadores (personaje, teclas, etc) */
export const PLAYER_SLOTS = {
  P1: {
    id: "p1",
    slot: 0,
    name: "Gatuna",
    character: "alicia" as const,
    controlBinding: "p1" as const,
  },
  P2: {
    id: "p2",
    slot: 1,
    name: "Tartigrada",
    character: "conejo" as const,
    controlBinding: "p2" as const,
  },
  BOT: {
    id: "bot1",
    slot: 2,
    name: "Cobraveja",
    character: "conejo" as const,
  },
} as const;

// ============================================================================
// ⌨️ INPUT CONFIG
// ============================================================================

/** Teclas por defecto P1 (WASD) */
export const P1_DEFAULT_KEYS = {
  UP: "KeyW",
  DOWN: "KeyS",
  LEFT: "KeyA",
  RIGHT: "KeyD",
  ACTION: "Space",
  SUPERPOSE: "ShiftLeft",
} as const;

/** Teclas por defecto P2 (Flechas) */
export const P2_DEFAULT_KEYS = {
  UP: "ArrowUp",
  DOWN: "ArrowDown",
  LEFT: "ArrowLeft",
  RIGHT: "ArrowRight",
  ACTION: "Enter",
  SUPERPOSE: "ShiftRight",
} as const;

/** Teclas de pausa global */
export const PAUSE_KEYS = ["Escape", "KeyP"] as const;

// ============================================================================
// 🌍 i18n CONFIG
// ============================================================================

/** Idiomas soportados */
export const SUPPORTED_LOCALES = ["es", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Locale por defecto */
export const DEFAULT_LOCALE: SupportedLocale = "es";

// ============================================================================
// 📊 SCORING CONFIG
// ============================================================================

/** Puntos base por victoria */
export const BASE_WIN_POINTS = 100;

/** Multiplicador de dificultad */
export const DIFFICULTY_MULTIPLIER = {
  1: 1,
  2: 1.5,
  3: 2,
  4: 2.5,
  5: 3,
} as const;

/** Multiplicador por metadatos (collapsos, etc) */
export const METRICS_MULTIPLIER = 10;

// ============================================================================
// 🏆 LEADERBOARD
// ============================================================================

/** Número máximo de entradas en leaderboard */
export const LEADERBOARD_MAX_ENTRIES = 100;

/** Período de refresh de leaderboard en tiempo real (ms) */
export const LEADERBOARD_REFRESH_INTERVAL = 5000;

// ============================================================================
// 🌐 API CONFIG
// ============================================================================

/** Timeout para requests a API (ms) */
export const API_REQUEST_TIMEOUT = 30000;

/** Reintentos automáticos en fallo */
export const API_MAX_RETRIES = 3;

/** URL base de annealing service */
export const ANNEALING_SERVICE_URL = process.env.NEXT_PUBLIC_ANNEALING_URL || "http://localhost:8000";

// ============================================================================
// 💾 STORAGE CONFIG
// ============================================================================

/** Clave para localStorage de sesión */
export const SESSION_STORAGE_KEY = "qura:session";

/** Clave para localStorage de settings */
export const SETTINGS_STORAGE_KEY = "qura:settings";

/** TTL de sesión en localStorage (ms) */
export const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 horas

// ============================================================================
// 🔍 VALIDATION
// ============================================================================

/** Rango válido de seed */
export const SEED_MIN = 0;
export const SEED_MAX = Number.MAX_SAFE_INTEGER;

/** Rango válido de score */
export const SCORE_MIN = 0;
export const SCORE_MAX = 1_000_000;
