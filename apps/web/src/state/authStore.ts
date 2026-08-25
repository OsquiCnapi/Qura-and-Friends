import { create } from "zustand";

export type Role = "student" | "teacher";

interface AuthState {
  /** `auth.uid()` — coincide con `profiles.id`. Es el único dato que las policies de RLS conocen. */
  userId: string | null;
  /** Espejo de `profiles.role`. Es SOLO para pintar la UI (mostrar/ocultar "Crear aula"): la
   *  autorización real vive en la base de datos (`classrooms_insert_teacher`, `is_teacher()`), así que
   *  un valor stale aquí nunca abre un hueco de seguridad — en el peor caso el servidor rechaza la
   *  escritura y hay que refrescar el rol. */
  role: Role | null;
  displayName: string | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  setSession: (p: { userId: string; role: Role; displayName: string }) => void;
  setStatus: (s: AuthState["status"]) => void;
  setError: (e: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  role: null,
  displayName: null,
  status: "idle",
  error: null,
  setSession: ({ userId, role, displayName }) => set({ userId, role, displayName, status: "ready" }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: "error" }),
}));
