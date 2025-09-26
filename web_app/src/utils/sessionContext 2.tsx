import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  username: string;
  accountType: 'admin' | 'user';
  loginTime: number;
}

interface SessionContextType {
  user: User | null;
  login: (username: string, accountType: 'admin' | 'user') => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

const API_BASE_URL = 'http://localhost:3001';

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load session from sessionStorage on app start (unique per tab)
  useEffect(() => {
    const savedSession = sessionStorage.getItem('samh_session');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        setUser(parsedSession);
      } catch (error) {
        console.warn('Failed to parse saved session:', error);
        sessionStorage.removeItem('samh_session');
      }
    }
  }, []);

  const login = async (username: string, accountType: 'admin' | 'user') => {
    try {
      // Save login to database
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, accountType })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save login to database');
      }
      
      const loginData = await response.json();
      console.log('✅ Login saved to database:', loginData);
      
      const newUser: User = {
        username,
        accountType,
        loginTime: Date.now(),
      };
      
      setUser(newUser);
      sessionStorage.setItem('samh_session', JSON.stringify(newUser));
      
      console.log(`✅ User logged in: ${username} (${accountType}) - Tab Session & Database`);
    } catch (error) {
      console.error('❌ Failed to save login to database:', error);
      
      // Still allow login even if database save fails
      const newUser: User = {
        username,
        accountType,
        loginTime: Date.now(),
      };
      
      setUser(newUser);
      sessionStorage.setItem('samh_session', JSON.stringify(newUser));
      
      console.log(`✅ User logged in: ${username} (${accountType}) - Tab Session Only (DB failed)`);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('samh_session');
    console.log('✅ User logged out - Tab Session');
  };

  const value: SessionContextType = {
    user,
    login,
    logout,
    isLoggedIn: user !== null,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
