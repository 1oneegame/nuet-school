import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>240 School - Подготовка к НУЕТ</title>
        <meta name="description" content="Персональная подготовка к поступлению в медицинские университеты Украины" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Navigation */}
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎓</span>
                <span className="text-xl font-bold text-gray-800">240 School</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">О платформе</a>
                <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Возможности</a>
                <Link href="/auth" className="text-gray-600 hover:text-blue-600 transition-colors">Войти</Link>
                <Link href="/auth" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Регистрация</Link>
              </div>
              
              <div className="md:hidden">
                <button className="text-gray-600 hover:text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Подготовка к 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                НУЕТ
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Персональная подготовка к поступлению в медицинские университеты с видеокурсами, 
              тестами и аналитикой прогресса
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth" 
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Начать подготовку бесплатно
              </Link>
              <Link 
                href="/auth" 
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Войти в систему
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* About Platform */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">О платформе 240 School</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              240 School - это образовательная платформа для подготовки к поступлению в медицинские университеты Украины. 
              Мы предоставляем качественные материалы и инструменты для эффективной подготовки к НУЕТ.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Что доступно после входа в систему</h2>
            <p className="text-xl text-gray-600">Полный набор инструментов для подготовки к НУЕТ</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Видеокурс НУЕТ</h3>
              <p className="text-gray-600">Структурированные видеоуроки по всем темам НУЕТ</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">NUET Practice</h3>
              <p className="text-gray-600">Практические тесты в формате реального экзамена</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Critical Thinking Training</h3>
              <p className="text-gray-600">Тренировка критического мышления</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Other Studying Materials</h3>
              <p className="text-gray-600">Дополнительные материалы для изучения</p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Panel Preview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Административная панель</h2>
            <p className="text-xl text-gray-600">Полное управление образовательной платформой</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Всего студентов</p>
                  <p className="text-3xl font-bold text-indigo-600">1,247</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
              <div className="mt-4">
                <span className="text-green-500 text-sm font-medium">+12% за месяц</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Активных курсов</p>
                  <p className="text-3xl font-bold text-green-600">24</p>
                </div>
                <div className="text-4xl">📚</div>
              </div>
              <div className="mt-4">
                <span className="text-green-500 text-sm font-medium">+3 новых</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Завершенных уроков</p>
                  <p className="text-3xl font-bold text-blue-600">15,432</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
              <div className="mt-4">
                <span className="text-green-500 text-sm font-medium">+8% за неделю</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Средний балл НУЕТ</p>
                  <p className="text-3xl font-bold text-purple-600">187</p>
                </div>
                <div className="text-4xl">🎯</div>
              </div>
              <div className="mt-4">
                <span className="text-green-500 text-sm font-medium">+5 баллов</span>
              </div>
            </div>
          </div>

          {/* Admin Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
              <div className="text-3xl mb-4">🎥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Управление видеокурсами</h3>
              <p className="text-gray-600 mb-4">Загружайте, редактируйте и организуйте видеоуроки</p>
              <Link href="/admin" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Перейти к управлению
              </Link>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">NUET Practice</h3>
              <p className="text-gray-600 mb-4">Загружайте тесты, ответы и видеоразборы</p>
              <Link href="/admin" className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Управление тестами
              </Link>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Critical Thinking</h3>
              <p className="text-gray-600 mb-4">Создавайте и редактируйте задания на критическое мышление</p>
              <Link href="/admin" className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Создать задания
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Готов начать подготовку?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Присоединяйся к студентам, которые готовятся к поступлению в медицинские университеты
          </p>
          <Link 
            href="/auth" 
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Войти в систему
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">🎓 240 School</div>
          <p className="text-gray-400 mb-4">Персональная подготовка к поступлению в медицинские университеты</p>
          <p className="text-gray-500">&copy; 2024 240 School. Все права защищены.</p>
        </div>
      </footer>
    </>
  );
}