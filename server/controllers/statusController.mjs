import { classStatusForTeacher } from '../models/assignmentModel.mjs';

export async function classStatus(req, res, next) {
  try {
    const sort = (req.query.sort || 'name').toLowerCase();
    const sortBy = ['name', 'total', 'avg'].includes(sort) ? sort : 'name';
    const data = await classStatusForTeacher(req.user.id, sortBy);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
