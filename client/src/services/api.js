import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true, // send session cookie
});

// AUTH
export const login = (username, password) => api.post('/login', { username, password }).then(r=>r.data);
export const logout = () => api.post('/logout').then(r=>r.data);
export const me = () => api.get('/me').then(r=>r.data);

// TEACHER
export const getStudents = () => api.get('/students').then(r=>r.data);
export const createAssignment = (question, studentIds) =>
  api.post('/assignments', { question, studentIds }).then(r=>r.data);
export const getStatus = (sort='name') => api.get(`/status?sort=${sort}`).then(r=>r.data);
export const evaluateAssignment = (id, score) =>
  api.put(`/assignments/${id}/evaluation`, { score }).then(r=>r.data);

// STUDENT
export const getOpenAssignments = () => api.get('/assignments/open').then(r=>r.data);
export const getAssignment = (id) => api.get(`/assignments/${id}`).then(r=>r.data);
export const submitAnswer = (id, text) => api.put(`/assignments/${id}/answer`, { text }).then(r=>r.data);
export const getScores = () => api.get('/scores').then(r=>r.data);

export default api;
