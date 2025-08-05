import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/book';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: 'admin' | 'seller') => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultAdmin: User = {
  id: 'admin-1',
  name: 'Administrador',
  email: 'admin@livraria.com',
  role: 'admin',
  createdAt: new Date()
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useLocalStorage<User[]>('bookstore-users', [defaultAdmin]);
  const [passwords, setPasswords] = useLocalStorage<Record<string, string>>('bookstore-passwords', {
    'admin@livraria.com': 'admin123'
  });
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('bookstore-current-user', null);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email === email);
    const storedPassword = passwords[email];
    
    if (user && storedPassword === password) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, role: 'admin' | 'seller' = 'seller'): Promise<boolean> => {
    if (users.find(u => u.email === email)) {
      return false; // User already exists
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      createdAt: new Date()
    };

    setUsers([...users, newUser]);
    setPasswords({ ...passwords, [email]: password });
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      users,
      login,
      register,
      logout,
      isAdmin
    }}>
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