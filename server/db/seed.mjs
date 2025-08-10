import sqlite3 from 'sqlite3';
import { readFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcrypt';

// Resolve current directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config
const DB_DIR = __dirname;
const DB_FILE = join(DB_DIR, 'database.sqlite');
const SCHEMA_FILE = join(DB_DIR, 'schema.sql');
const NUM_TEACHERS = 6;
const NUM_STUDENTS = 80;
const NUM_ASSIGNMENTS = 100;
const PASSWORD = 'password'; // default for all

// Helpers
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function runAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}
function execAsync(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, err => (err ? reject(err) : resolve()));
  });
}

async function main() {
  let db;
  try {
    // Ensure directory exists
    mkdirSync(DB_DIR, { recursive: true });

    // Remove old DB (do this BEFORE opening the connection)
    if (existsSync(DB_FILE)) unlinkSync(DB_FILE);

    // Load schema from disk
    const schema = readFileSync(SCHEMA_FILE, 'utf-8');

    // Open DB AFTER cleanup
    db = new sqlite3.Database(DB_FILE);

    // Init DB
    await runAsync(db, 'PRAGMA foreign_keys = OFF;');
    await execAsync(db, schema);
    await runAsync(db, 'PRAGMA foreign_keys = ON;');

    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    // Insert teachers
    const teacherIds = [];
    for (let i = 1; i <= NUM_TEACHERS; i++) {
      const res = await runAsync(
        db,
        `INSERT INTO users (name, surname, role, email, password_hash) VALUES (?,?,?,?,?)`,
        [`Teacher${i}`, `Lastname${i}`, 'teacher', `teacher${i}@example.com`, passwordHash]
      );
      teacherIds.push(res.lastID);
    }

    // Insert students
    const studentIds = [];
    for (let i = 1; i <= NUM_STUDENTS; i++) {
      const res = await runAsync(
        db,
        `INSERT INTO users (name, surname, role, email, password_hash) VALUES (?,?,?,?,?)`,
        [`Student${i}`, `Lastname${i}`, 'student', `student${i}@example.com`, passwordHash]
      );
      studentIds.push(res.lastID);
    }

    // Insert assignments
    for (let i = 1; i <= NUM_ASSIGNMENTS; i++) {
      const teacherId = teacherIds[randomInt(0, teacherIds.length - 1)];
      const question = `Question for assignment ${i}`;
      const status = Math.random() < 0.5 ? 'open' : 'closed';
      const score = status === 'closed' ? randomInt(0, 30) : null;

      const res = await runAsync(
        db,
        `INSERT INTO assignments (teacher_id, question, status, score) VALUES (?,?,?,?)`,
        [teacherId, question, status, score]
      );
      const assignmentId = res.lastID;

      // Create group size between 2 and 6
      const groupSize = randomInt(2, 6);
      const chosenStudents = [];
      while (chosenStudents.length < groupSize) {
        const candidate = studentIds[randomInt(0, studentIds.length - 1)];
        if (!chosenStudents.includes(candidate)) chosenStudents.push(candidate);
      }

      // Insert group
      for (const sid of chosenStudents) {
        await runAsync(
          db,
          `INSERT INTO assignment_students (assignment_id, student_id) VALUES (?,?)`,
          [assignmentId, sid]
        );
      }

      // Add answer if closed
      if (status === 'closed') {
        await runAsync(
          db,
          `INSERT INTO answers (assignment_id, text) VALUES (?,?)`,
          [assignmentId, `Answer for assignment ${i}`]
        );
      }
    }

    console.log(
      `Seed completed: ${NUM_TEACHERS} teachers, ${NUM_STUDENTS} students, ${NUM_ASSIGNMENTS} assignments.`
    );
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    if (db) db.close();
  }
}

main();
