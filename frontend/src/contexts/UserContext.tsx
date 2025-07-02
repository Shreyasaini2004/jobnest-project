import { createContext, useContext, ReactNode, useState } from 'react';

interface User {
  name: string;
  email: string;
  userType: 'job-seeker' | 'employer';
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
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
  

  const setUser = (userData: User) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setUserState(userData);
    } catch (error) {
      console.error("Failed to save user to localStorage:", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Failed to remove user from localStorage:", error);
    }
    setUserState(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
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
