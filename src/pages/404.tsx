import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Страница не найдена | НУЕТ Подготовка</title>
        <meta name="description" content="Страница не найдена" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-16">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
            <div className="animate-bounce bg-blue-600 p-2 w-10 h-10 ring-1 ring-blue-600 shadow-lg rounded-full flex items-center justify-center mx-auto mt-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Упс! Страница не найдена
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            Страница, которую вы ищете, не существует или была перемещена.
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
            <Link href="/" className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              Вернуться на главную
            </Link>
            
            <Link href="/student/video-course" className="px-8 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200">
              Перейти к курсам
            </Link>
          </div>
          
          <div className="mt-12">
            <p className="text-gray-500">
              Нужна помощь? <Link href="/auth" className="text-blue-600 hover:underline">Войти в систему</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;