import { listStudents } from '../models/userModel.mjs';

export async function listAllStudents(_req, res, next) {
  try {
    const students = await listStudents();
    res.json(students);
  } catch (err) {
    next(err);
  }
}
