-- TABLE: site_content
create table if not exists public.site_content (
  id serial primary key,
  section text not null, -- e.g., 'about', 'contact'
  key text not null,     -- e.g., 'bio_p1', 'email'
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (section, key)
);

-- Enable RLS
alter table public.site_content enable row level security;

-- Policies
create policy "Public read access" on public.site_content
  for select using (true);

create policy "Admin write access" on public.site_content
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'administrador'
    )
  );

-- INITIAL CONTENT (Idempotent insert)
insert into public.site_content (section, key, content) values
('about', 'bio_p1', 'Soy Marcausente, tengo 21 años y soy un apasionado de los videojuegos...'),
('about', 'bio_p2', 'Desde hace un tiempo rondaba por mi cabeza la idea de crear un portal...'),
('about', 'bio_p3', 'El objetivo de GameCritia es mirar los videojuegos desde otra perspectiva...'),
('about', 'bio_p4', 'Este proyecto nace del amor por el medio...'),
('contact', 'name', 'Marc Fernández Messa'),
('contact', 'email', 'marcausente@gmail.com'),
('contact', 'twitter_url', 'https://x.com/marcausente'),
('contact', 'twitter_handle', '@marcausente')
on conflict (section, key) do nothing;


-- FUNCTION: Update User Role (RPC)
create or replace function public.update_user_role(target_user_id uuid, new_role text)
returns void as $$
begin
  -- Check if executing user is admin
  if not exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'administrador'
  ) then
      raise exception 'Access Denied: Only admins can update roles';
  end if;

  update public.profiles
  set role = new_role
  where id = target_user_id;
end;
$$ language plpgsql security definer;


-- FUNCTION: Delete User (RPC)
-- Note: This deletes from auth.users, which cascades to profiles
create or replace function public.delete_user_by_id(target_user_id uuid)
returns void as $$
begin
  -- Check if executing user is admin
  if not exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'administrador'
  ) then
      raise exception 'Access Denied: Only admins can delete users';
  end if;

  -- Delete from auth.users (requires suitable permissions, usually works via dashboard-created function)
  delete from auth.users where id = target_user_id;
end;
$$ language plpgsql security definer;


-- FUNCTION: Get All Profiles with Email (RPC)
-- Standard select on profiles restricts email visibility often, this ensures admins get everything
create or replace function public.get_all_users_admin()
returns table (
  id uuid,
  email text,
  role text,
  username text,
  created_at timestamptz
) as $$
begin
  if not exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'administrador'
  ) then
      raise exception 'Access Denied';
  end if;

  return query
  select p.id, p.email, p.role, p.username, p.created_at
  from public.profiles p;
end;
$$ language plpgsql security definer;
