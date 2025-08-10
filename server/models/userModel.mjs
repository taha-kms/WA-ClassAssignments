import { get, getAll } from './db.mjs';

export async function findByEmail(email) {
  return get('SELECT * FROM users WHERE email = ?', [email]);
}

export async function findById(id) {
  return get('SELECT * FROM users WHERE id = ?', [id]);
}

export async function listStudents() {
  return getAll(
    'SELECT id, name, surname, email FROM users WHERE role = "student" ORDER BY surname, name'
  );
}
