import { NextResponse } from "next/server";
import { AnnealRequestSchema } from "@quantum-party/schemas";

/**
 * BFF fino opcional hacia el servicio Python (OpenJij). El camino recomendado en producción es la Edge
 * Function `anneal` de Supabase (centraliza JWT + secretos); esta ruta sirve para desarrollo local y
 * como punto de caché/agregación si hiciera falta.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = AnnealRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const serviceUrl = process.env.ANNEAL_SERVICE_URL;
  if (!serviceUrl) {
    return NextResponse.json({ error: "ANNEAL_SERVICE_URL no configurada" }, { status: 503 });
  }

  const res = await fetch(`${serviceUrl}/solve`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.ANNEAL_SERVICE_TOKEN ?? ""}`,
    },
    body: JSON.stringify(parsed.data),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "servicio de annealing no disponible" }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
