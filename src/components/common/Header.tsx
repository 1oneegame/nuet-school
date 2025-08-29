import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';

interface HeaderProps {
  brandName?: string;
  isLoggedIn?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  brandName = 'НУЕТ Подготовка', 
  isLoggedIn = false 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Очищаем токен из localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Очищаем токен из cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Перенаправляем на страницу входа
    router.push('/auth');
    setIsMenuOpen(false);
  };

  // Only show currently available pages to avoid 404 errors
  const navigation = [
    { name: 'Главная', href: '/' },
    { name: 'Дашборд', href: '/dashboard' },
    { name: 'Видеокурс', href: '/student/video-course' },
    { name: 'Тесты и практика', href: '/student/practice' },
    { name: 'Critical Thinking', href: '/student/critical-thinking' },
    { name: 'Материалы', href: '/student/materials' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center py-4">
          {/* Логотип */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            {brandName}
          </Link>

          {/* Десктопное меню */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base font-medium transition-colors ${
                  router.pathname === item.href
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Кнопки авторизации/профиля */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile" 
                  className="flex items-center text-gray-700 hover:text-blue-600"
                >
                  <FaUser className="mr-2" />
                  <span>Профиль</span>
                </Link>
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={handleLogout}
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/auth" 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Войти
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          {/* Мобильная кнопка меню */}
          <button 
            className="md:hidden text-gray-700 focus:outline-none" 
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-base font-medium transition-colors ${
                    router.pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Мобильные кнопки авторизации */}
              <div className="pt-4 border-t border-gray-200">
                {isLoggedIn ? (
                  <>
                    <Link 
                      href="/profile" 
                      className="flex items-center text-gray-700 hover:text-blue-600 mb-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUser className="mr-2" />
                      <span>Профиль</span>
                    </Link>
                    <button 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={handleLogout}
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/auth" 
                      className="block w-full px-4 py-2 mb-2 border border-gray-300 rounded-md text-center text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Войти
                    </Link>
                    <Link 
                      href="/auth/register" 
                      className="block w-full px-4 py-2 bg-blue-600 rounded-md text-center text-white hover:bg-blue-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Регистрация
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;