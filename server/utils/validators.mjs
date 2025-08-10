// Throwing helper used everywhere
export function assert(condition, message, status = 400) {
  if (!condition) {
    const err = new Error(message);
    err.status = status;
    throw err;
  }
}

// Basic shapes
export function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

export function parseId(param, name = 'id') {
  const n = Number(param);
  assert(Number.isInteger(n) && n > 0, `Invalid ${name}`, 400);
  return n;
}

export function parseIntInRange(v, min, max, name = 'value') {
  const n = Number(v);
  assert(Number.isInteger(n), `${name} must be an integer`, 400);
  assert(n >= min && n <= max, `${name} must be between ${min} and ${max}`, 400);
  return n;
}

export function parseStudentIds(arr) {
  assert(Array.isArray(arr), 'studentIds must be an array', 400);
  const ids = [...new Set(arr.map(Number))]; // dedupe + to int
  ids.forEach((id) => assert(Number.isInteger(id) && id > 0, 'studentIds must be positive integers', 400));
  assert(ids.length >= 2 && ids.length <= 6, 'Group size must be between 2 and 6', 400);
  return ids;
}
