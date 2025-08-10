import { countPairsForTeacher, createAssignment as create } from '../models/assignmentModel.mjs';
import { assert } from '../utils/validators.mjs';

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
