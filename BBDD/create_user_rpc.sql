-- Enable pgcrypto if not already enabled (usually is, but good to be safe)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- FUNCTION: Create User Admin (RPC)
-- Allows an administrator to create a new user without sending a confirmation email.
-- It works by inserting directly into auth.users with email_confirmed_at set to NOW().
-- The 'on_auth_user_created' trigger will automatically create the profile.
-- Then we update the profile to the desired role.

CREATE OR REPLACE FUNCTION public.create_user_admin(
    new_email TEXT,
    new_password TEXT,
    new_role TEXT DEFAULT 'usuario'
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- 1. Check if the executor is an administrator
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'administrador') THEN
      RAISE EXCEPTION 'Access Denied: Only administrators can create users.';
  END IF;

  -- 2. Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
      RAISE EXCEPTION 'User with this email already exists.';
  END IF;

  -- 3. Insert into auth.users
  -- Uses pgcrypto to hash the password
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Default instance_id
    gen_random_uuid(), -- Generate new UUID
    'authenticated', -- Audience
    'authenticated', -- Role
    new_email,
    crypt(new_password, gen_salt('bf')), -- Hash password
    now(), -- Auto-confirm email
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- 4. Update the role in profiles (Trigger creates it as 'usuario' by default)
  -- The trigger might take a split second, so we might need to wait or just update.
  -- Since triggers are synchronous in Postgres, it should be there.
  UPDATE public.profiles
  SET role = new_role
  WHERE id = new_user_id;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
