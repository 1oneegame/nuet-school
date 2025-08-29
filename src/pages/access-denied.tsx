import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const AccessDeniedPage: React.FC = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Получаем информацию о пользователе из localStorage или токена
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(payload.email || '');
      } catch (error) {
        console.error('Ошибка декодирования токена:', error);
      }
    }
  }, []);

  const handleBackToLogin = () => {
    // Очищаем токен и перенаправляем на страницу входа
    localStorage.removeItem('token');
    router.push('/auth');
  };

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText('87058445248');
    alert('Номер телефона скопирован в буфер обмена');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Основная карточка */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Иконка блокировки */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ ограничен
          </h1>

          {/* Информация о пользователе */}
          {userEmail && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-600">
                Аккаунт: <span className="font-medium text-gray-900">{userEmail}</span>
              </p>
            </div>
          )}

          {/* Основное сообщение */}
          <div className="mb-8">
            <p className="text-gray-700 mb-4 leading-relaxed">
              У вас нет доступа к студенческому дашборду. 
              Для получения доступа к курсу обратитесь к системному администратору.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium mb-2">
                Для оплаты курса свяжитесь по номеру:
              </p>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-bold text-blue-900">87058445248</span>
                <button
                  onClick={copyPhoneNumber}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Скопировать номер"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <p className="text-sm text-yellow-800 font-medium mb-1">
                  Что делать дальше:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Свяжитесь с администратором по указанному номеру</li>
                  <li>• Произведите оплату курса</li>
                  <li>• Дождитесь активации доступа</li>
                  <li>• Войдите в систему повторно</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="space-y-3">
            <button
              onClick={handleBackToLogin}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Вернуться к входу
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Обновить страницу
            </button>
          </div>
        </div>

        {/* Дополнительная информация внизу */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Возникли вопросы? Обратитесь в службу поддержки
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;