import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createInvite, listInvitesByUser, deleteInvite } from '../repositories/invite.repository.js';

const router = Router();

// Create a new invite
router.post('/', authenticate, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  try {
    const invite = await createInvite(req.user.id, email);
    const baseUrl = process.env.WEB_BASE_URL || 'http://localhost:4200';
    const registerLink = `${baseUrl}/register?inviteToken=${encodeURIComponent(invite.token)}`;
    res.json({ token: invite.token, registerLink });
  } catch (error) {
    console.error('Invite creation error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// List invites by user
router.get('/', authenticate, async (req, res) => {
  try {
    const invites = await listInvitesByUser(req.user.id);
    // Add computed 'accepted' field to each invite
    const invitesWithAccepted = invites.map(invite => ({
      ...invite,
      accepted: invite.accepted_at !== null
    }));
    res.json({ invites: invitesWithAccepted });
  } catch (error) {
    console.error('Error fetching invites:', error);
    res.status(500).json({ message: 'Failed to fetch invites' });
  }
});

// Delete invite
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const inviteId = parseInt(req.params.id);
    const result = await deleteInvite(inviteId, req.user.id);
    if (result) {
      res.json({ message: 'Invitation deleted successfully' });
    } else {
      res.status(404).json({ message: 'Invitation not found or not authorized' });
    }
  } catch (error) {
    console.error('Error deleting invite:', error);
    res.status(500).json({ message: 'Failed to delete invitation' });
  }
});

export default router; 