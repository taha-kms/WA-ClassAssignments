import { getAssignmentById } from '../models/assignmentModel.mjs';
import { parseId } from '../utils/validators.mjs';

export function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated' });
}

export function ensureTeacher(req, res, next) {
  return req.user?.role === 'teacher'
    ? next()
    : res.status(403).json({ error: 'Teachers only' });
}

export function ensureStudent(req, res, next) {
  return req.user?.role === 'student'
    ? next()
    : res.status(403).json({ error: 'Students only' });
}

// GET /assignments/:id visibility: owner teacher or student in group
export async function ensureInAssignmentOrOwner(req, res, next) {
  const id = parseId(req.params.id, 'assignment id');
  const assignment = await getAssignmentById(id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

  const studentIds = String(assignment.studentIds || '')
    .split(',')
    .filter(Boolean)
    .map(Number);

  const isOwner = req.user.role === 'teacher' && req.user.id === assignment.teacher_id;
  const inGroup = req.user.role === 'student' && studentIds.includes(req.user.id);

  if (isOwner || inGroup) return next();
  return res.status(403).json({ error: 'Forbidden' });
}
