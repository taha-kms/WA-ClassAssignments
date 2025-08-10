import { Router } from "express";

import { evaluateAssignment } from '../controllers/assignmentController.mjs';


import {
  ensureLoggedIn,
  ensureTeacher,
  ensureStudent,
  ensureInAssignmentOrOwner,
} from "../middleware/authMiddleware.mjs";

import {
  createAssignment,
  listOpenForStudentCtrl,
  getAssignmentCtrl,
  upsertAnswerCtrl,
  // evaluateAssignment  // (uncomment when Phase 6 is implemented)
} from "../controllers/assignmentController.mjs";

const router = Router();

// Teacher: create assignment
router.post("/assignments", ensureLoggedIn, ensureTeacher, createAssignment);

// Student: list open assignments
router.get(
  "/assignments/open",
  ensureLoggedIn,
  ensureStudent,
  listOpenForStudentCtrl
);

// Logged-in: view assignment (owner teacher OR student in group)
router.get(
  "/assignments/:id",
  ensureLoggedIn,
  ensureInAssignmentOrOwner,
  getAssignmentCtrl
);

// Student: submit/update answer (must be in group; assignment open)
router.put(
  "/assignments/:id/answer",
  ensureLoggedIn,
  ensureStudent,
  ensureInAssignmentOrOwner,
  upsertAnswerCtrl
);

router.put('/assignments/:id/evaluation',
  ensureLoggedIn,
  ensureTeacher,
  evaluateAssignment
);
export default router;
