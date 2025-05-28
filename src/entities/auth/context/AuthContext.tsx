import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../../shared/types';
import { TokenService, UserService, isAuthenticated, ApiClient } from '../../../shared/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loggingOut: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(UserService.getUser());
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    const isAuth = isAuthenticated();
    const currentUser = UserService.getUser();
    
    if (!isAuth) {
      setUser(null);
      UserService.clearUser();
      TokenService.clearTokens();
      setLoading(false);
      return;
    }
    
    try {
      await ApiClient.checkAndRefreshToken();
    } catch (e) {
      console.error('Ошибка при проверке токена в AuthContext:', e);
    }
    
    if (currentUser && (!user || user.id !== currentUser.id)) {
      setUser(currentUser);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'refresh_token' || e.key === 'user') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const handleCustomEvent = () => {
      checkAuth();
    };
    
    window.addEventListener('auth-changed', handleCustomEvent);
    
    const intervalId = setInterval(() => {
      checkAuth();
    }, 60000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleCustomEvent);
      clearInterval(intervalId);
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    UserService.setUser(userData);
    
    window.dispatchEvent(new Event('auth-changed'));
  };

  const logout = () => {
    setLoggingOut(true);
    
    setTimeout(() => {
      setUser(null);
      UserService.clearUser();
      TokenService.clearTokens();
      setLoggingOut(false);
      
      window.dispatchEvent(new Event('auth-changed'));
    }, 300);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    loggingOut,
    error,
    login,
    logout,
    setError,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 