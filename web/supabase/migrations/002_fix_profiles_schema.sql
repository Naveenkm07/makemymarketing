-- Fix for existing profiles table that's missing the role column
-- Run this BEFORE running 001_enhanced_schema.sql

-- First, ensure the user_role enum exists
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('advertiser', 'owner', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add the role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role user_role NOT NULL DEFAULT 'advertiser';
  END IF;
END $$;

-- Ensure other missing columns exist
DO $$ 
BEGIN
  -- Add is_verified if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add is_blocked if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_blocked'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
