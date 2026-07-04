import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMeApi, loginApi, registerApi, logoutApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getMeApi()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await loginApi({ email, password });
    const { user, token } = res.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (username, handle, email, password) => {
    const res = await registerApi({ username, handle, email, password });
    const { user, token } = res.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await getMeApi();
    setUser(res.data.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
