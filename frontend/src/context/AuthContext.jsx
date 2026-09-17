import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('tiffintrack-token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('tiffintrack-token');
        setToken('');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { token: jwtToken, user: loggedUser } = response.data;
    localStorage.setItem('tiffintrack-token', jwtToken);
    setToken(jwtToken);
    setUser(loggedUser);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/api/auth/register', { name, email, password });
    const { token: jwtToken, user: loggedUser } = response.data;
    localStorage.setItem('tiffintrack-token', jwtToken);
    setToken(jwtToken);
    setUser(loggedUser);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('tiffintrack-token');
    setToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
