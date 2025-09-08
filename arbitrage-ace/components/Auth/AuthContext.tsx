import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  settings: any;
  hasEbayKeys: boolean;
  hasAmazonKeys: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, just simulate loading and then show no user (guest mode)
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Set a mock user for testing
      setUser({
        id: 'guest',
        email: 'guest@example.com',
        settings: {
          minProfit: 10,
          minRoi: 25,
          keywords: ['electronics', 'books', 'toys'],
          notifications: true
        },
        hasEbayKeys: false,
        hasAmazonKeys: false
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login for testing
    setUser({
      id: '1',
      email: email,
      settings: {
        minProfit: 10,
        minRoi: 25,
        keywords: ['electronics', 'books', 'toys'],
        notifications: true
      },
      hasEbayKeys: false,
      hasAmazonKeys: false
    });
  };

  const register = async (email: string, password: string) => {
    // Mock register for testing
    setUser({
      id: '1',
      email: email,
      settings: {
        minProfit: 10,
        minRoi: 25,
        keywords: ['electronics', 'books', 'toys'],
        notifications: true
      },
      hasEbayKeys: false,
      hasAmazonKeys: false
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
