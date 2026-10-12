-- Create list_shares table for private list sharing
CREATE TABLE IF NOT EXISTS list_shares (
    id SERIAL PRIMARY KEY,
    list_id INTEGER NOT NULL,
    shared_by_user_id INTEGER NOT NULL,
    shared_with_user_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (list_id) REFERENCES job_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(list_id, shared_with_user_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_list_shares_list_id ON list_shares(list_id);
CREATE INDEX IF NOT EXISTS idx_list_shares_shared_with ON list_shares(shared_with_user_id); 