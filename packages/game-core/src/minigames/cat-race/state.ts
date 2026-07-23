/** Estado por corredor y estado de render del minijuego (lo consume la escena R3F). */

export interface RunnerState {
  readonly slot: number;
  readonly isBot: boolean;
  /** Distancia recorrida a lo largo de la pista (0 → trackLength). */
  distance: number;
  /** Carril actual (0..lanes-1). */
  lane: number;
  /** Superposición (escudo) activa: ocupa todos los carriles y atraviesa obstáculos. */
  superposed: boolean;
  /** Carga del escudo (0..1). Se MANTIENE pulsado para usarlo: baja al usar, sube al soltar. */
  charge: number;
  /** Agotado: al vaciar la carga queda bloqueado hasta recargar un mínimo (evita el parpadeo). */
  exhausted: boolean;
  /** Tiempo restante de aturdimiento tras colisión/pregunta fallada (s). */
  stunnedFor: number;
  /** Ya participó en un duelo durante ESTE episodio de aturdimiento (evita relanzarlo en bucle). */
  quizzedThisStun: boolean;
  /** (Bot) Índice del obstáculo para el que ya "midió" su decisión de esquivar (-1 = ninguno). */
  botPlannedIdx: number;
  /** (Bot) Resultado de esa medición: true = logrará esquivar, false = colapsó a "falla". */
  botPlannedDodge: boolean;
  laneCooldown: number;
  /** Índice del próximo obstáculo aún no superado. */
  nextObstacle: number;
  finished: boolean;
  finishTime: number | null;
  place: number | null;
  /** Nº de choques/decoherencias sufridas (métrica pedagógica). */
  collapses: number;
  /** Contador monótono de choques contra un muro (para disparar el efecto de sonido en la escena). */
  wallHits: number;
}

/** Estado del duelo de preguntas (V/F) cuando dos humanos chocan a la vez. */
export interface QuizState {
  /** Enunciado de la afirmación. */
  readonly statement: string;
  /** Respuesta correcta: `true` = Verdadero. */
  readonly answer: boolean;
  /** Segundos restantes. */
  readonly timeLeft: number;
  /** Segundos totales concedidos (para pintar la barra). */
  readonly timeTotal: number;
  /** Selección actual por jugador: 0 = Falso, 1 = Verdadero, null = sin elegir. */
  readonly selections: ReadonlyArray<{ readonly slot: number; readonly choice: 0 | 1 | null }>;
}

export interface CatRaceRenderState {
  readonly time: number;
  readonly mode: "race" | "quiz";
  readonly runners: ReadonlyArray<Readonly<RunnerState>>;
  readonly trackLength: number;
  readonly lanes: number;
  readonly obstacles: ReadonlyArray<{ readonly distance: number; readonly lane: number }>;
}
