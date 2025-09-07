import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { studentAPI } from '@/utils/api';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

const VideoCourse: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<number>(0);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const { data } = await studentAPI.getModules();
        setModules(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки модулей');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка модулей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ошибка</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            ← Назад
          </Link>
        </div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Модули не найдены</h1>
          <p className="text-gray-600 mb-4">Пока нет доступных модулей для изучения</p>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            ← Назад
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>НУЕТ Видеокурс | 240 School</title>
        <meta name="description" content="Полный видеокурс подготовки к НУЕТ" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                  ← Назад к дашборду
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">НУЕТ Видеокурс</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar with modules */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Модули курса</h2>
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedModule === index
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                      onClick={() => setSelectedModule(index)}
                    >
                      <h3 className="font-medium text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      <p className="text-xs text-blue-600 mt-2">{module.lessons.length} уроков</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {modules[selectedModule]?.title}
                  </h2>
                  <p className="text-gray-600">{modules[selectedModule]?.description}</p>
                </div>

                {/* Lessons List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Уроки модуля</h3>
                  <div className="space-y-3">
                    {modules[selectedModule]?.lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            lesson.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {lesson.completed ? '✓' : index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                            <p className="text-sm text-gray-600">{lesson.duration}</p>
                          </div>
                        </div>
                        <Link href={`/student/lesson/${lesson.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          {lesson.completed ? 'Повторить' : 'Смотреть'}
                        </Link>
                      </div>
                    )) || []}
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📊 Прогресс модуля</h4>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${modules[selectedModule]?.lessons ? (modules[selectedModule].lessons.filter(l => l.completed).length / modules[selectedModule].lessons.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    {modules[selectedModule]?.lessons ? modules[selectedModule].lessons.filter(l => l.completed).length : 0} из {modules[selectedModule]?.lessons?.length || 0} уроков завершено
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoCourse;