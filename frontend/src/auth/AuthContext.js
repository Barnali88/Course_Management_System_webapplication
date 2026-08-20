import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAccessToken,
  getStoredUser,
  saveTokens,
  saveUser,
  clearTokens,
  isTokenExpired,
} from './tokenUtils';
import { apiGetMe } from '../api/usersApi';
import { getRoleName, hasRole } from '../utils/roles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = getAccessToken();
      if (!token || isTokenExpired(token)) {
        clearTokens();
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const me = await apiGetMe();
        setUser(me);
        saveUser(me);
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = (accessToken, refreshToken, userData) => {
    saveTokens(accessToken, refreshToken);
    saveUser(userData);
    setUser(userData);
  };

  const refreshProfile = async () => {
    const me = await apiGetMe();
    saveUser(me);
    setUser(me);
    return me;
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const roleName = getRoleName(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshProfile,
        roleName,
        hasRole: (roles) => hasRole(user, roles),
        isAdmin: () => hasRole(user, 'admin'),
        isTeacher: () => hasRole(user, 'teacher'),
        isStaff: () => hasRole(user, 'staff'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
