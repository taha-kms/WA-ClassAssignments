import { Router } from 'express';
import { ensureLoggedIn, ensureTeacher } from '../middleware/authMiddleware.mjs';
import { listAllStudents } from '../controllers/studentController.mjs';

const router = Router();

router.get('/students', ensureLoggedIn, ensureTeacher, listAllStudents);

export default router;
