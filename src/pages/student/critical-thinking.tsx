import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { criticalAPI } from '../../utils/api';

interface CriticalThinkingQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  textExplanation: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'logic' | 'analysis' | 'reasoning' | 'comprehension' | 'evaluation';
  tags: string[];
  imageUrl?: string;
}

interface CriticalThinkingExam {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: CriticalThinkingQuestion[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const CriticalThinking: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'exam' | 'taking-exam'>('list');
  const [exams, setExams] = useState<CriticalThinkingExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<CriticalThinkingExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Exam taking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await criticalAPI.getExams();
        console.log('API Response:', response);
        console.log('Response data:', response.data);
        
        // Check if response has the expected structure
        let examsData = [];
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          examsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          examsData = response.data;
        }
        
        console.log('Processed exams data:', examsData);
        setExams(examsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching critical thinking exams:', err);
        setError('Ошибка загрузки экзаменов. Пожалуйста, попробуйте позже.');
        setExams([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentView === 'taking-exam' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - auto submit
            handleExamSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentView, timeRemaining]);

  const startExam = (exam: CriticalThinkingExam) => {
    setSelectedExam(exam);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(exam.timeLimit * 60); // Convert minutes to seconds
    setExamStartTime(new Date());
    setCurrentView('taking-exam');
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleExamSubmit = () => {
    // TODO: Submit exam results to backend
    alert('Экзамен завершен! Результаты будут показаны здесь.');
    setCurrentView('list');
    setSelectedExam(null);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Head>
        <title>Critical Thinking Training | 240 School</title>
        <meta name="description" content="TSA-style Critical Thinking Training" />
      </Head>

      {currentView === 'list' ? (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-red-600 text-white px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-red-100 hover:text-white">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-lg font-bold">TSA Past Papers - Section 1 (By Topic)</h1>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-4 py-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Загрузка экзаменов...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-600 text-lg font-medium mb-2">Ошибка загрузки</div>
                <div className="text-red-500">{error}</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Попробовать снова
                </button>
              </div>
            ) : exams.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🧠</div>
                <div className="text-gray-600 text-lg font-medium mb-2">Экзамены не найдены</div>
                <div className="text-gray-500">Пока нет доступных экзаменов по критическому мышлению</div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Задачи критического мышления</h2>
                  <p className="text-sm text-gray-600 mt-1">Выберите задачу для выполнения</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {exams.map((exam, index) => (
                    <div key={exam._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              #{index + 1}
                            </span>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                              exam.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              exam.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              exam.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {exam.difficulty === 'easy' ? 'Легкий' : 
                               exam.difficulty === 'medium' ? 'Средний' : 
                               exam.difficulty === 'hard' ? 'Сложный' : 'Смешанный'}
                            </span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              📝 {exam.questions.length} вопросов
                            </span>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              ⏱️ {exam.timeLimit} мин
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
                          <p className="text-gray-600 mb-3">{exam.description}</p>
                          <div className="text-sm text-gray-500 mb-3">
                            Создан: {new Date(exam.createdAt).toLocaleDateString('ru-RU')}
                            {exam.publishedAt && (
                              <span className="ml-4">
                                Опубликован: {new Date(exam.publishedAt).toLocaleDateString('ru-RU')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-6 flex flex-col space-y-2">
                          <button 
                            onClick={() => {
                              setSelectedExam(exam);
                              setCurrentView('exam');
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium mb-2"
                          >
                            Просмотр
                          </button>
                          <button 
                            onClick={() => startExam(exam)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Начать экзамен
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : currentView === 'exam' && selectedExam ? (
          <div className="min-h-screen bg-white">
            {/* Exam Header */}
            <div className="bg-purple-600 text-white px-4 py-2">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => {
                      setCurrentView('list');
                      setSelectedExam(null);
                    }}
                    className="text-purple-100 hover:text-white"
                  >
                    ← Назад к списку
                  </button>
                  <h1 className="text-lg font-bold">{selectedExam.title}</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    selectedExam.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    selectedExam.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    selectedExam.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedExam.difficulty === 'easy' ? 'Легкий' : 
                     selectedExam.difficulty === 'medium' ? 'Средний' : 
                     selectedExam.difficulty === 'hard' ? 'Сложный' : 'Смешанный'}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    📝 {selectedExam.questions.length} вопросов
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    ⏱️ {selectedExam.timeLimit} мин
                  </span>
                </div>
              </div>
            </div>

            {/* Exam Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedExam.title}</h2>
                    <p className="text-gray-600 text-lg mb-4">{selectedExam.description}</p>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📝</span>
                        <span className="text-gray-700">{selectedExam.questions.length} вопросов</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">⏱️</span>
                        <span className="text-gray-700">{selectedExam.timeLimit} минут</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📊</span>
                        <span className="text-gray-700">
                          {selectedExam.difficulty === 'easy' ? 'Легкий' : 
                           selectedExam.difficulty === 'medium' ? 'Средний' : 
                           selectedExam.difficulty === 'hard' ? 'Сложный' : 'Смешанный'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Инструкции:</h3>
                      <div className="text-gray-800 leading-relaxed">
                        <ul className="list-disc list-inside space-y-2">
                          <li>Внимательно прочитайте каждый вопрос</li>
                          <li>Выберите наиболее подходящий ответ из предложенных вариантов</li>
                          <li>У вас есть {selectedExam.timeLimit} минут на выполнение всех заданий</li>
                          <li>После завершения вы получите результаты с объяснениями</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Готовы начать?</h3>
                      <p className="text-blue-800 mb-4">
                        Этот экзамен содержит {selectedExam.questions.length} вопросов по критическому мышлению. 
                        Убедитесь, что у вас достаточно времени для выполнения всех заданий.
                      </p>
                      <button 
                        onClick={() => startExam(selectedExam)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Начать экзамен
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => {
                          setCurrentView('list');
                          setSelectedExam(null);
                        }}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Назад к списку
                      </button>
                      <div className="text-sm text-gray-500">
                        Создано: {new Date(selectedExam.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : currentView === 'taking-exam' && selectedExam ? (
          <div className="min-h-screen bg-gray-50">
            {/* Exam Header with Timer */}
            <div className="bg-green-600 text-white px-4 py-3 shadow-lg">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-lg font-bold">{selectedExam.title}</h1>
                  <span className="bg-green-500 px-3 py-1 rounded-full text-sm">
                    Вопрос {currentQuestionIndex + 1} из {selectedExam.questions.length}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                    timeRemaining < 300 ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    ⏱️ {formatTime(timeRemaining)}
                  </div>
                  <button 
                    onClick={handleExamSubmit}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium"
                  >
                    Завершить экзамен
                  </button>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
              {selectedExam.questions[currentQuestionIndex] && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {selectedExam.questions[currentQuestionIndex].question}
                    </h2>
                    
                    {selectedExam.questions[currentQuestionIndex].imageUrl && (
                      <div className="mb-6">
                        <img 
                          src={selectedExam.questions[currentQuestionIndex].imageUrl} 
                          alt="Question image" 
                          className="max-w-full h-auto rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3 mb-8">
                    {selectedExam.questions[currentQuestionIndex].options.map((option, index) => (
                      <label 
                        key={index} 
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          answers[currentQuestionIndex] === index 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value={index}
                          checked={answers[currentQuestionIndex] === index}
                          onChange={() => handleAnswerSelect(currentQuestionIndex, index)}
                          className="mr-3 text-blue-600"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className={`px-6 py-2 rounded-lg font-medium ${
                        currentQuestionIndex === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      ← Предыдущий
                    </button>

                    <div className="text-sm text-gray-600">
                      Отвечено: {Object.keys(answers).length} из {selectedExam.questions.length}
                    </div>

                    {currentQuestionIndex < selectedExam.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Следующий →
                      </button>
                    ) : (
                      <button
                        onClick={handleExamSubmit}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
                      >
                        Завершить экзамен
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
    </>
  );
};

export default CriticalThinking;