import { db, run, getAll, get } from "./db.mjs";

export async function countPairsForTeacher(teacherId) {
  const rows = await getAll(
    `SELECT student1_id AS a, student2_id AS b, collaborations AS together
     FROM pair_collaborations
     WHERE teacher_id = ?`,
    [teacherId]
  );
  const map = new Map();
  for (const { a, b, together } of rows) map.set(`${a},${b}`, together);
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


export async function classStatusForTeacher(teacherId, sortBy = 'name') {
  // Pull pre-aggregated numbers from the view; include all students (0/0/null) with a LEFT JOIN
  const rows = await getAll(
    `
    SELECT
      u.id AS student_id,
      u.name,
      u.surname,
      u.email,
      COALESCE(ss.open_count, 0)  AS openCount,
      COALESCE(ss.closed_count, 0) AS closedCount,
      ss.weighted_avg AS avg
    FROM users u
    LEFT JOIN student_stats ss
      ON ss.student_id = u.id AND ss.teacher_id = ?
    WHERE u.role = 'student'
    `,
    [teacherId]
  );

  // same sorting as before
  if (sortBy === 'total') {
    rows.sort((a,b) => (b.openCount+b.closedCount)-(a.openCount+a.closedCount) || a.surname.localeCompare(b.surname));
  } else if (sortBy === 'avg') {
    rows.sort((a,b) => (a.avg==null)-(b.avg==null) || (b.avg??0)-(a.avg??0) || a.surname.localeCompare(b.surname));
  } else {
    rows.sort((a,b) => a.surname.localeCompare(b.surname) || a.name.localeCompare(b.name));
  }
  return rows;
}


export async function closedAssignmentsAndAvgForStudent(studentId) {
  const list = await getAll(
    `
    WITH group_sizes AS (
      SELECT assignment_id, COUNT(*) AS g
      FROM assignment_students
      GROUP BY assignment_id
    )
    SELECT
      a.id AS assignment_id,
      a.question,
      a.score,
      gs.g AS groupSize,
      t.id AS teacher_id,
      t.name AS teacher_name,
      t.surname AS teacher_surname
    FROM assignments a
    JOIN assignment_students asg ON asg.assignment_id = a.id
    JOIN group_sizes gs ON gs.assignment_id = a.id
    JOIN users t ON t.id = a.teacher_id
    WHERE asg.student_id = ?
      AND a.status = 'closed'
    ORDER BY a.id DESC
    `,
    [studentId]
  );

  // compute weighted average: sum(score*(1/g))/sum(1/g)
  let num = 0, den = 0;
  for (const row of list) {
    const w = 1.0 / row.groupSize;
    num += row.score * w;
    den += w;
  }
  const overallAvg = den > 0 ? Math.round((num / den) * 100) / 100 : null;

  return { list, overallAvg };
}
