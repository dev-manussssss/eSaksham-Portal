import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES, DEFAULT_PROFILES, getRoleLandingRoute } from './roles.js';

export { ROLES, DEFAULT_PROFILES, getRoleLandingRoute };

const AuthContext = createContext(null);

const SESSION_KEY = 'saksham_auth_session';
const TOKEN_KEY = 'saksham_auth_token';

const PRE_AUTH_ROLE_EMAILS = {
  [ROLES.DISTRICT_AUTHORITY]: 'da.bhopal@saksham.gov.in',
  [ROLES.IMPLEMENTING_AGENCY]: 'ia.pwd.bhopal@saksham.gov.in',
  [ROLES.MP]: 'mp.bhopal@saksham.gov.in',
  [ROLES.VENDOR]: 'contact@aaryainfra.test',
  [ROLES.STATE_NODAL_AUTHORITY]: 'sna.mp@saksham.gov.in',
  [ROLES.CENTRAL_NODAL_AGENCY]: 'cna.mospi@saksham.gov.in',
  [ROLES.INVESTIGATOR]: 'vigilance.central@saksham.gov.in',
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && !parsed.landingRoute) {
          parsed.landingRoute = getRoleLandingRoute(parsed.role);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached session:', e);
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Authenticate using official email and password credentials
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      const enrichedUser = {
        ...data.user,
        landingRoute: data.user.landingRoute || getRoleLandingRoute(data.user.role),
      };

      setToken(data.token);
      setSession(enrichedUser);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(enrichedUser));

      return { success: true, user: enrichedUser };
    } finally {
      setLoading(false);
    }
  };

  // One-click switch to an authorized role for testing / emergency administrative bypass
  const switchRole = async (targetRole) => {
    const email = PRE_AUTH_ROLE_EMAILS[targetRole];
    if (!email) {
      throw new Error(`No default account registered for role: ${targetRole}`);
    }
    return await login(email, 'Demopass@2026');
  };

  const logout = () => {
    setSession(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        token,
        loading,
        login,
        logout,
        switchRole,
        roles: ROLES,
        ROLES,
        getRoleLandingRoute,
        isAuthenticated: !!session,
        role: session?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
