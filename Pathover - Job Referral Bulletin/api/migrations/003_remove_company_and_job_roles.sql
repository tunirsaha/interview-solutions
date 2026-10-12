-- Remove company_id and job roles, simplify jobs table
BEGIN;

-- Drop job_roles table if it exists
DROP TABLE IF EXISTS job_roles CASCADE;

-- Drop companies table if it exists
DROP TABLE IF EXISTS companies CASCADE;

-- Remove company_id from users table
ALTER TABLE users DROP COLUMN IF EXISTS company_id;

-- Remove company_id from job_lists table
ALTER TABLE job_lists DROP COLUMN IF EXISTS company_id;

-- Remove company_id from jobs table
ALTER TABLE jobs DROP COLUMN IF EXISTS company_id;

-- Remove company_id from invites table
ALTER TABLE invites DROP COLUMN IF EXISTS company_id;

-- Remove job role related columns from jobs table
ALTER TABLE jobs DROP COLUMN IF EXISTS job_role_id;
ALTER TABLE jobs DROP COLUMN IF EXISTS roles_responsibilities;
ALTER TABLE jobs DROP COLUMN IF EXISTS years_experience;
ALTER TABLE jobs DROP COLUMN IF EXISTS locations;
ALTER TABLE jobs DROP COLUMN IF EXISTS submission_limit;

-- Simplify jobs table to only have essential columns
-- Keep: id, job_list_id, title, apply_link, created_at, updated_at
-- Remove: location, description, is_public (we'll handle visibility through job_lists)

-- Add updated_at column to jobs table (no default, will be set by backend)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL;

-- Update existing jobs to have updated_at set to created_at
UPDATE jobs SET updated_at = created_at WHERE updated_at IS NULL;

COMMIT; 