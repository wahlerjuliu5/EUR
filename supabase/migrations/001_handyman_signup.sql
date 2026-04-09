-- Migration 001: Support handyman self-signup
-- Run this in the Supabase SQL Editor (after seed.sql)

-- ── 1. New columns ────────────────────────────────────────────────────────────
ALTER TABLE handymen
  ADD COLUMN IF NOT EXISTS user_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS phone          text;

-- ── 2. INSERT policy (allows the signup server action to create a profile) ────
DROP POLICY IF EXISTS "allow_handyman_signup_insert" ON handymen;
CREATE POLICY "allow_handyman_signup_insert"
  ON handymen FOR INSERT
  WITH CHECK (true);

-- ── 3. UPDATE policy (handyman can edit their own profile after login) ─────────
DROP POLICY IF EXISTS "handyman_update_own" ON handymen;
CREATE POLICY "handyman_update_own"
  ON handymen FOR UPDATE
  USING (auth.uid() = user_id);
