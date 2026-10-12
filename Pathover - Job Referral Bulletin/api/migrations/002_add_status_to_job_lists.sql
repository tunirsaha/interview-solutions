ALTER TABLE job_lists ADD COLUMN IF NOT EXISTS status INTEGER NOT NULL DEFAULT 1;
-- 1 = active, 0 = deleted 