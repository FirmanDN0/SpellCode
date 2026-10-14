-- ==============================================================================
-- SPELLCODE SUPABASE MIGRATION 003: AUTH HOOKS & ONBOARDING TRIGGERS
-- Description: Automatically provision player profile, starter familiar,
--              initial level unlock (w1-l1), and welcome achievement.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_username TEXT;
  v_display_name TEXT;
  v_avatar_id TEXT;
BEGIN
  -- 1. Determine username
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1),
    'apprentice_' || SUBSTRING(NEW.id::text, 1, 8)
  );

  -- Sanitize username (alphanumeric and underscore only, min 3 chars)
  v_username := REGEXP_REPLACE(LOWER(v_username), '[^a-z0-9_]', '_', 'g');
  IF LENGTH(v_username) < 3 THEN
    v_username := v_username || '_' || SUBSTRING(NEW.id::text, 1, 4);
  END IF;

  -- Ensure username uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_username := v_username || SUBSTRING(gen_random_uuid()::text, 1, 4);
  END LOOP;

  -- 2. Determine display name & avatar
  v_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', 'Penyihir Cilik');
  v_avatar_id := COALESCE(NEW.raw_user_meta_data->>'avatar_id', 'apprentice_default');

  -- 3. Create player profile
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_id,
    total_xp,
    wizard_rank,
    active_familiar_id
  ) VALUES (
    NEW.id,
    v_username,
    v_display_name,
    v_avatar_id,
    0,
    'Novice Conjurer',
    'pyx_fire_cat'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 4. Grant Starter Familiar (Pyx the Fire Cat)
  INSERT INTO public.player_familiars (
    user_id,
    familiar_id
  ) VALUES (
    NEW.id,
    'pyx_fire_cat'
  )
  ON CONFLICT (user_id, familiar_id) DO NOTHING;

  -- 5. Unlock First Level (World 1 Level 1)
  INSERT INTO public.player_progress (
    user_id,
    level_id,
    status,
    stars,
    best_step_count,
    attempts_count
  ) VALUES (
    NEW.id,
    'w1-l1',
    'unlocked',
    0,
    0,
    0
  )
  ON CONFLICT (user_id, level_id) DO NOTHING;

  -- 6. Grant Welcome Achievement
  INSERT INTO public.player_achievements (
    user_id,
    achievement_id
  ) VALUES (
    NEW.id,
    'welcome_apprentice'
  )
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
