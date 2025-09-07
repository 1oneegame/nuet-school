import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { examsAPI } from '../../utils/api';

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  question: string;
  answers: Answer[];
  explanation?: string;
  videoExplanation?: string;
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
  timeLimit?: number;
  passingScore?: number;
}

type Mode = 'selection' | 'exam' | 'training';
type TestPhase = 'active' | 'results';

const Practice: React.FC = () => {
  const [mode, setMode] = useState<Mode>('selection');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [testPhase, setTestPhase] = useState<TestPhase>('active');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка экзаменов при монтировании компонента
  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await examsAPI.getExams();
      if (response.data.success) {
        setExams(response.data.data);
      } else {
        setError('Ошибка при загрузке экзаменов');
      }
    } catch (error) {
      console.error('Error loading exams:', error);
      setError('Не удалось загрузить экзамены');
    } finally {
      setLoading(false);
    }
  };

  // Таймер
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUp = () => {
    setIsTimerActive(false);
    if (mode === 'exam') {
      finishTest();
    }
  };

  const getRandomExam = (): Exam | null => {
    if (exams.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * exams.length);
    return exams[randomIndex];
  };

  const startExamMode = () => {
    const randomExam = getRandomExam();
    if (!randomExam) {
      setError('Нет доступных экзаменов');
      return;
    }
    setSelectedExam(randomExam);
    setMode('exam');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setTestPhase('active');
    
    if (randomExam.timeLimit) {
      setTimeLeft(randomExam.timeLimit * 60);
      setIsTimerActive(true);
    }
  };

  const startTrainingMode = () => {
    const randomExam = getRandomExam();
    if (!randomExam) {
      setError('Нет доступных экзаменов');
      return;
    }
    setSelectedExam(randomExam);
    setMode('training');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setTestPhase('active');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    // Обновляем массив ответов для корректного отображения выбранного варианта
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
    
    if (mode === 'training') {
      // В режиме тренировки сразу показываем результат
      setShowResult(true);
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;
    
    if (currentQuestionIndex < (selectedExam?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    setIsTimerActive(false);
    const finalScore = calculateScore();
    setScore(finalScore);
    setTestPhase('results');
  };

  const calculateScore = (): number => {
    if (!selectedExam) return 0;
    
    let correct = 0;
    answers.forEach((answer, index) => {
      if (index < selectedExam.questions.length) {
        const question = selectedExam.questions[index];
        const correctAnswerIndex = question.answers.findIndex(a => a.isCorrect);
        if (answer === correctAnswerIndex) {
          correct++;
        }
      }
    });
    
    return correct;
  };

  const resetToSelection = () => {
    setMode('selection');
    setSelectedExam(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setTestPhase('active');
    setTimeLeft(0);
    setIsTimerActive(false);
    setScore(0);
  };

  const getCurrentQuestion = (): Question | null => {
    if (!selectedExam || currentQuestionIndex >= selectedExam.questions.length) {
      return null;
    }
    return selectedExam.questions[currentQuestionIndex];
  };

  const currentQuestion = getCurrentQuestion();

  return (
    <>
      <Head>
        <title>NUET Practice | 240 School</title>
        <meta name="description" content="Практические задания для подготовки к НУЕТ" />
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
                <h1 className="text-2xl font-bold text-gray-900">NUET Practice</h1>
              </div>
              {(mode === 'exam' || mode === 'training') && (
                <div className="flex items-center space-x-4">
                  {selectedExam && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Тест:</span>
                      <span className="font-semibold text-blue-600">
                        {selectedExam.title}
                      </span>
                    </div>
                  )}
                  {isTimerActive && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Время:</span>
                      <span className={`font-mono text-lg font-bold ${
                        timeLeft < 300 ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Выбор режима */}
          {mode === 'selection' && (
            <div className="space-y-6">
              {loading && (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-lg text-gray-600">Загрузка экзаменов...</div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800">{error}</div>
                  <button
                    onClick={loadExams}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Попробовать снова
                  </button>
                </div>
              )}
              
              {!loading && !error && (
                <>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Выберите режим</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button
                        onClick={startExamMode}
                        disabled={exams.length === 0}
                        className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                      >
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">🎯 Exam Mode</h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Случайно выбранный практический тест. Ответы не отображаются во время прохождения.
                          После завершения показывается только общий счет.
                        </p>
                        <p className="text-xs text-gray-500">Результат в конце теста</p>
                      </button>
                      
                      <button
                        onClick={startTrainingMode}
                        disabled={exams.length === 0}
                        className="border-2 border-green-200 rounded-lg p-6 hover:border-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                      >
                        <h3 className="text-lg font-semibold text-green-800 mb-2">📚 Training Mode</h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Тренировочный режим с немедленной обратной связью. 
                          После каждого ответа показывается правильность и видео-объяснение.
                        </p>
                        <p className="text-xs text-gray-500">Обучение с обратной связью</p>
                      </button>
                    </div>
                    
                    {exams.length > 0 && (
                      <div className="mt-4 text-center text-sm text-gray-600">
                        Доступно экзаменов: {exams.length}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          {/* Прохождение теста */}
          {(mode === 'exam' || mode === 'training') && testPhase === 'active' && selectedExam && currentQuestion && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    Вопрос {currentQuestionIndex + 1} из {selectedExam.questions.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentQuestionIndex + 1) / selectedExam.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {getCurrentQuestion()?.question}
              </h3>

              <div className="space-y-3 mb-6">
                {getCurrentQuestion()?.answers.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult && mode === 'training'}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                      showResult && mode === 'training'
                        ? answer.isCorrect
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : answers[currentQuestionIndex] === index && !answer.isCorrect
                          ? 'border-red-500 bg-red-50 text-red-800'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                        : answers[currentQuestionIndex] === index
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                    {answer.text}
                  </button>
                ))}
              </div>

              {/* Результат ответа (только в Training Mode) */}
              {showResult && mode === 'training' && (
                <div className={`p-4 rounded-lg mb-6 ${
                  answers[currentQuestionIndex] !== undefined && getCurrentQuestion()?.answers[answers[currentQuestionIndex]]?.isCorrect
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`font-semibold mb-2 ${
                    answers[currentQuestionIndex] !== undefined && getCurrentQuestion()?.answers[answers[currentQuestionIndex]]?.isCorrect
                      ? 'text-green-800'
                      : 'text-red-800'
                  }`}>
                    {answers[currentQuestionIndex] !== undefined && getCurrentQuestion()?.answers[answers[currentQuestionIndex]]?.isCorrect
                      ? '✅ Правильно!'
                      : '❌ Неправильно'}
                  </div>
                  {getCurrentQuestion()?.explanation && (
                    <p className="text-gray-700 mb-3">
                      <strong>Объяснение:</strong> {getCurrentQuestion()?.explanation}
                    </p>
                  )}
                  {getCurrentQuestion()?.videoExplanation && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Видео-объяснение:</h4>
                      <iframe
                        width="560"
                        height="315"
                        src={getCurrentQuestion()?.videoExplanation?.replace('watch?v=', 'embed/')}
                        title="Видео-объяснение"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full max-w-md rounded-lg"
                      ></iframe>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={resetToSelection}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Выйти
                </button>
                
                <div className="space-x-3">
                  <button
                    onClick={handleNextQuestion}
                    disabled={answers[currentQuestionIndex] === undefined}
                    className={`px-6 py-2 rounded-md font-medium ${
                      answers[currentQuestionIndex] !== undefined
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {currentQuestionIndex < selectedExam.questions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Результаты */}
          {testPhase === 'results' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Тест завершен!</h2>
                
                <div className="bg-blue-50 rounded-lg p-8 mb-8">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {score}/{selectedExam?.questions.length || 0}
                  </div>
                  <div className="text-gray-700 text-lg">Правильных ответов</div>
                  {selectedExam && (
                    <div className="text-sm text-gray-600 mt-2">
                      {selectedExam.title}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={resetToSelection}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Вернуться к выбору режима
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Practice;