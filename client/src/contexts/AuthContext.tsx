import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
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

  // Check localStorage for auth state on mount
  useEffect(() => {
    const authState = localStorage.getItem('coexist-auth-state');
    if (authState === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('coexist-auth-state', 'authenticated');
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('auth-change', { detail: { isAuthenticated: true } }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('coexist-auth-state');
    localStorage.removeItem('coexist-user-profile');
    // Clear any other user-related data
    localStorage.removeItem('smart-calendar-events');
    localStorage.removeItem('smart-calendar-tasks');
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('auth-change', { detail: { isAuthenticated: false } }));
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};