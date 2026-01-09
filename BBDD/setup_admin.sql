-- Clean up old table if exists
drop table if exists public.site_content;

-- TABLE: about_us_content
create table if not exists public.about_us_content (
  id serial primary key,
  bio_p1 text,
  bio_p2 text,
  bio_p3 text,
  bio_p4 text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Check if table is empty (for idempotent insert)
insert into public.about_us_content (id, bio_p1, bio_p2, bio_p3, bio_p4)
select 1,
  'Soy Marcausente, tengo 21 años y soy un apasionado de los videojuegos...',
  'Desde hace un tiempo rondaba por mi cabeza la idea de crear un portal...',
  'El objetivo de GameCritia es mirar los videojuegos desde otra perspectiva...',
  'Este proyecto nace del amor por el medio...'
where not exists (select 1 from public.about_us_content);

-- Enable RLS for about_us_content
alter table public.about_us_content enable row level security;
create policy "Public read about" on public.about_us_content for select using (true);
create policy "Admin write about" on public.about_us_content for all using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'administrador')
);


-- TABLE: contact_info
create table if not exists public.contact_info (
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
