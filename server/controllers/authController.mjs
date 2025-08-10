export function me(req, res) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.user);
}

export function logout(req, res, next) {
  req.logout(err => {
    if (err) return next(err);
    res.status(200).json({ ok: true });
  });
}
