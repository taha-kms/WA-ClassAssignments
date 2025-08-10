import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import * as User from '../models/userModel.mjs';

// LocalStrategy: login with username (email) + password
passport.use(
  new LocalStrategy({ usernameField: 'username', passwordField: 'password' },
    async (username, password, done) => {
      try {
        const user = await User.findByEmail(username);
        if (!user) return done(null, false, { message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return done(null, false, { message: 'Invalid credentials' });

        const safeUser = {
          id: user.id,
          name: user.name,
          surname: user.surname,
          role: user.role,
          email: user.email
        };

        return done(null, safeUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// store user id in session
passport.serializeUser((user, done) => done(null, user.id));

// retrieve user object from id in session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) return done(null, false);
    const safeUser = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      role: user.role,
      email: user.email
    };
    done(null, safeUser);
  } catch (err) {
    done(err);
  }
});
