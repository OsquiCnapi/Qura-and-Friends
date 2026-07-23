// Edge Function `anneal` (Deno).
//
// Proxy AUTENTICADO al servicio Python de OpenJij. El navegador nunca llama a Python directo: aquí se
// centraliza el JWT (verify_jwt=true en config.toml), el rate-limit y el secreto de servicio.
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const serviceUrl = Deno.env.get("ANNEAL_SERVICE_URL");
  if (!serviceUrl) return json({ error: "ANNEAL_SERVICE_URL no configurada" }, 503);

  const body = await req.json();

  const res = await fetch(`${serviceUrl}/solve`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${Deno.env.get("ANNEAL_SERVICE_TOKEN") ?? ""}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return json({ error: "servicio de annealing no disponible" }, 502);
  return json(await res.json());
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}
