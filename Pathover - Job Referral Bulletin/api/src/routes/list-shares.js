import { Router } from 'express';
import listSharesController from '../controllers/list-shares.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Share a list with a user by email
router.post('/:listId/share', listSharesController.shareList);

// Get all lists shared with the current user
router.get('/shared-with-me', listSharesController.getSharedLists);

// Get all users a list is shared with
router.get('/:listId/shares', listSharesController.getListShares);

// Remove a share
router.delete('/:listId/share/:userId', listSharesController.removeShare);

export default router; 