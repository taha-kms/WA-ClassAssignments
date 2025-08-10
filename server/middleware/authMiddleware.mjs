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

// For GET /assignments/:id, only group members or owner teacher can view
export async function ensureInAssignmentOrOwner(req, res, next) {
  // placeholder — will implement in Phase 5 when assignmentModel is ready
  return next();
}
