PRAGMA foreign_keys = ON;

-------------------------------------------------------
-- TABLES
-------------------------------------------------------

-- 1. Users table (teachers + students)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    role TEXT CHECK(role IN ('teacher','student')) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- 2. Assignments table
CREATE TABLE assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    status TEXT CHECK(status IN ('open','closed')) NOT NULL DEFAULT 'open',
    score INTEGER CHECK(score BETWEEN 0 AND 30),
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Assignment_Students link table
CREATE TABLE assignment_students (
    assignment_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    PRIMARY KEY (assignment_id, student_id),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Answers table
CREATE TABLE answers (
    assignment_id INTEGER PRIMARY KEY,
    text TEXT NOT NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);


-------------------------------------------------------
-- VIEWS
-------------------------------------------------------

-- 0) Clean up any previous versions
DROP VIEW IF EXISTS pair_collaborations;
DROP VIEW IF EXISTS student_stats;
DROP VIEW IF EXISTS assignment_group_sizes;

-- 1) Base view: group size per assignment
CREATE VIEW assignment_group_sizes AS
SELECT
  assignment_id,
  COUNT(*) AS group_size
FROM assignment_students
GROUP BY assignment_id;

-- 2) Pair collaborations (independent of group_sizes)
CREATE VIEW pair_collaborations AS
SELECT
  a.teacher_id,
  s1.student_id AS student1_id,
  s2.student_id AS student2_id,
  COUNT(*) AS collaborations
FROM assignments a
JOIN assignment_students s1 ON a.id = s1.assignment_id
JOIN assignment_students s2 ON a.id = s2.assignment_id
WHERE s1.student_id < s2.student_id      -- avoid (A,B)/(B,A) duplicates
GROUP BY a.teacher_id, s1.student_id, s2.student_id;

-- 3) Student stats (depends on assignment_group_sizes)
CREATE VIEW student_stats AS
SELECT
  u.id AS student_id,
  u.name,
  u.surname,
  a.teacher_id,
  SUM(CASE WHEN a.status = 'open'   THEN 1 ELSE 0 END) AS open_count,
  SUM(CASE WHEN a.status = 'closed' THEN 1 ELSE 0 END) AS closed_count,
  ROUND(
    SUM(CASE WHEN a.status = 'closed' THEN a.score * (1.0 / ags.group_size) ELSE 0 END)
    /
    NULLIF(SUM(CASE WHEN a.status = 'closed' THEN (1.0 / ags.group_size) ELSE 0 END), 0)
  , 2) AS weighted_avg
FROM users u
JOIN assignment_students ast   ON u.id = ast.student_id
JOIN assignments a             ON ast.assignment_id = a.id
JOIN assignment_group_sizes ags ON ags.assignment_id = a.id
WHERE u.role = 'student'
GROUP BY u.id, a.teacher_id;


-------------------------------------------------------
-- INDEXES
-------------------------------------------------------

CREATE INDEX idx_users_email           ON users(email);
CREATE INDEX idx_assignments_teacher   ON assignments(teacher_id);
CREATE INDEX idx_assignments_status    ON assignments(status);
CREATE INDEX idx_ast_student           ON assignment_students(student_id);
CREATE INDEX idx_ast_assignment        ON assignment_students(assignment_id);
