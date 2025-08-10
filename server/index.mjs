import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';


import { corsOptions } from './config/corsConfig.mjs';
import './config/passportConfig.mjs';


import authRoutes from './routes/auth.mjs';
import studentRoutes from './routes/students.mjs';


import { notFoundHandler, errorHandler } from './middleware/errorHandler.mjs';
import { ensureLoggedIn, ensureTeacher } from './middleware/authMiddleware.mjs';


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors(corsOptions));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', authRoutes);
app.use('/api', studentRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
