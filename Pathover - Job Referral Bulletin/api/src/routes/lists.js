import { Router } from 'express';
import listsController from '../controllers/lists.controller.js';

const router = Router();

router.use('/', listsController);

export default router; 