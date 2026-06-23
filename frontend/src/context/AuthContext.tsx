'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface UserSession {
  userId: string;
  email: string;
  accessToken: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loginGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Configure Axios default base URL and credentials
  axios.defaults.baseURL = '';
  axios.defaults.withCredentials = true;

  const loginGuest = async () => {
    try {
      // Generate a unique anonymous guest email and password
      const randId = Math.random().toString(36).substring(2, 7) + Date.now().toString(36).substring(3, 7);
      const guestEmail = `guest_${randId}@careerpilot.ai`;
      const guestPassword = `GuestPass_${randId}!`;
      
      const response = await axios.post('/api/auth/register', { 
        email: guestEmail, 
        password: guestPassword 
      });
      const sessionData: UserSession = {
        ...response.data,
        isGuest: true
      };
      
      setUser(sessionData);
      localStorage.setItem('cp_session', JSON.stringify(sessionData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${sessionData.accessToken}`;
    } catch (error) {
      console.error('Anonymous guest registration failed:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('cp_session');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser) as UserSession;
            setUser(parsed);
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.accessToken}`;
            setLoading(false);
            return;
          } catch (e) {
            localStorage.removeItem('cp_session');
          }
        }
        
        // Auto-create guest session if none exists
        await loginGuest();
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const sessionData: UserSession = {
        ...response.data,
        isGuest: false
      };
      
      setUser(sessionData);
      localStorage.setItem('cp_session', JSON.stringify(sessionData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${sessionData.accessToken}`;
      
      router.push('/dashboard');
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', { email, password });
      const sessionData: UserSession = {
        ...response.data,
        isGuest: false
      };
      
      setUser(sessionData);
      localStorage.setItem('cp_session', JSON.stringify(sessionData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${sessionData.accessToken}`;
      
      router.push('/dashboard');
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.message || 'Registration failed. Email might be in use.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem('cp_session');
    delete axios.defaults.headers.common['Authorization'];
    
    // Auto login as a new guest on logout
    await loginGuest();
    setLoading(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !user.isGuest,
        loginGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
