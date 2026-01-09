-- Create reviews table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subtitle text,
  cover_image text,
  rating numeric(3, 1) check (rating >= 0 and rating <= 10),
  author text,
  content jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies for Reviews
create policy "Public read reviews" on public.reviews for select using (true);

create policy "Admin insert reviews" on public.reviews for insert with check (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'administrador')
);

create policy "Admin update reviews" on public.reviews for update using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'administrador')
);

create policy "Admin delete reviews" on public.reviews for delete using (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'administrador')
);

-- Storage Bucket Setup for 'review-images'
-- Note: Buckets are usually created via the Storage API or Dashboard, but we can insert into storage.buckets if permissions allow.
-- IMPORTANT: You usually need to create the bucket 'review-images' manually in the Supabase Dashboard -> Storage.
-- This script sets up the policies assuming the bucket exists.

create policy "Public Access Review Images" on storage.objects for select using ( bucket_id = 'review-images' );

create policy "Admin Upload Review Images" on storage.objects for insert with check (
  bucket_id = 'review-images' 
  and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'administrador')
);

create policy "Admin Delete Review Images" on storage.objects for delete using (
  bucket_id = 'review-images'
  and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'administrador')
);
