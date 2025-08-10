export function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
}

export function ensureTeacher(req, res, next) {
  if (req.user?.role === 'teacher') {
    return next();
  }
  return res.status(403).json({ error: 'Teachers only' });
}

export function ensureStudent(req, res, next) {
  if (req.user?.role === 'student') {
    return next();
  }
  return res.status(403).json({ error: 'Students only' });
}

import { getAssignmentById } from '../models/assignmentModel.mjs';

export async function ensureInAssignmentOrOwner(req, res, next) {
  const assignment = await getAssignmentById(req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

  const studentIds = assignment.studentIds.split(',').map(Number);

  const isOwner = req.user.role === 'teacher' && req.user.id === assignment.teacher_id;
  const inGroup = req.user.role === 'student' && studentIds.includes(req.user.id);

  if (isOwner || inGroup) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden' });
}



