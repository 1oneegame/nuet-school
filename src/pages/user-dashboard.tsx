import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import jwt from 'jsonwebtoken';

const UserDashboard: React.FC = () => {
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

  return (
    <>
      <Head>
        <title>Пользовательская панель - NUET Platform</title>
        <meta name="description" content="Добро пожаловать в пользовательскую панель NUET Platform" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">NUET Platform</h1>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
              💎 ПРЕМИУМ ПЛАТФОРМА
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Добро пожаловать в NUET Platform!
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ваш аккаунт успешно создан в нашей <span className="font-semibold text-purple-600">платной образовательной платформе</span>. 
              Для получения доступа к премиум учебным материалам обратитесь к администратору.
            </p>
          </div>

          {/* Status Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center">
                <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  🔐 Ожидание активации премиум доступа
                </h3>
                <p className="text-purple-100">
                  Ваш аккаунт зарегистрирован в платной образовательной системе
                </p>
              </div>

              <div className="p-8">
                {/* Payment Info Banner */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-yellow-800">💰 ПЛАТНАЯ ПЛАТФОРМА</h4>
                      <p className="text-yellow-700">Доступ к материалам предоставляется после оплаты и активации администратором</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-bold text-blue-900 mb-4 text-lg flex items-center">
                      📋 Как получить доступ:
                    </h4>
                    <ol className="text-blue-800 space-y-3">
                      <li className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                        <span>Свяжитесь с администратором по указанному телефону</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                        <span>Предоставьте ваш email для идентификации</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                        <span>Произведите оплату за доступ к платформе</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                        <span>Дождитесь активации и войдите повторно</span>
                      </li>
                    </ol>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                    <h4 className="font-bold text-green-900 mb-4 text-lg flex items-center">
                      📞 Контакт администратора:
                    </h4>
                    <div className="text-center">
                      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-300">
                        <div className="text-3xl mb-2">📱</div>
                        <div className="text-2xl font-bold text-green-800 mb-3">
                          87058445248
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('87058445248');
                            alert('Номер телефона скопирован в буфер обмена!');
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          📋 Копировать номер
                        </button>
                        <p className="text-sm text-green-600 mt-3">
                          Нажмите, чтобы скопировать номер
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-purple-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h5 className="text-lg font-semibold text-gray-900 mb-2">
                🚀 После активации доступа:
              </h5>
              <p className="text-gray-600 mb-4">
                Вы получите полный доступ ко всем премиум функциям образовательной платформы
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">📚 Учебные материалы</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">🎯 Тесты и задания</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">📊 Отслеживание прогресса</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">🏆 Сертификаты</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

// Server-side проверка аутентификации
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
    
    // Если у пользователя есть доступ к студенческому дашборду, перенаправляем туда
    if (decoded.hasStudentAccess) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }

    // Если это админ, перенаправляем в админ-панель
    if (decoded.role === 'admin' || decoded.role === 'Admin') {
      return {
        redirect: {
          destination: '/admin',
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

export default UserDashboard;