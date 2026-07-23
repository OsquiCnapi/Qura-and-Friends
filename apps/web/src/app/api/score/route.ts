import { NextResponse } from "next/server";
import { SubmitScoreSchema } from "@quantum-party/schemas";
import { validateAnnealProof, validateScoreBounds } from "@quantum-party/game-core";

/**
 * BFF de puntuación (desarrollo). En producción esta lógica vive en la Edge Function `submit-score`
 * (única con service_role, que además dispara Realtime al insertar). Aquí se valida el `proof` con la
 * MISMA lógica pura de game-core, para demostrar el contrato anti-trampa end-to-end.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = SubmitScoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { score, difficulty, proof, minigameId } = parsed.data;

  const bounds = validateScoreBounds(score, difficulty, proof);
  if (!bounds.ok) {
    return NextResponse.json({ error: `rechazado: ${bounds.reason}` }, { status: 422 });
  }

  // Minijuegos de annealing: recomputar energía QUBO desde la asignación (determinista, barato).
  if (proof.qubo && proof.assignment) {
    const anneal = validateAnnealProof(proof);
    if (!anneal.ok) {
      return NextResponse.json({ error: `rechazado: ${anneal.reason}` }, { status: 422 });
    }
  }

  // TODO(prod): reenviar a la Edge Function `submit-score` para INSERT con service_role + Realtime.
  return NextResponse.json({ ok: true, validated: true, minigameId });
}
