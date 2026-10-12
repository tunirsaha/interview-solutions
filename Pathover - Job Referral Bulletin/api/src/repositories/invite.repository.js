import { query } from '../db.js';
import { randomUUID } from 'crypto';
import { createUser, findByEmail } from './user.repository.js';

// ----------------- Data-access helpers for invites -----------------

export async function createInvite(userId, email) {
  const validation = await validateInviteCreation(email);
  if (!validation.valid) throw new Error(validation.error);

  const token = randomUUID();
  const now = new Date().toISOString();
  const res = await query(
    'INSERT INTO invites(user_id, email, token, created_at) VALUES ($1,$2,$3,$4) RETURNING *',
    [userId, email, token, now]
  );

  return res.rows[0];
}

export async function findInviteByToken(token) {
  const result = await query('SELECT * FROM invites WHERE token=$1', [token]);
  return result.rows[0];
}

export async function markInviteAccepted(inviteId) {
  const now = new Date().toISOString();
  const result = await query(
    'UPDATE invites SET accepted_at=$1 WHERE id=$2 RETURNING *',
    [now, inviteId]
  );
  return result.rows[0];
}

export async function listInvitesByUser(userId) {
  const result = await query(
    'SELECT * FROM invites WHERE user_id=$1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function deleteInvite(inviteId, userId) {
  // Only allow deletion of pending invites (not accepted) and only by the creator
  const result = await query(
    'DELETE FROM invites WHERE id=$1 AND user_id=$2 AND accepted_at IS NULL RETURNING *',
    [inviteId, userId]
  );
  return result.rows.length > 0;
}

// ----------------- Validation helpers -----------------

async function validateInviteCreation(email) {
  if (!email) return { valid: false, error: 'email required' };
  
  const existing = await findByEmail(email);
  if (existing && existing.password_hash) {
    return { valid: false, error: 'email already registered' };
  }
  
  return { valid: true };
} 