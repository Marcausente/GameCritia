-- REVERT SCRIPT
-- Run this on the WRONG database to undo the changes made by the accidental execution.

-- 1. Drop the new tables created
DROP TABLE IF EXISTS public.about_us_content;
DROP TABLE IF EXISTS public.contact_info;

-- 2. Drop the functions created (RPCs)
DROP FUNCTION IF EXISTS public.update_user_role;
DROP FUNCTION IF EXISTS public.delete_user_by_id;
DROP FUNCTION IF EXISTS public.get_all_users_admin;

-- 3. Revert column update: Rename 'role' back to 'rol'
-- This block checks if 'role' exists currently and 'rol' does not.
-- If so, it assumes the rename happened and reverses it.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'rol') THEN
    
    ALTER TABLE public.profiles RENAME COLUMN role TO rol;
    
  END IF;
END $$;

-- NOTE: The table 'site_content' was dropped by the previous script.
-- If that table existed and had data, it is unfortunately lost unless you have a backup.
-- If you need to recreate the structure of 'site_content', you will need the original creation script for it.
