import React, { useState, useEffect } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: 'math' | 'critical';
  hint?: string;
  videoExplanation?: string;
  imageUrl?: string;
}

interface Exam {
  id: number;
  name: string;
  description: string;
  timeLimit: number; // в минутах
  mathQuestions: Question[];
  criticalQuestions: Question[];
  createdAt: string;
  updatedAt: string;
  published?: boolean;
  publishedAt?: string;
}

interface QuestionForm {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: 'math' | 'critical';
  hint: string;
  videoExplanation: string;
  imageFile: File | null;
}

interface ExamForm {
  name: string;
  description: string;
  timeLimit: number;
}

const NUETPracticeManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [showExamForm, setShowExamForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const [examForm, setExamForm] = useState<ExamForm>({
    name: '',
    description: '',
    timeLimit: 120
  });
  
  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    subject: 'math',
    hint: '',
    videoExplanation: '',
    imageFile: null
  });

  // Загрузка экзаменов при монтировании компонента
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/exams');
      const result = await response.json();
      if (result.success) {
        setExams(result.data);
      } else {
        setError(result.message || 'Ошибка при загрузке экзаменов');
      }
    } catch (err) {
      setError('Ошибка при загрузке экзаменов');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = () => {
    setEditingExam(null);
    setExamForm({ name: '', description: '', timeLimit: 120 });
    setShowExamForm(true);
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setExamForm({
      name: exam.name,
      description: exam.description,
      timeLimit: exam.timeLimit
    });
    setShowExamForm(true);
  };

  const handleSaveExam = async () => {
    try {
      setLoading(true);
      
      if (editingExam) {
        // Обновление существующего экзамена
        const response = await fetch('/api/admin/exams', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingExam.id,
            ...examForm
          }),
        });
        
        const result = await response.json();
        if (result.success) {
          setExams(exams.map(e => 
            e.id === editingExam.id 
              ? { ...e, ...examForm, updatedAt: new Date().toISOString() }
              : e
          ));
        } else {
          setError(result.message || 'Ошибка при обновлении экзамена');
        }
      } else {
        // Создание нового экзамена
        const response = await fetch('/api/admin/exams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(examForm),
        });
        
        const result = await response.json();
        if (result.success) {
          setExams([...exams, result.data]);
        } else {
          setError(result.message || 'Ошибка при создании экзамена');
        }
      }
      
      setShowExamForm(false);
      setEditingExam(null);
    } catch (err) {
      setError('Ошибка при сохранении экзамена');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId: number) => {
    if (confirm('Вы уверены, что хотите удалить этот экзамен?')) {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/exams', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: examId }),
        });
        
        const result = await response.json();
        if (result.success) {
          setExams(exams.filter(e => e.id !== examId));
          if (selectedExam?.id === examId) {
            setSelectedExam(null);
          }
        } else {
          setError(result.message || 'Ошибка при удалении экзамена');
        }
      } catch (err) {
        setError('Ошибка при удалении экзамена');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddQuestion = (subject: 'math' | 'critical') => {
    setEditingQuestion(null);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      subject,
      hint: '',
      videoExplanation: '',
      imageFile: null
    });
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      subject: question.subject,
      hint: question.hint || '',
      videoExplanation: question.videoExplanation || '',
      imageFile: null
    });
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = async () => {
    if (!selectedExam) return;

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('examId', selectedExam.id?.toString() || '');
      formData.append('question', questionForm.question);
      formData.append('options', JSON.stringify(questionForm.options));
      formData.append('correctAnswer', questionForm.correctAnswer?.toString() || '0');
      formData.append('explanation', questionForm.explanation);
      formData.append('subject', questionForm.subject);
      formData.append('hint', questionForm.hint);
      formData.append('videoExplanation', questionForm.videoExplanation);
      
      if (questionForm.imageFile) {
        formData.append('image', questionForm.imageFile);
      }
      
      if (editingQuestion) {
        formData.append('id', editingQuestion.id?.toString() || '');
      }
      
      const response = await fetch('/api/admin/questions', {
        method: editingQuestion ? 'PUT' : 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (result.success) {
        // Обновляем локальное состояние
        const updatedExam = { ...selectedExam };
        const questionsList = questionForm.subject === 'math' ? updatedExam.mathQuestions : updatedExam.criticalQuestions;
        
        if (editingQuestion) {
          const index = questionsList.findIndex(q => q.id === editingQuestion.id);
          if (index !== -1) {
            questionsList[index] = result.data;
          }
        } else {
          questionsList.push(result.data);
        }
        
        setSelectedExam(updatedExam);
        setExams(exams.map(e => e.id === selectedExam.id ? updatedExam : e));
      } else {
        setError(result.message || 'Ошибка при сохранении вопроса');
      }
      
      setShowQuestionForm(false);
      setEditingQuestion(null);
    } catch (err) {
      setError('Ошибка при сохранении вопроса');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!selectedExam) return;
    
    if (confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/questions', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: questionId }),
        });
        
        const result = await response.json();
        if (result.success) {
          const updatedExam = { ...selectedExam };
          updatedExam.mathQuestions = updatedExam.mathQuestions.filter(q => q.id !== questionId);
          updatedExam.criticalQuestions = updatedExam.criticalQuestions.filter(q => q.id !== questionId);
          
          setSelectedExam(updatedExam);
          setExams(exams.map(e => e.id === selectedExam.id ? updatedExam : e));
        } else {
          setError(result.message || 'Ошибка при удалении вопроса');
        }
      } catch (err) {
        setError('Ошибка при удалении вопроса');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePublishExam = async () => {
    if (!selectedExam) return;
    
    if (confirm(`Вы уверены, что хотите опубликовать экзамен "${selectedExam.name}"? После публикации экзамен станет доступен для студентов.`)) {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/exams/publish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: selectedExam.id }),
        });
        
        const result = await response.json();
        if (result.success) {
          // Обновляем локальное состояние
          const updatedExam = {
            ...selectedExam,
            published: true,
            publishedAt: new Date().toISOString()
          };
          setSelectedExam(updatedExam);
          setExams(exams.map(e => e.id === selectedExam.id ? updatedExam : e));
          alert('Экзамен успешно опубликован!');
        } else {
          setError(result.message || 'Ошибка при публикации экзамена');
        }
      } catch (err) {
        setError('Ошибка при публикации экзамена');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setQuestionForm({ ...questionForm, imageFile: file });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Управление NUET Practice</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}
      
      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Загрузка...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список экзаменов */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Экзамены</h3>
            <button
              onClick={handleAddExam}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Добавить
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedExam?.id === exam.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedExam(exam)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{exam.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{exam.description}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>⏱️ {exam.timeLimit} мин</span>
                      <span className="mx-2">•</span>
                      <span>📊 {exam.mathQuestions.length + exam.criticalQuestions.length} вопросов</span>
                      {exam.published && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-green-600 font-medium">✅ Опубликован</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditExam(exam);
                      }}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-800 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExam(exam.id);
                      }}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Управление вопросами */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedExam ? `Вопросы: ${selectedExam.name}` : 'Выберите экзамен'}
          </h3>
          
          {selectedExam ? (
            <div className="space-y-4">
              {/* Математика */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800">Математика ({selectedExam.mathQuestions.length}/30)</h4>
                  <button
                    onClick={() => handleAddQuestion('math')}
                    disabled={loading || selectedExam.mathQuestions.length >= 30}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Вопрос
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedExam.mathQuestions.map((question, index) => (
                    <div key={question.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {index + 1}. {question.question.substring(0, 50)}...
                      </span>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-800 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Критическое мышление */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800">Критическое мышление ({selectedExam.criticalQuestions.length}/30)</h4>
                  <button
                    onClick={() => handleAddQuestion('critical')}
                    disabled={loading || selectedExam.criticalQuestions.length >= 30}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Вопрос
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedExam.criticalQuestions.map((question, index) => (
                    <div key={question.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {index + 1}. {question.question.substring(0, 50)}...
                      </span>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-800 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Выберите экзамен для управления вопросами</p>
          )}
        </div>

        {/* Статистика и действия */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика</h3>
          
          {selectedExam ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Общая информация</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Всего вопросов:</span>
                    <span className="font-medium">{selectedExam.mathQuestions.length + selectedExam.criticalQuestions.length}/60</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Математика:</span>
                    <span className="font-medium">{selectedExam.mathQuestions.length}/30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Критическое мышление:</span>
                    <span className="font-medium">{selectedExam.criticalQuestions.length}/30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Время экзамена:</span>
                    <span className="font-medium">{selectedExam.timeLimit} мин</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Готовность</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Математика:</span>
                    <span className={`font-medium ${
                      selectedExam.mathQuestions.length === 30 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {selectedExam.mathQuestions.length === 30 ? '✅ Готово' : '⚠️ Не готово'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Критическое мышление:</span>
                    <span className={`font-medium ${
                      selectedExam.criticalQuestions.length === 30 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {selectedExam.criticalQuestions.length === 30 ? '✅ Готово' : '⚠️ Не готово'}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handlePublishExam}
                disabled={selectedExam.mathQuestions.length !== 30 || selectedExam.criticalQuestions.length !== 30 || selectedExam.published}
                className={`w-full py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedExam.published 
                    ? 'bg-green-600 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {selectedExam.published ? '✅ Экзамен опубликован' : 'Опубликовать экзамен'}
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Выберите экзамен для просмотра статистики</p>
          )}
        </div>
      </div>

      {/* Модальное окно создания/редактирования экзамена */}
      {showExamForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingExam ? 'Редактировать экзамен' : 'Создать экзамен'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input
                  type="text"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="NUET 2024 - Вариант 1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                  placeholder="Описание экзамена"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Время (минуты)</label>
                <input
                  type="number"
                  value={examForm.timeLimit}
                  onChange={(e) => setExamForm({ ...examForm, timeLimit: parseInt(e.target.value) || 120 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="30"
                  max="300"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowExamForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveExam}
                disabled={loading || !examForm.name.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания/редактирования вопроса */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingQuestion ? 'Редактировать вопрос' : 'Создать вопрос'} ({questionForm.subject === 'math' ? 'Математика' : 'Критическое мышление'})
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Вопрос</label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                  placeholder="Введите текст вопроса"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Изображение (опционально)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                {questionForm.imageFile && (
                  <p className="text-sm text-green-600 mt-1">Файл выбран: {questionForm.imageFile.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Варианты ответов</label>
                <div className="space-y-2">
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={questionForm.correctAnswer === index}
                        onChange={() => setQuestionForm({ ...questionForm, correctAnswer: index })}
                        className="text-indigo-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...questionForm.options];
                          newOptions[index] = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOptions });
                        }}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        placeholder={`Вариант ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Объяснение</label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                  placeholder="Объяснение правильного ответа"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Подсказка (опционально)</label>
                <input
                  type="text"
                  value={questionForm.hint}
                  onChange={(e) => setQuestionForm({ ...questionForm, hint: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Подсказка для студента"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Видеообъяснение (URL, опционально)</label>
                <input
                  type="url"
                  value={questionForm.videoExplanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, videoExplanation: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowQuestionForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveQuestion}
                disabled={loading || !questionForm.question.trim() || questionForm.options.some(opt => !opt.trim()) || !questionForm.explanation.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NUETPracticeManagement;