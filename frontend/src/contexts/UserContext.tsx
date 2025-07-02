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
    // Load user from localStorage if available
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const setUser = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUserState(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
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
