import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { userApi } from '@/lib/userApi';
import { User } from '@/types/user';
import axios from '@/lib/axios';

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser || savedUser === 'undefined') return null;
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      localStorage.removeItem('user'); // Optional: cleanup
      return null;
    }
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  

  const setUser = (userData: User) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setUserState(userData);
    } catch (error) {
      console.error("Failed to save user to localStorage:", error);
    }
  };

  const logout = async () => {
    try {
      // Call the appropriate logout endpoint based on user type
      if (user?.userType === 'employer') {
        await axios.post('/api/auth/employer/logout');
      } else if (user?.userType === 'job-seeker') {
        await axios.post('/api/auth/jobseeker/logout');
      }
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Failed to logout:", error);
    }
    setUserState(null);
  };

  // Function to refresh user data from the backend
  const refreshUserData = async (): Promise<void> => {
    if (!user || !user._id || !user.userType) return;
    
    setIsLoading(true);
    try {
      const userData = await userApi.getCurrentUser(user._id, user.userType);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data when component mounts if user exists
  useEffect(() => {
    if (user && user._id) {
      refreshUserData();
    }
  }, [user?._id]);

  return (
    <UserContext.Provider value={{ user, setUser, logout, refreshUserData, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function logout() {
  // Use the context if available
  try {
    const context = useContext(UserContext);
    if (context && typeof context.logout === 'function') {
      context.logout();
    } else {
      // Fallback: clear user from localStorage
      localStorage.removeItem('user');
    }
  } catch {
    // Fallback: clear user from localStorage
    localStorage.removeItem('user');
  }
}
