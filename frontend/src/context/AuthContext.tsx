'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface UserSession {
  userId: string;
  email: string;
  accessToken: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Configure Axios default base URL and credentials
  axios.defaults.baseURL = '';
  axios.defaults.withCredentials = true;

  useEffect(() => {
    // Read session on mount
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('cp_session');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as UserSession;
          setUser(parsed);
          // Set authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.accessToken}`;
        } catch (e) {
          localStorage.removeItem('cp_session');
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const sessionData: UserSession = response.data;
      
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
      const sessionData: UserSession = response.data;
      
      setUser(sessionData);
      localStorage.setItem('cp_session', JSON.stringify(sessionData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${sessionData.accessToken}`;
      
      router.push('/career-center');
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.message || 'Registration failed. Email might be in use.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem('cp_session');
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
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
