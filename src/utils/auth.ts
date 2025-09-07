import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Хук для проверки аутентификации
export const useAuth = (requireAuth = true, requireAdmin = false) => {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Если требуется аутентификация и пользователь не авторизован
      if (requireAuth && !session) {
        router.push(`/auth?returnUrl=${encodeURIComponent(router.asPath)}`);
      }
      // Если требуются права администратора и пользователь не админ
      else if (
        requireAdmin &&
        (!session || !session.user || session.user.role !== 'admin')
      ) {
        router.push('/');
      }
    }
  }, [loading, session, requireAuth, requireAdmin, router]);

  return {
    session,
    loading,
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === 'admin',
  };
};

// Функция для входа
export const login = async (email: string, password: string) => {
  try {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    return { success: !result?.error, error: result?.error };
  } catch (error) {
    return { success: false, error: 'Произошла ошибка при входе' };
  }
};

// Функция для выхода
export const logout = async () => {
  await signOut({ redirect: false });
};

// Проверка прав доступа
export const checkPermission = (
  session: any,
  requiredRole: 'user' | 'admin' = 'user'
) => {
  if (!session) return false;
  if (requiredRole === 'admin') return session.user.role === 'admin';
  return true;
};
