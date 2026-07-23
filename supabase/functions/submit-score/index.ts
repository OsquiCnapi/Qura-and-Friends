// Edge Function `submit-score` (Deno).
//
// ÚNICA ruta con service_role para escribir en `scores`. Verifica el JWT del usuario, revalida el
// `proof` (recomputa energía QUBO + límites), inserta con validated=true y, gracias a la replication
// de Realtime, el leaderboard de todos los clientes se actualiza AL INSTANTE.
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";
import { validateSubmission } from "../_shared/validateEnergy.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const body = await req.json();
    const { minigameId, conceptId, difficulty, playerSlot, score, metrics, proof, boardSessionId } =
      body;

    // Cliente con el JWT del usuario para identificarlo (respeta RLS al leer).
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "no autenticado" }, 401);
    }

    const verdict = validateSubmission(score, difficulty, proof);
    if (!verdict.ok) return json({ error: `rechazado: ${verdict.reason}` }, 422);

    // Cliente con service_role para el INSERT (salta RLS). NUNCA exponer esta key al navegador.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: insErr } = await admin.from("scores").insert({
      user_id: userData.user.id,
      minigame_id: minigameId,
      board_session_id: boardSessionId ?? null,
      player_slot: playerSlot,
      score,
      metrics: metrics ?? {},
      validated: true,
      proof,
    });
    if (insErr) return json({ error: insErr.message }, 500);

    // Actualiza el progreso (upsert best score).
    await admin.from("progress").upsert(
      {
        user_id: userData.user.id,
        minigame_id: minigameId,
        concept_id: conceptId,
        unlocked: true,
        best_score: score,
      },
      { onConflict: "user_id,minigame_id" },
    );

    return json({ ok: true, validated: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}
