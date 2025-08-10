import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav style={{display:'flex',gap:12,padding:12,borderBottom:'1px solid #ddd'}}>
      <Link to="/">Home</Link>
      {user?.role==='teacher' && <>
        <Link to="/teacher/assignments/new">New Assignment</Link>
        <Link to="/teacher/status">Class Status</Link>
      </>}
      {user?.role==='student' && <>
        <Link to="/student/assignments/open">My Open</Link>
        <Link to="/student/scores">My Scores</Link>
      </>}
      <div style={{marginLeft:'auto'}}>
        {user
          ? (<><span>{user.name} ({user.role})</span> <button onClick={logout}>Logout</button></>)
          : (<Link to="/login">Login</Link>)}
      </div>
    </nav>
  );
}
