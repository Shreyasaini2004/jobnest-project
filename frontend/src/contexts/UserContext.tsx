// src/contexts/UserContext.tsx
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  userType: "job-seeker" | "employer";
  createdAt?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  experience?: string;
  education?: string;
  skills?: string;
  bio?: string;
  avatar?: string;
  embedding?: number[];
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUserState(JSON.parse(storedUser));
  }, []);

  const setUser = (user: User) => {
    setUserState(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
export { UserContext };
export default UserContext;
