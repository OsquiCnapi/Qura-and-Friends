/**
 * Banco de preguntas Verdadero/Falso del duelo (cuando dos jugadores están aturdidos a la vez).
 * Contenido basado en `qbronze_docs` (QWorld Bronze): bits vs qubits, superposición, medición/regla de
 * Born, estados como vectores, compuertas X/Z/H, reversibilidad, interferencia (H·H=I), entrelazamiento
 * (Bell/CNOT), correlación, codificación superdensa, teleportación y Grover.
 * Ordenadas de MUY fáciles (tier 1) a difíciles (tier 4); el duelo las recorre en dificultad creciente.
 */
import type { Rng } from "@quantum-party/quantum-engine";

export interface QuizQuestion {
  readonly statement: string;
  /** `true` = la afirmación es Verdadera. */
  readonly answer: boolean;
  /** Nivel 1 (muy fácil) → 4 (difícil). */
  readonly tier: 1 | 2 | 3 | 4;
}

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  // ── Tier 1 — súper fáciles (bits vs qubits, superposición, X) ────────────────
  { statement: "Un bit clásico solo puede valer 0 o 1.", answer: true, tier: 1 },
  { statement: "Un qubit puede estar en 0 y 1 a la vez (superposición).", answer: true, tier: 1 },
  { statement: "Un bit clásico normal puede estar en 0 y 1 al mismo tiempo.", answer: false, tier: 1 },
  { statement: "En el juego, la superposición te deja atravesar los muros rojos.", answer: true, tier: 1 },
  { statement: "La compuerta X (NOT) intercambia |0⟩ y |1⟩.", answer: true, tier: 1 },
  { statement: "Al medir un qubit obtienes un único resultado (0 o 1).", answer: true, tier: 1 },

  // ── Tier 2 — medición, Born, Hadamard, vectores ─────────────────────────────
  { statement: "La compuerta de Hadamard (H) lleva |0⟩ a una superposición igual |+⟩.", answer: true, tier: 2 },
  { statement: "Medir un qubit NO cambia su estado.", answer: false, tier: 2 },
  { statement: "La probabilidad de un resultado es la amplitud (sin elevar al cuadrado).", answer: false, tier: 2 },
  { statement: "La probabilidad de medir |0⟩ es la amplitud al cuadrado.", answer: true, tier: 2 },
  { statement: "Un estado de qubit real es un vector de largo 1 en el círculo unidad.", answer: true, tier: 2 },
  { statement: "Una flecha de estado más larga significa un resultado más probable.", answer: false, tier: 2 },
  { statement: "La compuerta Z intercambia |0⟩ y |1⟩ igual que el NOT.", answer: false, tier: 2 },

  // ── Tier 3 — interferencia, reversibilidad, signo, Bell ──────────────────────
  { statement: "Aplicar Hadamard dos veces seguidas deja el estado igual (H·H = I).", answer: true, tier: 3 },
  { statement: "Las compuertas cuánticas son reversibles.", answer: true, tier: 3 },
  { statement: "La medición es una operación reversible.", answer: false, tier: 3 },
  { statement: "En sistemas cuánticos las amplitudes pueden ser negativas y cancelarse.", answer: true, tier: 3 },
  { statement: "En probabilidad clásica las contribuciones pueden cancelarse entre sí.", answer: false, tier: 3 },
  { statement: "La compuerta Z cambia el signo de la amplitud de |1⟩.", answer: true, tier: 3 },
  { statement: "Un par de Bell se crea con Hadamard seguido de CNOT.", answer: true, tier: 3 },
  { statement: "Se puede crear un par de Bell solo con una Hadamard, sin CNOT.", answer: false, tier: 3 },

  // ── Tier 4 — correlación, superdensa, teleportación, Grover ─────────────────
  { statement: "Midiendo el par de Bell (|00⟩+|11⟩)/√2 solo salen '00' o '11'.", answer: true, tier: 4 },
  { statement: "La teleportación cuántica copia el qubit y el emisor conserva el original.", answer: false, tier: 4 },
  { statement: "La teleportación necesita enviar 2 bits clásicos al receptor.", answer: true, tier: 4 },
  { statement: "La codificación superdensa envía 2 bits clásicos usando 1 qubit y un par de Bell.", answer: true, tier: 4 },
  { statement: "Grover encuentra el elemento marcado en aproximadamente (π/4)·√N pasos.", answer: true, tier: 4 },
  { statement: "En Grover, más iteraciones siempre dan mejor probabilidad de éxito.", answer: false, tier: 4 },
  { statement: "El oráculo de Grover cambia el signo (fase) del estado marcado.", answer: true, tier: 4 },
];

/**
 * Elige la pregunta del próximo duelo: dificultad creciente (sube un nivel cada 2 duelos) y, dentro del
 * nivel, una pregunta AL AZAR que no haya salido aún (evita repeticiones). Determinista vía el `Rng`
 * sembrado. Devuelve el índice para que quien llama lo registre como usado.
 */
export function chooseQuestion(
  quizCount: number,
  rng: Rng,
  used: ReadonlySet<number>,
): { index: number; question: QuizQuestion } {
  const tier = Math.min(4, 1 + Math.floor(quizCount / 2));
  const indexed = QUIZ_QUESTIONS.map((q, i) => ({ q, i }));
  let pool = indexed.filter((e) => e.q.tier === tier && !used.has(e.i));
  if (pool.length === 0) pool = indexed.filter((e) => !used.has(e.i)); // agotado el nivel → cualquier no usada
  if (pool.length === 0) pool = indexed; // todas usadas → recicla el banco
  const chosen = rng.pick(pool) as { q: QuizQuestion; i: number };
  return { index: chosen.i, question: chosen.q };
}
