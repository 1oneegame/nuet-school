import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authManager } from '../../utils/authManager';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallbackPath = '/auth'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        if (!requireAuth) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        const user = authManager.getUser();
        const isAuthenticated = authManager.isAuthenticated();

        if (!isAuthenticated || !user) {
          setIsAuthorized(false);
          setIsLoading(false);
          router.replace(fallbackPath);
          return;
        }

        if (requireAdmin && user.role !== 'admin') {
          setIsAuthorized(false);
          setIsLoading(false);
          router.replace('/access-denied');
          return;
        }

        const isValidAuth = await authManager.checkAuthStatus();
        if (!isValidAuth) {
          setIsAuthorized(false);
          setIsLoading(false);
          router.replace(fallbackPath);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Authorization check error:', error);
        setIsAuthorized(false);
        router.replace(fallbackPath);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [requireAuth, requireAdmin, fallbackPath, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default AuthWrapper;
