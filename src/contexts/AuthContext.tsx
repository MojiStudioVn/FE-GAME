import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logger } from '../utils/logger';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  coins: number;
  level: number;
  experience: number;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  // Fetch user profile. Prefer cookie-based check, fall back to stored token.
  const refreshUser = async () => {
    setLoading(true);

    try {
      // First, try cookie-based check (server returns user when cookie sent)
      try {
        const checkRes = await fetch(`${API_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
        });

        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData && checkData.success && checkData.data && checkData.data.user) {
            setUser(checkData.data.user);
            if (checkData.data.token) {
              setToken(checkData.data.token);
              localStorage.setItem('token', checkData.data.token);
            }
            logger.info('User refreshed via cookie');
            return;
          }
        }
      } catch (err) {
        // non-fatal, we'll fallback to token-based
        logger.info('Auth check via cookie failed, falling back to token', { error: String(err) });
      }

      // Fallback: use token from localStorage (header-based)
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setToken(storedToken);
        logger.info('User refreshed via token');
      } else {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        } else {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      }
    } catch (error) {
      logger.error('Error fetching user', error);
      console.error('Error fetching user:', error);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    setUser(data.data.user);
    setToken(data.data.token);
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  };

  // Register
  const register = async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Registration failed');
    }

    setUser(data.data.user);
    setToken(data.data.token);
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  };

  // Logout
  const logout = () => {
    // Call server to clear cookie/session then clear local state
    try {
      fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    } finally {
      logger.info('User logged out');
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  // Update profile
  const updateProfile = async (data: Partial<User>) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Update failed');
    }

    setUser(result.data);
    localStorage.setItem('user', JSON.stringify(result.data));
    logger.info('Profile updated successfully');
  };

  // Load user on mount
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
