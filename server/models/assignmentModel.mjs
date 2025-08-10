import { db, run, getAll, get } from "./db.mjs";

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
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      db.run(
        "INSERT INTO assignments (teacher_id, question, status) VALUES (?, ?, ?)",
        [teacherId, question, "open"],
        function (err) {
          if (err) {
            db.run("ROLLBACK");
            return reject(err);
          }
          const assignmentId = this.lastID;
          const stmt = db.prepare(
            "INSERT INTO assignment_students (assignment_id, student_id) VALUES (?, ?)"
          );
          for (const sid of studentIds) {
            stmt.run([assignmentId, sid], (err2) => {
              if (err2) {
                db.run("ROLLBACK");
                return reject(err2);
              }
            });
          }
          stmt.finalize((err3) => {
            if (err3) {
              db.run("ROLLBACK");
              return reject(err3);
            }
            db.run("COMMIT", (err4) => {
              if (err4) return reject(err4);
              resolve(assignmentId);
            });
          });
        }
      );
    });
  });
}

export async function listOpenForStudent(studentId) {
  const sql = `
    SELECT A.id, A.question, A.status,
           GROUP_CONCAT(S.name || ' ' || S.surname, ', ') AS groupMembers
    FROM assignments AS A
    JOIN assignment_students AS ASG ON A.id = ASG.assignment_id
    JOIN users AS S ON ASG.student_id = S.id
    WHERE A.status = 'open'
      AND A.id IN (
        SELECT assignment_id
        FROM assignment_students
        WHERE student_id = ?
      )
    GROUP BY A.id
  `;
  return getAll(sql, [studentId]);
}

export async function getAssignmentById(id) {
  const sql = `
    SELECT A.*, GROUP_CONCAT(S.id) AS studentIds
    FROM assignments AS A
    JOIN assignment_students AS ASG ON A.id = ASG.assignment_id
    JOIN users AS S ON ASG.student_id = S.id
    WHERE A.id = ?
    GROUP BY A.id
  `;
  return get(sql, [id]);
}

export async function getAnswerExists(assignmentId) {
  const row = await get("SELECT 1 FROM answers WHERE assignment_id = ?", [
    assignmentId,
  ]);
  return !!row;
}

export async function evaluateAndClose({ assignmentId, teacherId, score }) {
  // Validate owner + current status inside a transaction
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.get(
        "SELECT teacher_id, status FROM assignments WHERE id = ?",
        [assignmentId],
        async (err, row) => {
          if (err) {
            db.run("ROLLBACK");
            return reject(err);
          }
          if (!row) {
            db.run("ROLLBACK");
            return reject(
              Object.assign(new Error("Assignment not found"), { status: 404 })
            );
          }
          if (row.teacher_id !== teacherId) {
            db.run("ROLLBACK");
            return reject(
              Object.assign(new Error("Forbidden"), { status: 403 })
            );
          }
          if (row.status !== "open") {
            db.run("ROLLBACK");
            return reject(
              Object.assign(new Error("Assignment already closed"), {
                status: 400,
              })
            );
          }

          // ensure answer exists
          db.get(
            "SELECT 1 FROM answers WHERE assignment_id = ?",
            [assignmentId],
            (err2, ans) => {
              if (err2) {
                db.run("ROLLBACK");
                return reject(err2);
              }
              if (!ans) {
                db.run("ROLLBACK");
                return reject(
                  Object.assign(new Error("No answer submitted yet"), {
                    status: 400,
                  })
                );
              }

              db.run(
                "UPDATE assignments SET status = ?, score = ? WHERE id = ?",
                ["closed", score, assignmentId],
                function (err3) {
                  if (err3) {
                    db.run("ROLLBACK");
                    return reject(err3);
                  }
                  db.run("COMMIT", (err4) => {
                    if (err4) return reject(err4);
                    resolve({ changes: this.changes });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
}
