-- Fix: "column reference classroom_id is ambiguous" en join_classroom_by_code (0004_rbac.sql).
--
-- `returns table (classroom_id uuid, classroom_name text)` convierte `classroom_id` en una VARIABLE
-- dentro de todo el cuerpo de la función (no solo el nombre de la columna de salida) — clásico gotcha
-- de PL/pgSQL: un parámetro/variable con el mismo nombre que una columna usada adentro. La línea
-- `on conflict (classroom_id, user_id)` quedaba ambigua entre esa variable y la columna real de
-- `classroom_members`. Arreglo: apuntar al conflicto por el nombre de la constraint (la primary key),
-- que no usa identificadores de columna sueltos y por lo tanto no puede chocar con ninguna variable.
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
  on conflict on constraint classroom_members_pkey do nothing;

  return query select v_classroom.id, v_classroom.name;
end;
$$;
