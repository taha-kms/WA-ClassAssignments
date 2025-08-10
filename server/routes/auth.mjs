import { Router } from 'express';
import passport from 'passport';
import { me, logout } from '../controllers/authController.mjs';

const router = Router();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Unauthorized' });

    req.logIn(user, err2 => {
      if (err2) return next(err2);
      return res.json(user); // safe user from strategy
    });
  })(req, res, next);
});

router.post('/logout', logout);
router.get('/me', me);

export default router;
