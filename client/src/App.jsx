import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthProvider from './contexts/AuthContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import TeacherStatusPage from './pages/TeacherStatusPage';
import TeacherAssignmentNewPage from './pages/TeacherAssignmentNewPage';
import StudentAssignmentsPage from './pages/StudentAssignmentsPage';
import AssignmentDetailPage from './pages/AssignmentDetailPage';
import StudentScoresPage from './pages/StudentScoresPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <div style={{padding:16}}>
          <Routes>
            <Route path="/login" element={<LoginPage/>} />

            <Route path="/teacher/status" element={
              <ProtectedRoute role="teacher"><TeacherStatusPage/></ProtectedRoute>
            } />
            <Route path="/teacher/assignments/new" element={
              <ProtectedRoute role="teacher"><TeacherAssignmentNewPage/></ProtectedRoute>
            } />

            <Route path="/student/assignments/open" element={
              <ProtectedRoute role="student"><StudentAssignmentsPage/></ProtectedRoute>
            } />
            <Route path="/student/assignments/:id" element={
              <ProtectedRoute role="student"><AssignmentDetailPage/></ProtectedRoute>
            } />
            <Route path="/student/scores" element={
              <ProtectedRoute role="student"><StudentScoresPage/></ProtectedRoute>
            } />

            <Route path="*" element={<div>Home</div>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
