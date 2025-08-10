import { Router } from 'express';
import { ensureLoggedIn, ensureTeacher } from '../middleware/authMiddleware.mjs';
import { createAssignment } from '../controllers/assignmentController.mjs';

const router = Router();

router.post('/assignments', ensureLoggedIn, ensureTeacher, createAssignment);

export default router;

