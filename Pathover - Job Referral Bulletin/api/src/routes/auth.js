import { Router } from 'express';
import authController from '../controllers/auth.controller.js';

const router = Router();

router.use('/', authController);

export default router; 