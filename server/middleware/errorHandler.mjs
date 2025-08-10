export function notFoundHandler(_req, res, _next) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err, _req, res, _next) {
  // normalize known assertion errors
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;

  // Avoid leaking stack traces in production; keep console in dev
  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: err.message || 'Server error' });
}
