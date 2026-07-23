/**
 * Utilidades de puntuación compartidas por los minijuegos.
 * Diseño: puntuar sobre estado LÓGICO y acotado, para que el servidor pueda revalidar contra máximos
 * teóricos por dificultad (anti-trampa).
 */

/** Convierte una posición (1º, 2º, 3º…) en puntos estilo Mario Party. */
export function placementScore(place: number, totalPlayers: number, base = 100): number {
  if (place < 1) return 0;
  const bonus = Math.max(0, totalPlayers - place);
  return base + bonus * Math.round(base / 2);
}

/** Escala una métrica normalizada [0,1] a puntos con techo por dificultad. */
export function scaledScore(normalized: number, difficulty: number, maxAtDiff1 = 1000): number {
  const clamped = Math.max(0, Math.min(1, normalized));
  return Math.round(clamped * maxAtDiff1 * (1 + 0.25 * (difficulty - 1)));
}

/** Techo teórico de puntos para una dificultad (usado por el validador del servidor). */
export function theoreticalMax(difficulty: number, maxAtDiff1 = 1000): number {
  return Math.round(maxAtDiff1 * (1 + 0.25 * (difficulty - 1))) + placementMaxBonus();
}

function placementMaxBonus(): number {
  return 300;
}

/** Estrellas (0–3) a partir del ratio score/max. */
export function starsFor(score: number, max: number): 0 | 1 | 2 | 3 {
  if (max <= 0) return 0;
  const r = score / max;
  if (r >= 0.9) return 3;
  if (r >= 0.6) return 2;
  if (r >= 0.3) return 1;
  return 0;
}
