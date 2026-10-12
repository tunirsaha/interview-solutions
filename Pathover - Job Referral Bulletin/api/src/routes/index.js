import { Router } from 'express';
import authRoutes from './auth.js';
import inviteRoutes from './invites.js';
import jobsRoutes from './jobs.js';
import listsRoutes from './lists.js';
import listSharesRoutes from './list-shares.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/invites', inviteRoutes);
router.use('/jobs', jobsRoutes);
router.use('/lists', listsRoutes);
router.use('/list-shares', listSharesRoutes);

export default router; 