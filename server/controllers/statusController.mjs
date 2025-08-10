import { classStatusForTeacher } from '../models/assignmentModel.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';

export const classStatus = asyncHandler(async (req, res) => {
  const sort = String(req.query.sort || 'name').toLowerCase();
  const sortBy = ['name', 'total', 'avg'].includes(sort) ? sort : 'name';
  const data = await classStatusForTeacher(req.user.id, sortBy);
  res.json(data);
});
