-- Remove remaining old columns from jobs table
BEGIN;

-- Remove the old columns that should have been removed in the previous migration
ALTER TABLE jobs DROP COLUMN IF EXISTS location;
ALTER TABLE jobs DROP COLUMN IF EXISTS description;
ALTER TABLE jobs DROP COLUMN IF EXISTS is_public;

COMMIT; 