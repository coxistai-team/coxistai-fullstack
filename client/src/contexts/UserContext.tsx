import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (profileData: UpdateUserProfile) => {
    // Optionally, you can call an API to update the profile and then refresh auth
    setError(null);
    // This is a placeholder; actual update logic should be in AuthContext or a backend call
    // For now, just throw if not implemented
    throw new Error('updateProfile should be implemented in AuthContext or via API');
  };

  return (
    <UserContext.Provider value={{
      user: user as LocalUser | null,
      updateProfile,
      isLoading: false,
      error,
    }}>
      {children}
    </UserContext.Provider>
  );
};