import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import jwt from 'jsonwebtoken';

const Dashboard: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Очищаем токен из localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Очищаем токен из cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Перенаправляем на страницу входа
    router.push('/auth');
  };

  const menuItems = [
    {
      title: 'НУЕТ Видеокурс',
      description: 'Полный курс подготовки к НУЕТ с видеолекциями',
      href: '/student/video-course',
      icon: '🎥',
      color: 'bg-blue-500'
    },
    {
      title: 'NUET Practice',
      description: 'Практические задания и тесты для подготовки',
      href: '/student/practice',
      icon: '📝',
      color: 'bg-green-500'
    },
    {
      title: 'Critical Thinking Training',
      description: 'Развитие критического мышления',
      href: '/student/critical-thinking',
      icon: '🧠',
      color: 'bg-purple-500'
    },
    {
      title: 'Other Studying Materials',
      description: 'Дополнительные материалы для изучения',
      href: '/student/materials',
      icon: '📚',
      color: 'bg-orange-500'
    }
  ];

  return (
    <>
      <Head>
        <title>Студенческий дашборд | 240 School</title>
        <meta name="description" content="Личный кабинет студента 240 School" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">240 School</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Добро пожаловать!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Студенческий дашборд</h2>
              <p className="text-gray-600">Выберите раздел для изучения</p>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {menuItems.map((item, index) => (
                <Link key={index} href={item.href}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden">
                    <div className={`${item.color} h-2`}></div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <span className="text-3xl mr-4">{item.icon}</span>
                        <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      <div className="flex justify-end">
                        <span className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                          Перейти →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Stats Section */}
            <div className="mt-12 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ваш прогресс</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0%</div>
                  <div className="text-sm text-gray-600">Видеокурс</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0%</div>
                  <div className="text-sm text-gray-600">Практика</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0%</div>
                  <div className="text-sm text-gray-600">Критическое мышление</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">0</div>
                  <div className="text-sm text-gray-600">Материалы изучено</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const token = req.cookies.token;

  if (!token) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Проверяем, что у пользователя есть доступ к студенческому дашборду
    if (!decoded.hasStudentAccess) {
      return {
        redirect: {
          destination: '/access-denied',
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }
};

export default Dashboard;