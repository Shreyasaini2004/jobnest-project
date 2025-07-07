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


// src/contexts/UserContext.tsx (UPDATED)
// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// // Define the shape of your user object. Add any other fields you need.
// interface User {
//   _id: string;
//   email: string;
//   role: 'employer' | 'jobseeker';
//   companyName?: string;
//   firstName?: string;
// }

// // Define the context type
// interface UserContextType {
//   user: User | null;
//   token: string | null;
//   setUser: (user: User | null) => void; // Kept for compatibility if needed elsewhere
//   login: (userData: User, token: string) => void;
//   logout: () => void;
//   isLoading: boolean;
// }

// // Create the context
// const UserContext = createContext<UserContextType | undefined>(undefined);

// // Create the provider component
// export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUserState] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // On initial app load, check localStorage for existing session
//   useEffect(() => {
//     try {
//       const storedToken = localStorage.getItem('token');
//       const storedUser = localStorage.getItem('user');

//       if (storedToken && storedUser) {
//         setToken(storedToken);
//         setUserState(JSON.parse(storedUser));
//       }
//     } catch (error) {
//       console.error("Failed to initialize user state from localStorage", error);
//     } finally {
//       setIsLoading(false); // We are done loading
//     }
//   }, []);

//   // Login function
//   const login = (userData: User, authToken: string) => {
//     setUserState(userData);
//     setToken(authToken);
//     localStorage.setItem('user', JSON.stringify(userData));
//     localStorage.setItem('token', authToken);
//   };

//   // Logout function
//   const logout = () => {
//     setUserState(null);
//     setToken(null);
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     // For a clean logout, redirect to the login page
//     window.location.href = '/login'; 
//   };
  
//   // Backward compatibility for existing setUser calls
//   const setUser = (user: User | null) => {
//     setUserState(user);
//     if(user) {
//         localStorage.setItem('user', JSON.stringify(user));
//     } else {
//         localStorage.removeItem('user');
//     }
//   }

//   const contextValue = { user, token, setUser, login, logout, isLoading };

//   return (
//     <UserContext.Provider value={contextValue}>
//       {!isLoading && children}
//     </UserContext.Provider>
//   );
// };

// // Custom hook for easy access
// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error('useUser must be used within a UserProvider');
//   }
//   return context;
// };
