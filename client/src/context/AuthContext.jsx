import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('omronics_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('omronics_jwt_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyExistingToken() {
      if (token) {
        try {
          const res = await api.get('/auth/verify');
          if (res.success && res.data.user) {
            setUser(res.data.user);
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    }
    verifyExistingToken();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data.token) {
      const jwtToken = res.data.token;
      const userData = res.data.user;
      localStorage.setItem('omronics_jwt_token', jwtToken);
      localStorage.setItem('omronics_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('omronics_jwt_token');
    localStorage.removeItem('omronics_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
