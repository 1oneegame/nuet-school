import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const ServerErrorPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Ошибка сервера | НУЕТ Подготовка</title>
        <meta name="description" content="Внутренняя ошибка сервера" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-16">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-extrabold text-red-600">500</h1>
            <div className="bg-red-600 p-2 w-10 h-10 ring-1 ring-red-600 shadow-lg rounded-full flex items-center justify-center mx-auto mt-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Упс! Что-то пошло не так
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            Произошла внутренняя ошибка сервера. Наша команда уже работает над её устранением.
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
            <Link href="/" className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              Вернуться на главную
            </Link>
            
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Обновить страницу
            </button>
          </div>
          
          <div className="mt-12">
            <p className="text-gray-500">
              Проблема не решается? <Link href="/contact" className="text-blue-600 hover:underline">Сообщите нам об ошибке</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServerErrorPage;