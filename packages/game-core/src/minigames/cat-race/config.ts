/**
 * Parámetros de "La Carrera del Gato" (Categoría 1 · superposición).
 * Concepto: el jugador puede activar superposición para ocupar los 3 carriles y atravesar obstáculos,
 * drenando su barra de coherencia. Si la coherencia llega a 0, el sistema lo "mide" y colapsa a un
 * carril aleatorio; si hay un obstáculo ahí, se estampa (penalización de tiempo).
 */
export interface CatRaceConfig {
  readonly lanes: number;
  readonly trackLength: number; // unidades
  readonly baseSpeed: number; // u/s
  readonly stunSeconds: number;
  readonly laneSwitchCooldown: number; // s
  readonly obstacles: ReadonlyArray<{ readonly distance: number; readonly lane: number }>;
}

/** Construye una configuración escalada por dificultad (más obstáculos, drenaje más rápido). */
export function catRaceConfig(difficulty: number, rngIntStream: () => number): CatRaceConfig {
  const lanes = 3;
  // Pista muy larga (5× la anterior): carrera de ~2 min, endless-runner de verdad.
  const trackLength = 3200;
  // Menos obstáculos → mucha más distancia entre puertas (más aire para reaccionar).
  const obstacleCount = 34 + difficulty * 8;
  const start = 16;
  const end = trackLength - 28;
  // Dificultad creciente: el arranque va despejado y las puertas rojas se van
  // agolpando hacia el medio y, sobre todo, el final. Se logra sesgando la
  // posición normalizada con una potencia < 1 (u^BIAS reparte disperso al inicio
  // y denso al final). BIAS más bajo = curva más agresiva.
  const BIAS = 0.68;
  const obstacles: Array<{ distance: number; lane: number }> = [];
  for (let i = 0; i < obstacleCount; i++) {
    const u = (i + 1) / (obstacleCount + 1); // (0,1)
    const biased = Math.pow(u, BIAS);
    const distance = start + (end - start) * biased;
    const lane = rngIntStream() % lanes;
    obstacles.push({ distance, lane });
  }
  return {
    lanes,
    trackLength,
    baseSpeed: 22 + difficulty,
    stunSeconds: 1.1,
    laneSwitchCooldown: 0.28, // menos sensible: un cambio de carril más pausado
    obstacles: obstacles.sort((a, b) => a.distance - b.distance),
  };
}
