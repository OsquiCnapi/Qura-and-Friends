/**
 * @quantum-party/schemas
 *
 * Contratos de datos compartidos (zod) entre cliente y servidor. Se importan igual desde apps/web
 * (npm) y desde las Edge Functions de Supabase (Deno, vía `npm:` specifier), garantizando que la
 * validación anti-trampa use exactamente la misma forma que produjo el cliente.
 */
import { z } from "zod";

/** Asignación binaria de un QUBO (bitstring). */
export const AssignmentSchema = z.array(z.union([z.literal(0), z.literal(1)]));

/** Instancia QUBO transportable (para el servicio de annealing y la revalidación). */
export const QUBOInstanceSchema = z.object({
  n: z.number().int().positive(),
  linear: z.array(z.number()),
  quadratic: z.array(z.tuple([z.number().int(), z.number().int(), z.number()])),
});
export type QUBOInstance = z.infer<typeof QUBOInstanceSchema>;

/**
 * Prueba verificable de un resultado de minijuego. El servidor NO confía en el score: recomputa desde
 * `proof` (p.ej. energía QUBO desde `assignment`) y aplica límites por dificultad/tiempo.
 */
export const ScoreProofSchema = z.object({
  seed: z.number().int(),
  durationMs: z.number().nonnegative(),
  /** Para minijuegos de annealing: la solución cuya energía se recomputa server-side. */
  assignment: AssignmentSchema.optional(),
  qubo: QUBOInstanceSchema.optional(),
  energy: z.number().optional(),
  /** Hash de los inputs (para revalidación de minijuegos de reflejos). */
  inputsHash: z.string().optional(),
});
export type ScoreProof = z.infer<typeof ScoreProofSchema>;

/** Payload que el cliente envía a la Edge Function `submit-score`. */
export const SubmitScoreSchema = z.object({
  minigameId: z.string().min(1),
  conceptId: z.string().min(1),
  difficulty: z.number().int().min(1).max(5),
  playerSlot: z.number().int().min(0).max(3),
  boardSessionId: z.string().uuid().optional(),
  score: z.number().int().nonnegative(),
  metrics: z.record(z.string(), z.number()).default({}),
  proof: ScoreProofSchema,
});
export type SubmitScorePayload = z.infer<typeof SubmitScoreSchema>;

/** Petición a la Edge Function `anneal` (proxy al servicio Python OpenJij). */
export const AnnealRequestSchema = z.object({
  qubo: QUBOInstanceSchema,
  sweeps: z.number().int().positive().max(5000).default(500),
  numReads: z.number().int().positive().max(200).default(20),
});
export type AnnealRequest = z.infer<typeof AnnealRequestSchema>;

export const AnnealResponseSchema = z.object({
  assignment: AssignmentSchema,
  energy: z.number(),
  numOccurrences: z.number().int().nonnegative().optional(),
});
export type AnnealResponse = z.infer<typeof AnnealResponseSchema>;

/**
 * Rol RBAC (espejo del CHECK de `profiles.role` en 0004_rbac.sql). Validar esta forma en el cliente es
 * solo comodidad de UX (mensaje de error inmediato) — la autoridad real es el CHECK constraint y las
 * policies de RLS; este schema NUNCA debe usarse para decidir si algo se muestra o se permite.
 */
export const RoleSchema = z.enum(["student", "teacher"]);
export type Role = z.infer<typeof RoleSchema>;

/** Código de aula tal como lo genera `lib/supabase/classrooms.ts` (6 caracteres, sin O/0/I/1). */
export const ClassroomCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-HJ-NP-Z2-9]{6}$/, "código de 6 caracteres (sin O, 0, I, 1)");

/** Fila de progreso por concepto (espejo de la tabla Postgres `progress`). */
export const ProgressRowSchema = z.object({
  minigameId: z.string(),
  conceptId: z.string(),
  unlocked: z.boolean(),
  stars: z.number().int().min(0).max(3),
  bestScore: z.number().int().nonnegative().nullable(),
  bestTimeMs: z.number().int().nonnegative().nullable(),
});
export type ProgressRow = z.infer<typeof ProgressRowSchema>;
