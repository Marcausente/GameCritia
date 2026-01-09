-- FIX: Ensure profiles table uses 'role' column (not 'rol')
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'rol') then
    alter table public.profiles rename column rol to role;
  end if;
end $$;

-- Clean up old tables if they exist to force schema update
drop table if exists public.site_content;
drop table if exists public.about_us_content;
drop table if exists public.contact_info;

-- TABLE: about_us_content
create table public.about_us_content (
  id serial primary key,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Check if table is empty (for idempotent insert)
insert into public.about_us_content (id, bio)
select 1,
  'Soy Marcausente, tengo 21 años y soy un apasionado de los videojuegos desde que tengo memoria. A lo largo de los años he jugado a títulos de todo tipo y género, disfrutándolos como pocas cosas en el mundo, siempre con la curiosidad de entender qué los hace especiales… o por qué, en algunos casos, no terminan de funcionar conmigo.

Desde hace un tiempo rondaba por mi cabeza la idea de crear un portal de críticas de videojuegos. Un espacio donde, tras terminar un juego, pudiera plasmar mi experiencia de forma honesta y personal, analizando no solo sus mecánicas o apartado técnico, sino también las sensaciones y emociones que me ha transmitido durante las horas de juego.

El objetivo de GameCritia es mirar los videojuegos desde otra perspectiva: más analítica, reflexiva y cercana. Darle una segunda vuelta a títulos que he disfrutado enormemente, pero también revisitar aquellos que en su momento no encajaron conmigo, con la intención de descubrir si, bajo un análisis más profundo, esconden joyas en bruto que pasé por alto.

Este proyecto nace del amor por el medio y de las ganas de compartir una visión sincera, crítica y personal de cada experiencia jugable.'
where not exists (select 1 from public.about_us_content);

-- Enable RLS for about_us_content
alter table public.about_us_content enable row level security;
create policy "Public read about" on public.about_us_content for select using (true);
create policy "Admin write about" on public.about_us_content for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'administrador')
);


-- TABLE: contact_info
create table public.contact_info (
  id serial primary key,
  name text,
  email text,
  twitter_url text,
  twitter_handle text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default contact info
insert into public.contact_info (id, name, email, twitter_url, twitter_handle)
select 1,
  'Marc Fernández Messa',
  'marcausente@gmail.com',
  'https://x.com/marcausente',
  '@marcausente'
where not exists (select 1 from public.contact_info);

-- Enable RLS for contact_info
alter table public.contact_info enable row level security;
create policy "Public read contact" on public.contact_info for select using (true);
create policy "Admin write contact" on public.contact_info for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'administrador')
);


-- FUNCTION: Update User Role (RPC) - Kept same
create or replace function public.update_user_role(target_user_id uuid, new_role text)
returns void as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador') then
      raise exception 'Access Denied';
  end if;
  update public.profiles set role = new_role where id = target_user_id;
end;
$$ language plpgsql security definer;


-- FUNCTION: Delete User (RPC) - Kept same
create or replace function public.delete_user_by_id(target_user_id uuid)
returns void as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador') then
      raise exception 'Access Denied';
  end if;
  delete from auth.users where id = target_user_id;
end;
$$ language plpgsql security definer;


-- FUNCTION: Get All Profiles with Email (RPC) - Kept same
create or replace function public.get_all_users_admin()
returns table (id uuid, email text, role text, username text, created_at timestamptz) as $$
begin
  if not exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'administrador') then
      raise exception 'Access Denied';
  end if;
  return query select p.id, p.email, p.role, p.username, p.created_at from public.profiles p;
end;
$$ language plpgsql security definer;
