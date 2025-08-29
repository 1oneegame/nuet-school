import { useState, useEffect } from 'react';

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
        // Сначала проверяем localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }

        // Затем проверяем сессию через API
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData.user) {
            setUser(sessionData.user);
            localStorage.setItem('user', JSON.stringify(sessionData.user));
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