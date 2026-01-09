-- Create a table for public profiles linked to auth.users
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text check (role in ('usuario', 'escritor', 'administrador')) default 'usuario',
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Policy: Anyone can read profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

-- Policy: Users can insert their own profile
create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, username)
  values (new.id, new.email, 'usuario', new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- INSTRUCTIONS FOR ADMIN CREATION:
-- 1. Create the user 'marcausente@gmail.com' manually in Supabase Dashboard -> Authentication.
-- 2. Run the following command to promote them to admin:
-- update profiles set role = 'administrador' where email = 'marcausente@gmail.com';
