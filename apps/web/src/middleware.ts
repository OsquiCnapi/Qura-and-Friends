import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware.js";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Corre en todo menos assets estáticos: los Route Handlers (/api/*) también necesitan sesión
    // fresca (submit-score y anneal reenvían el JWT del usuario).
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|glb|mp3)$).*)",
  ],
};
