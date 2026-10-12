import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../utils/password.js';
import { createUser, findByEmail, findById, updatePassword } from '../repositories/user.repository.js';
import { authenticate } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';

const router = Router();

// Register via invite
router.post('/register', async (req, res) => {
  const { name, email, password, inviteToken } = req.body;
  if (!name || !email || !password || !inviteToken) {
    return res.status(400).json({ message: 'Registration allowed only by invitation' });
  }
  const existing = await findByEmail(email);
  if (existing && existing.password_hash) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const inviteModel = await import('../repositories/invite.repository.js');
  const invite = await inviteModel.findInviteByToken(inviteToken);
  if (!invite || invite.accepted_at) return res.status(400).json({ message: 'Invalid or already used invite token' });
  if (invite.email !== email) return res.status(400).json({ message: 'Email mismatch for invite' });

  await inviteModel.markInviteAccepted(invite.id);

  const passwordHash = await hashPassword(password);
  let user;
  if (existing) {
    await updatePassword(existing.id, passwordHash);
    if (existing.name !== name) {
      const { query } = await import('../db.js');
      await query('UPDATE users SET name=$1 WHERE id=$2', [name, existing.id]);
    }
    user = { ...existing, name, password_hash: passwordHash };
  } else {
    user = await createUser(name, email, passwordHash);
  }
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await findByEmail(email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const match = await comparePassword(password, user.password_hash);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Current user
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Refresh token
router.post('/refresh', authenticate, (req, res) => {
  const token = jwt.sign(
    { id: req.user.id, email: req.user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: '5m' }
  );
  res.json({ token });
});

// Google sign-in
router.post('/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'idToken required' });
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || email;
    let user = await findByEmail(email);
    if (!user) {
      user = await createUser(name, email, '', null);
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// Change password
router.put('/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password required' });
  }

  const user = await findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const match = await comparePassword(currentPassword, user.password_hash);
  if (!match) return res.status(401).json({ message: 'Current password incorrect' });

  const newPasswordHash = await hashPassword(newPassword);
  await updatePassword(user.id, newPasswordHash);
  res.json({ message: 'Password updated successfully' });
});

export default router; 