import { query } from '../db.js';

export async function createUser(name, email, passwordHash, inviteToken = null) {
  const now = new Date().toISOString();
  const result = await query(
    'INSERT INTO users(name, email, password_hash, invite_token, created_at) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, email, passwordHash, inviteToken, now]
  );
  return result.rows[0];
}

export async function findByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email=$1', [email]);
  return result.rows[0];
}

export async function findById(id) {
  const result = await query('SELECT * FROM users WHERE id=$1', [id]);
  return result.rows[0];
}

export async function updatePassword(id, passwordHash) {
  const result = await query('UPDATE users SET password_hash=$1 WHERE id=$2 RETURNING *', [passwordHash, id]);
  return result.rows[0];
}

export async function findIdByEmail(email) {
  const result = await query('SELECT id FROM users WHERE email=$1', [email]);
  return result.rows[0]?.id;
} 