/** Tipos del contenido educativo. El copy visible se localiza vía i18n (next-intl) en apps/web. */

export type QuantumConcept =
  | "superposition"
  | "entanglement"
  | "interference"
  | "annealing"
  | "teleportation"
  | "gates";

export type QuantumCategory = "superposition" | "entanglement" | "interference" | "annealing";

/** Nivel del corpus fuente. */
export type SourceLevel = "bronze" | "silver" | "new";

/** Referencia trazable a la documentación consolidada del workspace. */
export interface SourceRef {
  readonly level: SourceLevel;
  /** Ruta del SKILL.md o notebook de origen (relativa al workspace). */
  readonly path: string;
  readonly note?: string;
}

/** Un concepto enseñable, con su contenido y sus fuentes. */
export interface ConceptContent {
  readonly id: string;
  readonly concept: QuantumConcept;
  readonly title: string;
  /** Objetivo de aprendizaje (preciso, nivel docente). */
  readonly learningObjective: string;
  /** Explicación age-appropriate envuelta en la narrativa de Alicia. */
  readonly narrative: string;
  /** Fórmula/idea clave en LaTeX (se renderiza con KaTeX en la UI). */
  readonly keyMath?: string;
  readonly prerequisites: readonly string[]; // ids de conceptos previos
  readonly sources: readonly SourceRef[];
  readonly difficulty: 1 | 2 | 3 | 4 | 5;
}

/** Entrada del mapa minijuego → concepto → fuente. */
export interface MinigameContentMap {
  readonly minigameId: string;
  readonly conceptId: string;
  readonly category: QuantumCategory;
}
