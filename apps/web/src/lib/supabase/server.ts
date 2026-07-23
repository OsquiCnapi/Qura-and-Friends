import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cliente de Supabase para Server Components / Route Handlers (respeta la sesión vía cookies). */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Llamado desde un Server Component: se ignora (el middleware refresca la sesión).
          }
        },
      },
    },
  );
}
