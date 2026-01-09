-- Drop existing policies to avoid conflicts
drop policy if exists "Admin Upload Review Images" on storage.objects;
drop policy if exists "Admin Delete Review Images" on storage.objects;
drop policy if exists "Public Access Review Images" on storage.objects;

-- Create simplified policies
-- 1. Allow Public Read
create policy "Public Access Review Images"
on storage.objects for select
using ( bucket_id = 'review-images' );

-- 2. Allow upload for ANY authenticated user (Relaxed for debugging)
create policy "Authenticated Upload Review Images"
on storage.objects for insert
with check (
  bucket_id = 'review-images' 
  and auth.role() = 'authenticated'
);

-- 3. Allow update/delete for ANY authenticated user (Relaxed for debugging)
create policy "Authenticated Update Review Images"
on storage.objects for update
using ( bucket_id = 'review-images' and auth.role() = 'authenticated' );

create policy "Authenticated Delete Review Images"
on storage.objects for delete
using ( bucket_id = 'review-images' and auth.role() = 'authenticated' );
