import { run, getAll, get } from './db.mjs';

export async function countPairsForTeacher(teacherId) {
  const sql = `
    SELECT s1.student_id AS a, s2.student_id AS b, COUNT(*) AS together
    FROM assignments AS A
    JOIN assignment_students s1 ON s1.assignment_id = A.id
    JOIN assignment_students s2 
      ON s2.assignment_id = A.id 
      AND s2.student_id > s1.student_id
    WHERE A.teacher_id = ?
    GROUP BY a, b
  `;
  const rows = await getAll(sql, [teacherId]);
  const map = new Map();
  for (const { a, b, together } of rows) {
    map.set(`${a},${b}`, together);
  }
  return map;
}

export async function createAssignment({ teacherId, question, studentIds }) {
  return new Promise((resolve, reject) => {
    // wrap in transaction
    const db = (async () => (await import('./db.mjs')).db)();
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      db.run(
        'INSERT INTO assignments (teacher_id, question, status) VALUES (?, ?, ?)',
        [teacherId, question, 'open'],
        function (err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }
          const assignmentId = this.lastID;
          const stmt = db.prepare(
            'INSERT INTO assignment_students (assignment_id, student_id) VALUES (?, ?)'
          );
          for (const sid of studentIds) {
            stmt.run([assignmentId, sid], (err2) => {
              if (err2) {
                db.run('ROLLBACK');
                return reject(err2);
              }
            });
          }
          stmt.finalize((err3) => {
            if (err3) {
              db.run('ROLLBACK');
              return reject(err3);
            }
            db.run('COMMIT', (err4) => {
              if (err4) return reject(err4);
              resolve(assignmentId);
            });
          });
        }
      );
    });
  });
}
