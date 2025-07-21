import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Local user type without database dependencies
interface LocalUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  avatar?: string | null;
  dateOfBirth?: string;
  occupation?: string;
  company?: string;
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  language: string;
  publicProfile: boolean;
}

interface UpdateUserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  avatar?: string | null;
  dateOfBirth?: string;
  occupation?: string;
  company?: string;
  theme?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  weeklyDigest?: boolean;
  language?: string;
  publicProfile?: boolean;
}

interface UserContextType {
  user: LocalUser | null;
  updateProfile: (profileData: UpdateUserProfile) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

// Default user profile
const defaultUser: LocalUser = {
  id: 1,
  username: 'sharathbandaari',
  firstName: 'Sharath',
  lastName: 'Bandaari',
  email: 'sharath.bandaari@email.com',
  phone: '+1 (555) 123-4567',
  bio: 'AI enthusiast and lifelong learner passionate about technology and education.',
  location: 'San Francisco, CA',
  timezone: 'America/Los_Angeles',
  avatar: null,
  dateOfBirth: '1995-06-15',
  occupation: 'Software Engineer',
  company: 'Tech Innovations Inc.',
  theme: 'dark',
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false,
  weeklyDigest: true,
  language: 'en',
  publicProfile: false,
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage or use default
  useEffect(() => {
    const checkAuth = () => {
      const authState = localStorage.getItem('coexist-auth-state');
      const isAuthenticated = authState === 'authenticated';
      
      if (isAuthenticated) {
        try {
          const savedUser = localStorage.getItem('coexist-user-profile');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            // If authenticated but no user profile, wait for login/signup to create one
            setUser(null);
          }
        } catch (err) {
          console.error('Failed to load user profile from localStorage:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth state changes via custom event
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const updateProfile = async (profileData: UpdateUserProfile) => {
    try {
      if (!user) return;
      
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('coexist-user-profile', JSON.stringify(updatedUser));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      updateProfile,
      isLoading,
      error,
    }}>
      {children}
    </UserContext.Provider>
  );
};