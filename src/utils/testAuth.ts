import { authManager } from './authManager';

export const testAuthentication = () => {
  console.log('🔍 Тестируование аутентификации...');
  
  const token = authManager.getToken();
  const user = authManager.getUser();
  const isAuth = authManager.isAuthenticated();
  
  console.log('📝 Состояние аутентификации:');
  console.log('Token:', token ? 'Присутствует' : 'Отсутствует');
  console.log('User:', user ? user.email : 'Не найден');
  console.log('Is Authenticated:', isAuth);
  
  if (token && typeof window !== 'undefined') {
    const localStorage_token = localStorage.getItem('token');
    const localStorage_user = localStorage.getItem('user');
    
    console.log('💾 LocalStorage:');
    console.log('Token в localStorage:', localStorage_token ? 'Да' : 'Нет');
    console.log('User в localStorage:', localStorage_user ? 'Да' : 'Нет');
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    
    console.log('🍪 Cookies:');
    console.log('Token cookie:', tokenCookie ? 'Присутствует' : 'Отсутствует');
  }
  
  return {
    hasToken: !!token,
    hasUser: !!user,
    isAuthenticated: isAuth,
    userRole: user?.role
  };
};

if (typeof window !== 'undefined') {
  (window as any).testAuth = testAuthentication;
}
