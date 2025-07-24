import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import PageLoader from "@/components/ui/page-loader";

interface User {
  id: number;
  username: string;
  email?: string;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  // Check auth on mount
  useEffect(() => {
    const check = async () => {
      setIsAuthLoading(true);
      await checkAuth();
      setIsAuthLoading(false);
    };
    check();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        await checkAuth();
        return true;
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (err) {
      setError('Login failed');
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        await checkAuth();
        return true;
      } else {
        const data = await res.json();
        setError(data.error || 'Signup failed');
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (err) {
      setError('Signup failed');
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
      });
    } catch {}
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      error,
      login,
      signup,
      logout,
      checkAuth,
      isAuthLoading,
    }}>
      {isAuthLoading ? <PageLoader fullScreen={true} /> : children}
    </AuthContext.Provider>
  );
};

export const useAuthLoading = () => {
  const context = useContext(AuthContext);
  return context?.isAuthLoading ?? false;
};