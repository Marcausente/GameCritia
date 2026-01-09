-- 1. Update Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS full_name text;

-- 2. Update Reviews Table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Optional: Backfill user_id for existing reviews (if any) to a default admin if possible, 
-- or leave null. Ideally, we assumes clean slate or acceptable nulls.

-- 3. Review Policies for Writers

-- Allow Writers to Insert Reviews
DROP POLICY IF EXISTS "Writer insert reviews" ON public.reviews;
CREATE POLICY "Writer insert reviews" ON public.reviews 
FOR INSERT WITH CHECK (
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'escritor')
);

-- Allow Writers to Edit OWN Reviews
DROP POLICY IF EXISTS "Writer update own reviews" ON public.reviews;
CREATE POLICY "Writer update own reviews" ON public.reviews 
FOR UPDATE USING (
  auth.uid() = user_id 
  AND 
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'escritor')
);

-- Note: Writers cannot delete reviews (so no policy for DELETE needed for them).
-- Note: 'Public read reviews' already exists, so they can see all.

-- 4. Storage Policies for Writers (review-images bucket)

-- Allow Writers to Upload Images
DROP POLICY IF EXISTS "Writer Upload Review Images" ON storage.objects;
CREATE POLICY "Writer Upload Review Images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'review-images' 
  AND 
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'escritor')
);

-- Allow Writers to Delete OWN Images (Optional, but good for cleanup if they edit/remove image)
-- Ideally, we check owner match. storage.objects has 'owner' column usually matching auth.uid()
DROP POLICY IF EXISTS "Writer Delete Own Review Images" ON storage.objects;
CREATE POLICY "Writer Delete Own Review Images" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'review-images'
  AND 
  auth.uid() = owner
  AND
  exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'escritor')
);
