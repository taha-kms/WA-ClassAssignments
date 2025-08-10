import { get } from './db.mjs';

export async function findByEmail(email) {
  return get('SELECT * FROM users WHERE email = ?', [email]);
}

export async function findById(id) {
  return get('SELECT * FROM users WHERE id = ?', [id]);
}
