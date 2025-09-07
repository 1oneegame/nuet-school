import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authManager } from '../utils/authManager';

interface User {
  userId: string;
  email: string;
  role: string;
  hasStudentAccess: boolean;
}

interface UseAdminAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const user = authManager.getUser();
      const isAuth = authManager.isAuthenticated();

      if (!isAuth || !user) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (user.role !== 'admin') {
        setIsAuthenticated(false);
        setUser(null);
        authManager.logout();
        setIsLoading(false);
        return;
      }

      const isValidAuth = await authManager.checkAuthStatus();
      if (isValidAuth) {
        setIsAuthenticated(true);
        setUser(user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        authManager.logout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
      authManager.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    checkAuth();
  };

  const logout = () => {
    authManager.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/auth');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };
};

export default useAdminAuth;