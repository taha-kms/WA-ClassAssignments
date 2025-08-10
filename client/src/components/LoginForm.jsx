import { useState } from 'react';

export default function LoginForm({ onSubmit, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <form onSubmit={(e)=>{e.preventDefault(); onSubmit(username,password);}} style={{maxWidth:360}}>
      <h2>Login</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <label>Email</label>
      <input value={username} onChange={e=>setUsername(e.target.value)} required />
      <label>Password</label>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <button type="submit">Login</button>
    </form>
  );
}
