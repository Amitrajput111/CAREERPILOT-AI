'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';

export interface UserSession {
  userId: string;
  email: string;
  accessToken: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === 'undefined') { setLoading(false); return; }

      const saved = localStorage.getItem('cp_session');
      if (!saved) { setLoading(false); return; }

      try {
        const parsed = JSON.parse(saved) as UserSession;
        setUser(parsed);

        // Silently refresh token in background
        try {
          const res = await api.post('/api/auth/refresh');
          const refreshed: UserSession = { ...parsed, accessToken: res.data.accessToken };
          setUser(refreshed);
          localStorage.setItem('cp_session', JSON.stringify(refreshed));
        } catch {
          // Refresh failed — session is expired, clear it
          setUser(null);
          localStorage.removeItem('cp_session');
        }
      } catch {
        localStorage.removeItem('cp_session');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const session: UserSession = res.data;
    setUser(session);
    localStorage.setItem('cp_session', JSON.stringify(session));
    router.push('/dashboard');
  };

  const register = async (email: string, password: string) => {
    const res = await api.post('/api/auth/register', { email, password });
    const session: UserSession = res.data;
    setUser(session);
    localStorage.setItem('cp_session', JSON.stringify(session));
    // New users go to onboarding
    router.push('/onboarding');
  };

  const logout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    setUser(null);
    localStorage.removeItem('cp_session');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
