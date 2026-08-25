"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client.js";
import { useAuthStore, type Role } from "@/state/authStore.js";

/**
 * Monta la identidad del dispositivo al arrancar la app. No hay pantalla de login: el público son
 * niños jugando en un dispositivo compartido en el aula, así que la identidad es **anónima por
 * dispositivo** (`supabase.auth.signInAnonymously`) — RLS y RBAC funcionan igual con un usuario anónimo
 * que con uno "real" porque ambos tienen un `auth.uid()` válido; lo único que cambia es cómo se
 * demostró la identidad, no qué puede hacer con ella (separación autenticación/autorización, ver
 * docs/auth-permissions.md).
 *
 * Sin componente. Se monta una vez en el layout raíz y escribe el resultado en `useAuthStore` para que
 * cualquier página lo lea sin tener que repetir esta lógica.
 */
export function AuthBootstrap() {
  const setSession = useAuthStore((s) => s.setSession);
  const setStatus = useAuthStore((s) => s.setStatus);
  const setError = useAuthStore((s) => s.setError);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadProfile(userId: string) {
      // El trigger `handle_new_user` (0004_rbac.sql) ya creó esta fila en la misma transacción del
      // alta en auth.users, así que no hay carrera entre "usuario creado" y "profile disponible".
      const { data, error } = await supabase
        .from("profiles")
        .select("role, display_name")
        .eq("id", userId)
        .single();
      if (cancelled) return;
      if (error || !data) {
        setError(error?.message ?? "no se pudo cargar el perfil");
        return;
      }
      setSession({ userId, role: data.role as Role, displayName: data.display_name });
    }

    async function bootstrap() {
      setStatus("loading");
      const { data: sessionData } = await supabase.auth.getSession();
      let userId = sessionData.session?.user.id ?? null;

      if (!userId) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error || !data.user) {
          setError(error?.message ?? "no se pudo iniciar sesión anónima");
          return;
        }
        userId = data.user.id;
      }

      await loadProfile(userId);
    }

    void bootstrap();

    // Si el token se renueva (o el usuario hace login "de verdad" más adelante) mantenemos el store
    // sincronizado sin recargar la página.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void loadProfile(session.user.id);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
