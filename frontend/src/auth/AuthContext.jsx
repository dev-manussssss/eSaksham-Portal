import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES, AGENCY_TYPES, DEFAULT_PROFILES } from './roles.js';

export { ROLES, AGENCY_TYPES, DEFAULT_PROFILES };

const AuthContext = createContext(null);

const STORAGE_KEY = 'saksham_auth_session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role && DEFAULT_PROFILES[parsed.role]) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved auth session:', e);
    }
    return DEFAULT_PROFILES[ROLES.IMPLEMENTING_AGENCY];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to persist auth session:', e);
    }
  }, [session]);

  const login = (profile) => {
    setSession(profile);
  };

  const logout = () => {
    setSession(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
  };

  const switchRole = (roleKey, customOverrides = {}) => {
    const base = DEFAULT_PROFILES[roleKey] || DEFAULT_PROFILES[ROLES.IMPLEMENTING_AGENCY];
    const newSession = { ...base, ...customOverrides };
    setSession(newSession);
    return newSession.landingRoute;
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, switchRole, roles: ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
