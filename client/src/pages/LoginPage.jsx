import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (u,p) => {
    try {
      setError('');
      const me = await login(u,p);
      // simple redirect by role
      nav(me.role==='teacher' ? '/teacher/status' : '/student/assignments/open', { replace:true });
    } catch (e) {
      setError('Invalid credentials');
    }
  };

  if (user) { nav('/', { replace:true }); return null; }

  return <LoginForm onSubmit={handleLogin} error={error} />;
}
