import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const DEMO_USERS: { email: string; password: string; user: User }[] = [
  {
    email: 'admin@upr360.uz',
    password: 'admin123',
    user: {
      id: 'admin-1',
      email: 'admin@upr360.uz',
      name: 'Administrator',
      role: 'admin',
    },
  },
  {
    email: 'manager1@upr360.uz',
    password: 'manager123',
    user: {
      id: 'manager-1',
      email: 'manager1@upr360.uz',
      name: 'Toshkent filiali boshqaruvchisi',
      role: 'manager',
      branchId: 'branch-1',
    },
  },
  {
    email: 'manager2@upr360.uz',
    password: 'manager123',
    user: {
      id: 'manager-2',
      email: 'manager2@upr360.uz',
      name: 'Samarqand filiali boshqaruvchisi',
      role: 'manager',
      branchId: 'branch-2',
    },
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('upr360_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const foundUser = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      setUser(foundUser.user);
      localStorage.setItem('upr360_user', JSON.stringify(foundUser.user));
      return { success: true };
    }

    return { success: false, error: "Noto'g'ri email yoki parol" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('upr360_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
