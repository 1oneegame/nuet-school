import { useState, useEffect } from 'react';
import { authManager } from '../utils/authManager';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

interface UseUserRoleReturn {
  user: User | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  canEdit: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
}

export const useUserRole = (): UseUserRoleReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = authManager.getUser();
        if (currentUser && authManager.isAuthenticated()) {
          setUser(currentUser);
        } else {
          const isAuth = await authManager.checkAuthStatus();
          if (isAuth) {
            setUser(authManager.getUser());
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const canEdit = isAdmin || isTeacher;

  return {
    user,
    isAdmin,
    isTeacher,
    isStudent,
    canEdit,
    loading,
    setUser
  };
};

export default useUserRole;