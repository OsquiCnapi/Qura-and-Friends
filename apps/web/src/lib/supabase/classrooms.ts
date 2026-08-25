"use client";

import { createClient } from "./client.js";

export interface ClassroomRow {
  id: string;
  code: string;
  name: string;
  host_user_id: string;
  created_at: string;
}

export interface ClassroomMemberRow {
  user_id: string;
  role_in_classroom: "teacher" | "student";
  joined_at: string;
  profiles: { display_name: string; avatar_character: string } | null;
}

export interface ProgressRow {
  user_id: string;
  minigame_id: string;
  concept_id: string;
  unlocked: boolean;
  stars: number;
  best_score: number | null;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0/I/1: ilegibles a mano por niños

function randomCode(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/**
 * Vuelve al usuario docente (RPC `become_teacher`, ver 0004_rbac.sql) y crea un aula. Dos round-trips
 * porque son dos preguntas distintas: "¿puedo actuar como docente?" (rol global) y "¿esta fila del
 * aula es mía?" (ownership) — separarlas es lo que permite que `classrooms_insert_teacher` verifique
 * ambas con RLS normal en vez de meter lógica de negocio en una función mediadora más.
 *
 * El código se genera en el cliente y se reintenta ante colisión (constraint UNIQUE en `code`); con
 * un alfabeto de 32 símbolos y 6 caracteres la probabilidad de choque es despreciable para el tamaño
 * de esta app, así que 5 intentos es de sobra.
 */
export async function createClassroom(name: string): Promise<ClassroomRow> {
  const supabase = createClient();

  const { error: roleErr } = await supabase.rpc("become_teacher");
  if (roleErr) throw new Error(`no se pudo activar el rol docente: ${roleErr.message}`);

  const { data: userData } = await supabase.auth.getUser();
  const hostUserId = userData.user?.id;
  if (!hostUserId) throw new Error("no autenticado");

  let lastError: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from("classrooms")
      .insert({ code: randomCode(), name, host_user_id: hostUserId })
      .select("id, code, name, host_user_id, created_at")
      .single();
    if (!error && data) return data;
    lastError = error?.message ?? "insert falló";
    if (!lastError.includes("duplicate") && !lastError.includes("unique")) break;
  }
  throw new Error(`no se pudo crear el aula: ${lastError}`);
}

/** Todas las aulas visibles para el usuario actual: las que dicta (host) y las que se unió (miembro).
 *  La policy `classrooms_select_member` ya hace ese OR — aquí solo se separan por rol para la UI. */
export async function fetchMyClassrooms(): Promise<ClassroomRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("classrooms")
    .select("id, code, name, host_user_id, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** RPC `join_classroom_by_code`: el cliente nunca hace INSERT directo en `classroom_members` — ver el
 *  comentario en 0004_rbac.sql sobre por qué eso no se puede expresar como policy de RLS. */
export async function joinClassroomByCode(code: string): Promise<{ classroomId: string; name: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("join_classroom_by_code", { p_code: code }).single();
  if (error) throw new Error(error.message);
  const row = data as { classroom_id: string; classroom_name: string };
  return { classroomId: row.classroom_id, name: row.classroom_name };
}

export async function fetchClassroomRoster(classroomId: string): Promise<ClassroomMemberRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("classroom_members")
    .select("user_id, role_in_classroom, joined_at, profiles(display_name, avatar_character)")
    .eq("classroom_id", classroomId)
    .order("joined_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ClassroomMemberRow[];
}

/** Progreso de una lista de alumnos. Autorizado por la policy `progress_select_teacher`: solo devuelve
 *  filas si quien pregunta es efectivamente el docente del aula a la que pertenecen esos user_id. */
export async function fetchProgressForUsers(userIds: string[]): Promise<ProgressRow[]> {
  if (userIds.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("progress")
    .select("user_id, minigame_id, concept_id, unlocked, stars, best_score")
    .in("user_id", userIds);
  if (error) throw new Error(error.message);
  return data ?? [];
}
