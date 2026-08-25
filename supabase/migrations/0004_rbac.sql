-- RBAC (Role-Based Access Control) sobre el modelo de RLS de 0002.
--
-- Idea central: RLS ("¿puedo tocar ESTA fila?") resuelve autorización a nivel de fila, pero no alcanza
-- para modelar un ROL global («soy docente») que además necesita mediar escrituras que cruzan filas de
-- OTRO usuario (un alumno uniéndose a un aula que no es suya). Este archivo añade esa capa:
--
--   1. profiles.role            → el rol RBAC del usuario ('student' | 'teacher').
--   2. classroom_members        → relación N:M aula↔usuario (base de la visibilidad "soy su docente").
--   3. Funciones SECURITY DEFINER → toda mutación que cruza el límite de "mis propias filas" (crear rol
--      de docente, unirse a un aula por código) pasa por una función mediadora, nunca por INSERT/UPDATE
--      directo del cliente. Es el mismo patrón que `submit-score` ya usa con service_role, llevado a
--      Postgres puro: la función corre con los privilegios de su dueño (el rol `postgres`, que es dueño
--      de las tablas) y por eso puede saltarse RLS — SIN que el cliente reciba una key privilegiada.
--
-- Nota de orden: `classroom_members` se crea ANTES que las policies de `classrooms` que la referencian
-- (una policy no puede nombrar una tabla que todavía no existe) y ANTES del trigger que le hace INSERT.
--
-- Ver docs/auth-permissions.md para la explicación completa (teoría + cómo escalar esto).

-- ── 1. Bootstrap: cada auth.users nuevo obtiene su fila en profiles automáticamente ─────────────────
-- Sin esto, el cliente tendría que acordarse de hacer el INSERT (frágil: cualquier código que use
-- auth.uid() para leer JOINs se rompe en la ventana entre "usuario creado" y "profile creado").
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 2. Rol RBAC en el profile ────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists role text not null default 'student' check (role in ('student', 'teacher'));

-- Guardia anti-escalada de privilegios: `profiles_update_own` (0002) permite al usuario editar
-- CUALQUIER columna de su propia fila, `role` incluido — si no lo bloqueamos, cualquiera se autoasigna
-- 'teacher' con un UPDATE directo. La única puerta válida es `become_teacher()` (abajo), que abre esta
-- guardia con un flag de sesión (`set_config`, con `is_local = true` ⇒ dura solo la transacción actual).
create or replace function public.profiles_guard_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and coalesce(current_setting('app.allow_role_change', true), '') <> 'on' then
    raise exception 'role es gestionado por el sistema (ver become_teacher()); no se puede editar directamente';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role_trigger on public.profiles;
create trigger profiles_guard_role_trigger
  before update on public.profiles
  for each row execute function public.profiles_guard_role();

-- Helper de autorización reutilizable en policies. SECURITY INVOKER a propósito (no definer): lee
-- `profiles`, que ya es de lectura pública (`profiles_select_all`), así que no necesita privilegios
-- extra — menos superficie SECURITY DEFINER es, en sí mismo, aplicar "principio de mínimo privilegio".
create or replace function public.is_teacher(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (select 1 from public.profiles where id = uid and role = 'teacher');
$$;

-- Único camino para volverse docente: una acción explícita y auditable (el usuario la pide), no un
-- valor que el cliente pueda simplemente escribir. "El rol se otorga, no se declara."
create or replace function public.become_teacher()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'auth requerida';
  end if;
  perform set_config('app.allow_role_change', 'on', true);
  update public.profiles set role = 'teacher', updated_at = now()
    where id = auth.uid() and role <> 'teacher';
  perform set_config('app.allow_role_change', 'off', true);
end;
$$;
grant execute on function public.become_teacher() to authenticated;

-- ── 3. classroom_members: quién pertenece a qué aula ─────────────────────────────────────────────
-- `role_in_classroom` es DISTINTO de `profiles.role`: profiles.role es "¿tiene la capacidad global de
-- crear aulas?" (RBAC clásico), role_in_classroom es "¿qué es esta persona DENTRO de esta aula
-- concreta?" (más cerca de ReBAC — el permiso depende de la relación con un recurso, no solo del rol
-- global). Hoy siempre coincide con "host = teacher, resto = student", pero separarlos deja espacio
-- para, p.ej., co-docentes o auxiliares sin tocar el modelo de nuevo — ver docs/auth-permissions.md.
create table if not exists public.classroom_members (
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  -- Referencia a profiles (no a auth.users) a propósito: PostgREST solo puede hacer JOIN embebido
  -- (`.select("...,profiles(display_name)")`) cuando existe una FK directa entre las dos tablas.
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_in_classroom text not null default 'student' check (role_in_classroom in ('teacher', 'student')),
  joined_at timestamptz not null default now(),
  primary key (classroom_id, user_id)
);

alter table public.classroom_members enable row level security;

-- Lectura: el propio miembro ve su fila; el docente dueño del aula ve todas las de su aula.
create policy "classroom_members_select" on public.classroom_members for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.classrooms c
      where c.id = classroom_members.classroom_id and c.host_user_id = auth.uid()
    )
  );

-- A propósito NO hay policy de insert/update/delete para 'authenticated': la única vía de alta es
-- `join_classroom_by_code()`. Sin una función mediadora, una policy de INSERT tendría que validar "¿el
-- código que el cliente dice tener coincide con este classroom_id?" sin poder ver el código en la fila
-- de destino — imposible de expresar en una policy fila-a-fila. Un RPC sí puede: recibe el código,
-- resuelve el classroom_id él mismo, y decide.
create or replace function public.join_classroom_by_code(p_code text)
returns table (classroom_id uuid, classroom_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_classroom record;
begin
  if auth.uid() is null then
    raise exception 'auth requerida';
  end if;

  select id, name into v_classroom
  from public.classrooms
  where code = upper(trim(p_code));

  if not found then
    raise exception 'código de aula inválido';
  end if;

  insert into public.classroom_members (classroom_id, user_id, role_in_classroom)
  values (v_classroom.id, auth.uid(), 'student')
  on conflict (classroom_id, user_id) do nothing;

  return query select v_classroom.id, v_classroom.name;
end;
$$;
grant execute on function public.join_classroom_by_code(text) to authenticated;

-- ── 4. classrooms: nombre + separar el policy "for all" en 4 policies con reglas distintas ──────────
alter table public.classrooms add column if not exists name text not null default 'Mi aula';

drop policy if exists "classrooms_own" on public.classrooms;

-- Lectura: el docente dueño, o cualquier alumno que ya se unió (classroom_members).
create policy "classrooms_select_member" on public.classrooms for select
  using (
    auth.uid() = host_user_id
    or exists (
      select 1 from public.classroom_members m
      where m.classroom_id = classrooms.id and m.user_id = auth.uid()
    )
  );

-- Alta: requiere is_teacher() además de auth.uid() = host_user_id. Este es el gate RBAC real — un
-- INSERT crudo vía REST (sin pasar por la UI) lo sigue rechazando la base de datos, no solo el botón.
create policy "classrooms_insert_teacher" on public.classrooms for insert
  with check (auth.uid() = host_user_id and public.is_teacher(auth.uid()));

create policy "classrooms_update_own" on public.classrooms for update
  using (auth.uid() = host_user_id) with check (auth.uid() = host_user_id);

create policy "classrooms_delete_own" on public.classrooms for delete
  using (auth.uid() = host_user_id);

-- Bookkeeping: cuando se crea un aula, su docente queda registrado como miembro 'teacher' de esa aula
-- (para que `classroom_members` sea la única fuente de verdad de "quién pertenece a qué aula y con qué
-- rol EN esa aula").
create or replace function public.classrooms_add_host_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.classroom_members (classroom_id, user_id, role_in_classroom)
  values (new.id, new.host_user_id, 'teacher')
  on conflict (classroom_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists classrooms_after_insert_add_host on public.classrooms;
create trigger classrooms_after_insert_add_host
  after insert on public.classrooms
  for each row execute function public.classrooms_add_host_membership();

-- ── 5. progress: el docente puede LEER el progreso de sus alumnos (no editarlo) ──────────────────
-- `progress_own` (0002) es "for all" y ya cubre el select propio; esta policy adicional se SUMA (las
-- policies permisivas de un mismo comando se combinan con OR) — el propio alumno y su docente pueden
-- ambos leer, cada uno por una regla distinta. No se añade policy de escritura: el docente nunca puede
-- alterar el progreso de un alumno desde el cliente.
create policy "progress_select_teacher" on public.progress for select
  using (
    exists (
      select 1
      from public.classroom_members m
      join public.classrooms c on c.id = m.classroom_id
      where m.user_id = progress.user_id and c.host_user_id = auth.uid()
    )
  );
