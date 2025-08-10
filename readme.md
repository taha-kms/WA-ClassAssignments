# Class Assignments – Web Applications I 2024/25 Exam #2

## 1. Server-side

### 1.a HTTP APIs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | /api/login | none | Authenticate user (teacher or student) via username/password. |
| POST   | /api/logout | logged-in | Logout current user. |
| GET    | /api/students | teacher | Get list of all students. |
| POST   | /api/assignments | teacher | Create a new assignment with question + group of students. Enforces pair constraint (≤2 past collaborations). |
| GET    | /api/assignments/open | student | Get open assignments for logged-in student. |
| GET    | /api/assignments/:id | logged-in | Get assignment details (question, group, answer, score if closed). |
| PUT    | /api/assignments/:id/answer | student (in group) | Submit or update group answer (only if open). |
| PUT    | /api/assignments/:id/evaluation | teacher (owner) | Assign score (0–30), close assignment. |
| GET    | /api/status | teacher | Get class status: per student → #open, #closed, avg score; sortable. |
| GET    | /api/scores | student | Get closed assignments and avg score for logged-in student. |

### 1.b Database Tables
- **users** (`id`, `name`, `surname`, `role`, `email`, `password_hash`) – Teachers and students.
- **assignments** (`id`, `teacher_id`, `question`, `status`, `score`) – One assignment per group.
- **assignment_students** (`assignment_id`, `student_id`) – Links students to their assignment group.
- **answers** (`assignment_id`, `text`) – One answer per assignment (group shared).
- **sessions** (handled by `express-session`) – For authentication persistence.

---

## 2. Client-side

### 2.a Routes
| Path | Role | Purpose |
|------|------|---------|
| `/login` | all | User login. |
| `/teacher/assignments/new` | teacher | Create a new assignment (select group). |
| `/teacher/assignments/:id` | teacher | View answer and enter evaluation. |
| `/teacher/status` | teacher | View per-student stats (open, closed, avg score). |
| `/student/assignments/open` | student | View open assignments for logged-in student. |
| `/student/assignments/:id` | student | View question, group, and submit/update answer. |
| `/student/scores` | student | View closed assignments and average score. |

### 2.b Main React Components
- `LoginForm`
- `AssignmentForm` (teacher)
- `AssignmentList` (open/closed, teacher/student variants)
- `AssignmentDetail` (view + answer/evaluation)
- `StatusTable` (teacher)
- `ScoreTable` (student)
- `NavBar`, `ProtectedRoute`, `LoadingSpinner`

---

## 3. Overall

### 3.a Screenshots
**Creation of an assignment**  
![Create Assignment](./docs/create-assignment.png)

**Overall class status**  
![Class Status](./docs/class-status.png)

### 3.b Usernames and Passwords
- Teacher 1 → username: `teacher1@example.com`, password: `password`
- Teacher 2 → username: `teacher2@example.com`, password: `password`
- Students → username: `studentX@example.com` (X=1..20), password: `password`

### 3.c

```bash
  ┌──────────┐
  │ Teachers │  NT teachers
  └─────┬────┘
        │ 1..* (each teacher can create many)
        ▼
  ┌──────────────┐
  │ Assignments  │  1 assignment = 1 group + 1 question
  │ (by teacher) │  Has status: open/closed
  └─────┬────────┘
        │ 1..1
        ▼
  ┌─────────┐
  │ Groups  │  2–6 students per group
  └────┬────┘
       │ many-to-many
       ▼
  ┌─────────┐
  │ Students│  NS students
  └─────────┘

```
---
## 4. Directories
ClassAssignments/
│
├── README.md                # Project description, APIs, routes, screenshots, credentials
│
├── client/                   # React front-end
│   ├── package.json
│   ├── public/               # Public assets (index.html, favicon, etc.)
│   └── src/
│       ├── components/       # Reusable React components
│       │   ├── LoginForm.jsx
│       │   ├── AssignmentForm.jsx
│       │   ├── AssignmentList.jsx
│       │   ├── AssignmentDetail.jsx
│       │   ├── StatusTable.jsx
│       │   ├── ScoreTable.jsx
│       │   ├── NavBar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── LoadingSpinner.jsx
│       ├── pages/            # Route-level pages
│       │   ├── TeacherStatusPage.jsx
│       │   ├── TeacherAssignmentPage.jsx
│       │   ├── StudentAssignmentsPage.jsx
│       │   ├── StudentScoresPage.jsx
│       │   └── LoginPage.jsx
│       ├── services/         # API calls (axios/fetch wrappers)
│       │   └── api.js
│       ├── contexts/         # React context (auth, global state)
│       │   └── AuthContext.jsx
│       ├── App.jsx
│       ├── main.jsx
│       └── styles/           # CSS / SCSS files
│
├── server/                   # Node.js + Express back-end
│   ├── package.json
│   ├── index.mjs              # Entry point
│   ├── routes/                # Express route handlers
│   │   ├── auth.mjs
│   │   ├── assignments.mjs
│   │   ├── students.mjs
│   │   └── status.mjs
│   ├── controllers/           # Business logic
│   │   ├── authController.mjs
│   │   ├── assignmentController.mjs
│   │   ├── studentController.mjs
│   │   └── statusController.mjs
│   ├── models/                # DB models / queries
│   │   ├── db.mjs             # SQLite connection
│   │   ├── userModel.mjs
│   │   ├── assignmentModel.mjs
│   │   ├── answerModel.mjs
│   │   └── groupModel.mjs
│   ├── middleware/            # Middleware (auth checks, error handling)
│   │   ├── authMiddleware.mjs
│   │   └── errorHandler.mjs
│   ├── utils/                  # Helper functions
│   │   └── validators.mjs
│   ├── config/                 # Config files (CORS, Passport, etc.)
│   │   ├── passportConfig.mjs
│   │   └── corsConfig.mjs
│   └── db/                     # SQLite DB & schema
│       ├── database.sqlite
│       └── schema.sql
│
└── docs/                       # Documentation & screenshots
    ├── create-assignment.png
    └── class-status.png

---
## Notes
- React 19 front-end, Node.js 22.x (LTS) + Express back-end, SQLite DB.
- Uses Passport.js + session cookies for auth, bcrypt for password hashing.
- Follows “two servers” pattern with CORS configured for development.
- Group constraint: For each teacher, no pair of students can be grouped together more than twice across that teacher’s assignments.
