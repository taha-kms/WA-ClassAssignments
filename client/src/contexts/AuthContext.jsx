import { createContext, useContext, useEffect, useState } from 'react';
import * as API from '../services/api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    API.me().then(setUser).catch(() => setUser(null)).finally(() => setReady(true));
  }, []);

  const doLogin = async (username, password) => {
    const u = await API.login(username, password);
    setUser(u);
    return u;
  };

  const doLogout = async () => {
    await API.logout();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, ready, login: doLogin, logout: doLogout }}>
      {children}
    </AuthCtx.Provider>
  );
}
