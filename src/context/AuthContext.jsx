import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import baseUrl from '../data/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('adminInfo');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // We check localStorage directly (not just React state) so a page refresh
  // doesn't log the admin out — the token survives in localStorage.
  const isAuthenticated = !!localStorage.getItem('adminToken');

  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${baseUrl}/api/admin/auth/login`, { email, password });
      localStorage.setItem('adminToken', res.data.token);
      const info = { email: res.data.email, firstName: res.data.firstName, lastName: res.data.lastName };
      localStorage.setItem('adminInfo', JSON.stringify(info));
      setAdmin(info);
      return true;
    } catch (err) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setAdmin(null);
  }

  const value = { admin, isAuthenticated, login, logout, error, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}