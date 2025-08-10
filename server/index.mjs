import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';


import { corsOptions } from './config/corsConfig.mjs';
import './config/passportConfig.mjs';

// Import routes
import assignmentRoutes from './routes/assignments.mjs';
import authRoutes from './routes/auth.mjs';
import studentRoutes from './routes/students.mjs';


import { notFoundHandler, errorHandler } from './middleware/errorHandler.mjs';
import { ensureLoggedIn, ensureTeacher } from './middleware/authMiddleware.mjs';


const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors(corsOptions));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: isProd ? 'lax' : 'lax',
    secure: isProd // set true only behind HTTPS
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', authRoutes);
app.use('/api', studentRoutes);
app.use('/api', assignmentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
