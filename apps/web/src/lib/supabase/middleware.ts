import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca el JWT de Supabase en cada request de servidor (Server Components/Route Handlers no pueden
 * escribir cookies por sí mismos — ver el catch silencioso en `lib/supabase/server.ts`). Sin este
 * middleware, un token expirado nunca se renueva y `auth.uid()` empieza a devolver null en RLS aunque
 * el usuario "parezca" logueado en el cliente.
 *
 * Patrón oficial de @supabase/ssr: https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Toca la sesión: si el access token expiró, @supabase/ssr lo renueva con el refresh token y
  // `setAll` (arriba) reescribe las cookies en la respuesta — no hace falta usar el `user` devuelto.
  await supabase.auth.getUser();

  return response;
}
