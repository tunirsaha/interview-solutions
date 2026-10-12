BEGIN;

-- Cleanup existing objects (drop in dependency order)
DROP TRIGGER IF EXISTS trg_default_job_list ON users;
DROP FUNCTION IF EXISTS create_default_job_list();

DROP TABLE IF EXISTS invites CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS job_lists CASCADE;
DROP TABLE IF EXISTS users CASCADE;

COMMIT;

-- Users table (no role, no company)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    invite_token TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL
);

-- Job Lists: a user's collection of job postings
CREATE TABLE IF NOT EXISTS job_lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'My Job List',
    public BOOLEAN NOT NULL DEFAULT false,
    status INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- Jobs: individual job openings in a job list
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    job_list_id INTEGER REFERENCES job_lists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    apply_link TEXT,
    status INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- Invites for user onboarding
CREATE TABLE IF NOT EXISTS invites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ
);

-- Seed default admin user
INSERT INTO users(name, email, password_hash, created_at)
VALUES ('Admin', 'admin@gmail.com', '$2b$10$XR9sIs/VID3LPvJhR2yRgOS5Pk/sxz8tFfWtshP0NoTmolpxRRSJC', now())
ON CONFLICT (email) DO NOTHING; 