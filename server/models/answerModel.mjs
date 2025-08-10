import { run, get } from './db.mjs';

export async function upsertAnswer(assignmentId, text) {
  // If answer exists, update; else insert
  const existing = await get('SELECT * FROM answers WHERE assignment_id = ?', [assignmentId]);
  if (existing) {
    await run('UPDATE answers SET text = ? WHERE assignment_id = ?', [text, assignmentId]);
  } else {
    await run('INSERT INTO answers (assignment_id, text) VALUES (?, ?)', [assignmentId, text]);
  }
}

export async function getAnswer(assignmentId) {
  return get('SELECT text FROM answers WHERE assignment_id = ?', [assignmentId]);
}
