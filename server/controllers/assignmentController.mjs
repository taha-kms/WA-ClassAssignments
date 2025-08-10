
import { closedAssignmentsAndAvgForStudent } from "../models/assignmentModel.mjs";
import { asyncHandler } from '../middleware/asyncHandler.mjs';

import { 
  parseId,
  isNonEmptyString, 
  parseStudentIds, 
  assert, 
  parseIntInRange 
} from '../utils/validators.mjs';

import {
  countPairsForTeacher,
  createAssignment as create,
  getAssignmentById,
  evaluateAndClose,
  listOpenForStudent
} from '../models/assignmentModel.mjs';

import { 
  getAnswer, 
  upsertAnswer 
} from '../models/answerModel.mjs';



// POST /api/assignments (teacher)
export const createAssignment = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const { question, studentIds } = req.body;

  assert(isNonEmptyString(question), 'Question is required', 400);
  const ids = parseStudentIds(studentIds);

  // pair-constraint via view
  const pairCounts = await countPairsForTeacher(teacherId);
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const [a, b] = ids[i] < ids[j] ? [ids[i], ids[j]] : [ids[j], ids[i]];
      assert((pairCounts.get(`${a},${b}`) || 0) < 2, `Students ${a} and ${b} already paired twice`, 400);
    }
  }

  const id = await create({ teacherId, question: question.trim(), studentIds: ids });
  res.status(201).json({ id });
});

// GET /api/assignments/open (student)
export const listOpenForStudentCtrl = asyncHandler(async (req, res) => {
  const rows = await listOpenForStudent(req.user.id);
  res.json(rows);
});

// GET /api/assignments/:id (owner teacher OR group student)
export const getAssignmentCtrl = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'assignment id');
  const assignment = await getAssignmentById(id);
  if (!assignment) return res.status(404).json({ error: 'Not found' });
  const answer = await getAnswer(id);
  res.json({ ...assignment, answer: answer?.text ?? null });
});

// PUT /api/assignments/:id/answer (student in group, only if open)
export const upsertAnswerCtrl = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'assignment id');
  const assignment = await getAssignmentById(id);
  if (!assignment) return res.status(404).json({ error: 'Not found' });
  assert(assignment.status === 'open', 'Assignment is closed', 400);
  const text = (req.body?.text ?? '').toString();
  assert(isNonEmptyString(text), 'Answer text is required', 400);
  await upsertAnswer(id, text.trim());
  res.json({ ok: true });
});

// PUT /api/assignments/:id/evaluation (teacher owner)
export const evaluateAssignment = asyncHandler(async (req, res) => {
  const assignmentId = parseId(req.params.id, 'assignment id');
  const intScore = parseIntInRange(req.body?.score, 0, 30, 'Score');
  await evaluateAndClose({ assignmentId, teacherId: req.user.id, score: intScore });
  res.json({ ok: true });
});

export async function listScoresForStudent(req, res, next) {
  try {
    const { list, overallAvg } = await closedAssignmentsAndAvgForStudent(
      req.user.id
    );
    res.json({ overallAvg, assignments: list });
  } catch (err) {
    next(err);
  }
}

