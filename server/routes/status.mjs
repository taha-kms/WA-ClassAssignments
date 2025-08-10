import { Router } from 'express';
import { ensureLoggedIn, ensureTeacher } from '../middleware/authMiddleware.mjs';
import { classStatus } from '../controllers/statusController.mjs';

const router = Router();

// GET /api/status?sort=name|total|avg
router.get('/status', ensureLoggedIn, ensureTeacher, classStatus);

export default router;
