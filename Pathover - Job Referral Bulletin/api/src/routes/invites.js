import { Router } from 'express';
import inviteController from '../controllers/invites.controller.js';

const router = Router();

router.use('/', inviteController);

export default router; 