import { Router } from 'express';
import jobsController from '../controllers/jobs.controller.js';

const router = Router();

router.use('/', jobsController);

export default router; 