/**
 * Banco de preguntas Verdadero/Falso del duelo (cuando dos jugadores están aturdidos a la vez).
 * Contenido basado en `qbronze_docs` (QWorld Bronze): bits vs qubits, superposición, medición/regla de
 * Born, estados como vectores, compuertas X/Z/H, reversibilidad, interferencia (H·H=I), entrelazamiento
 * (Bell/CNOT), correlación, codificación superdensa, teleportación y Grover.
 * Ordenadas de MUY fáciles (tier 1) a difíciles (tier 4); el duelo las recorre en dificultad creciente.
 * Cada pregunta trae una `explanation` corta del PORQUÉ, que el HUD muestra al costado al revelar la
 * respuesta (fase educativa tras responder).
 */
import type { Rng } from "@quantum-party/quantum-engine";

export interface QuizQuestion {
  readonly statement: string;
  /** `true` = la afirmación es Verdadera. */
  readonly answer: boolean;
  /** Nivel 1 (muy fácil) → 4 (difícil). */
  readonly tier: 1 | 2 | 3 | 4;
  /** El PORQUÉ de la respuesta, explicado sencillo. Se muestra al revelar (fase educativa). */
  readonly explanation: string;
}

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  // ── Tier 1 — súper fáciles (bits vs qubits, superposición, X) ────────────────
  {
    statement: "Un bit clásico solo puede valer 0 o 1.",
    answer: true,
    tier: 1,
    explanation:
      "Un bit es la unidad de información clásica: en cada instante vale 0 o 1, nunca las dos. Como una moneda quieta sobre la mesa: muestra cara o cruz, no ambas.",
  },
  {
    statement: "Un qubit puede estar en 0 y 1 a la vez (superposición).",
    answer: true,
    tier: 1,
    explanation:
      "El qubit sí admite una mezcla de |0⟩ y |1⟩ al mismo tiempo: eso es la SUPERPOSICIÓN. Solo al medirlo se decide por uno de los dos.",
  },
  {
    statement: "Un bit clásico normal puede estar en 0 y 1 al mismo tiempo.",
    answer: false,
    tier: 1,
    explanation:
      "No: la superposición es exclusiva de los qubits. Un bit clásico siempre está definido en 0 o en 1, jamás en ambos.",
  },
  {
    statement: "En el juego, la superposición te deja atravesar los muros rojos.",
    answer: true,
    tier: 1,
    explanation:
      "Con el escudo de superposición ocupas varios carriles a la vez, como una onda, y cruzas el muro que a un corredor clásico lo frenaría.",
  },
  {
    statement: "La compuerta X (NOT) intercambia |0⟩ y |1⟩.",
    answer: true,
    tier: 1,
    explanation:
      "La X es el NOT cuántico: convierte |0⟩ en |1⟩ y |1⟩ en |0⟩, igual que voltear el valor de un bit.",
  },
  {
    statement: "Al medir un qubit obtienes un único resultado (0 o 1).",
    answer: true,
    tier: 1,
    explanation:
      "Aunque el qubit esté en superposición, al medir la naturaleza elige UN solo resultado, 0 o 1. Eso es el COLAPSO.",
  },

  // ── Tier 2 — medición, Born, Hadamard, vectores ─────────────────────────────
  {
    statement: "La compuerta de Hadamard (H) lleva |0⟩ a una superposición igual |+⟩.",
    answer: true,
    tier: 2,
    explanation:
      "La Hadamard reparte |0⟩ en partes iguales entre |0⟩ y |1⟩ (el estado |+⟩): al medir, 50% y 50%.",
  },
  {
    statement: "Medir un qubit NO cambia su estado.",
    answer: false,
    tier: 2,
    explanation:
      "Medir SÍ lo cambia: colapsa la superposición y deja el qubit fijo en el resultado que salió. No hay vuelta atrás.",
  },
  {
    statement: "La probabilidad de un resultado es la amplitud (sin elevar al cuadrado).",
    answer: false,
    tier: 2,
    explanation:
      "No: por la regla de Born la probabilidad es la amplitud AL CUADRADO, no la amplitud a secas.",
  },
  {
    statement: "La probabilidad de medir |0⟩ es la amplitud al cuadrado.",
    answer: true,
    tier: 2,
    explanation:
      "Exacto: la regla de Born dice que elevas al cuadrado la amplitud de |0⟩ para obtener su probabilidad.",
  },
  {
    statement: "Un estado de qubit real es un vector de largo 1 en el círculo unidad.",
    answer: true,
    tier: 2,
    explanation:
      "El estado es una flecha de longitud 1: al elevar al cuadrado sus componentes, suman 1 (el 100% de probabilidad).",
  },
  {
    statement: "Una flecha de estado más larga significa un resultado más probable.",
    answer: false,
    tier: 2,
    explanation:
      "No: TODAS las flechas de estado miden lo mismo, 1. Lo que cambia es su dirección, no su largo.",
  },
  {
    statement: "La compuerta Z intercambia |0⟩ y |1⟩ igual que el NOT.",
    answer: false,
    tier: 2,
    explanation:
      "No: la Z no intercambia nada; deja |0⟩ igual y solo cambia el signo de |1⟩. La que intercambia es la X.",
  },

  // ── Tier 3 — interferencia, reversibilidad, signo, Bell ──────────────────────
  {
    statement: "Aplicar Hadamard dos veces seguidas deja el estado igual (H·H = I).",
    answer: true,
    tier: 3,
    explanation:
      "H es su propia inversa: aplicarla dos veces regresa al estado original. Las amplitudes interfieren y se recomponen.",
  },
  {
    statement: "Las compuertas cuánticas son reversibles.",
    answer: true,
    tier: 3,
    explanation:
      "Toda compuerta cuántica se puede deshacer con su inversa; ninguna borra información. Por eso son reversibles.",
  },
  {
    statement: "La medición es una operación reversible.",
    answer: false,
    tier: 3,
    explanation:
      "Medir NO es reversible: al colapsar se pierde la superposición y no puedes recuperar el estado anterior.",
  },
  {
    statement: "En sistemas cuánticos las amplitudes pueden ser negativas y cancelarse.",
    answer: true,
    tier: 3,
    explanation:
      "Sí: las amplitudes pueden ser negativas y, al sumarse, cancelarse. Eso es la INTERFERENCIA destructiva.",
  },
  {
    statement: "En probabilidad clásica las contribuciones pueden cancelarse entre sí.",
    answer: false,
    tier: 3,
    explanation:
      "No: las probabilidades clásicas nunca son negativas, así que solo se suman; jamás se cancelan como las amplitudes.",
  },
  {
    statement: "La compuerta Z cambia el signo de la amplitud de |1⟩.",
    answer: true,
    tier: 3,
    explanation:
      "Correcto: Z deja |0⟩ igual y multiplica por −1 la amplitud de |1⟩. Es un cambio de fase.",
  },
  {
    statement: "Un par de Bell se crea con Hadamard seguido de CNOT.",
    answer: true,
    tier: 3,
    explanation:
      "Sí: una H sobre el primer qubit crea superposición y luego el CNOT los entrelaza en un par de Bell.",
  },
  {
    statement: "Se puede crear un par de Bell solo con una Hadamard, sin CNOT.",
    answer: false,
    tier: 3,
    explanation:
      "No basta: la H crea superposición, pero hace falta el CNOT para ENTRELAZAR los dos qubits.",
  },

  // ── Tier 4 — correlación, superdensa, teleportación, Grover ─────────────────
  {
    statement: "Midiendo el par de Bell (|00⟩+|11⟩)/√2 solo salen '00' o '11'.",
    answer: true,
    tier: 4,
    explanation:
      "Están entrelazados: las dos medidas siempre coinciden, así que solo aparece 00 o 11, nunca 01 ni 10.",
  },
  {
    statement: "La teleportación cuántica copia el qubit y el emisor conserva el original.",
    answer: false,
    tier: 4,
    explanation:
      "No copia: el estado original se destruye al medirlo. El teorema de no-clonación prohíbe duplicar un qubit.",
  },
  {
    statement: "La teleportación necesita enviar 2 bits clásicos al receptor.",
    answer: true,
    tier: 4,
    explanation:
      "Sí: además del par entrelazado, hay que mandar 2 bits clásicos para que el receptor corrija su qubit.",
  },
  {
    statement: "La codificación superdensa envía 2 bits clásicos usando 1 qubit y un par de Bell.",
    answer: true,
    tier: 4,
    explanation:
      "Correcto: con un par de Bell compartido, un solo qubit transporta 2 bits de información clásica.",
  },
  {
    statement: "Grover encuentra el elemento marcado en aproximadamente (π/4)·√N pasos.",
    answer: true,
    tier: 4,
    explanation:
      "Grover busca en ~√N pasos, muchísimo menos que los N de una búsqueda clásica: una aceleración cuadrática.",
  },
  {
    statement: "En Grover, más iteraciones siempre dan mejor probabilidad de éxito.",
    answer: false,
    tier: 4,
    explanation:
      "No: pasado el punto óptimo la probabilidad vuelve a bajar. Hay que parar cerca de (π/4)·√N.",
  },
  {
    statement: "El oráculo de Grover cambia el signo (fase) del estado marcado.",
    answer: true,
    tier: 4,
    explanation:
      "El oráculo marca la solución invirtiendo el signo de su amplitud; después la difusión la amplifica.",
  },
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
