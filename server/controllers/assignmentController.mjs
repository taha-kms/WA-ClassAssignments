import { countPairsForTeacher, createAssignment as create } from '../models/assignmentModel.mjs';
import { assert } from '../utils/validators.mjs';
import { listOpenForStudent, getAssignmentById } from '../models/assignmentModel.mjs';
import { getAnswer, upsertAnswer } from '../models/answerModel.mjs';
import { evaluateAndClose } from '../models/assignmentModel.mjs';


export async function createAssignment(req, res, next) {
  try {
    const { question, studentIds } = req.body;
    const teacherId = req.user.id;

    // Basic validation
    assert(typeof question === 'string' && question.trim().length > 0, 'Question is required');
    assert(Array.isArray(studentIds), 'studentIds must be an array');
    assert(studentIds.length >= 2 && studentIds.length <= 6, 'Group size must be between 2 and 6');

    // Remove duplicates
    const uniqueIds = [...new Set(studentIds)];
    assert(uniqueIds.length === studentIds.length, 'Duplicate student IDs in group');

    // Pair constraint
    const pairCounts = await countPairsForTeacher(teacherId);
    for (let i = 0; i < uniqueIds.length; i++) {
      for (let j = i + 1; j < uniqueIds.length; j++) {
        const key = `${Math.min(uniqueIds[i], uniqueIds[j])},${Math.max(uniqueIds[i], uniqueIds[j])}`;
        if ((pairCounts.get(key) || 0) >= 2) {
          assert(false, `Students ${uniqueIds[i]} and ${uniqueIds[j]} already paired twice`);
        }
      }
    }

    const id = await create({ teacherId, question: question.trim(), studentIds: uniqueIds });
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}



export async function listOpenForStudentCtrl(req, res, next) {
  try {
    const assignments = await listOpenForStudent(req.user.id);
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

export async function getAssignmentCtrl(req, res, next) {
  try {
    const assignment = await getAssignmentById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    const answer = await getAnswer(req.params.id);
    res.json({ ...assignment, answer: answer?.text || null });
  } catch (err) {
    next(err);
  }
}

export async function upsertAnswerCtrl(req, res, next) {
  try {
    const assignment = await getAssignmentById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    assert(assignment.status === 'open', 'Assignment is closed', 400);

    // Ensure user is in group (middleware ensures this, but double-check if needed)
    await upsertAnswer(req.params.id, req.body.text || '');
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}


export async function evaluateAssignment(req, res, next) {
  try {
    const assignmentId = Number(req.params.id);
    const teacherId = req.user.id;
    const { score } = req.body;

    // validate score
    const intScore = Number(score);
    assert(Number.isInteger(intScore), 'Score must be an integer', 400);
    assert(intScore >= 0 && intScore <= 30, 'Score must be between 0 and 30', 400);

    await evaluateAndClose({ assignmentId, teacherId, score: intScore });
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}