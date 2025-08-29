import React, { useState, useEffect } from 'react';

interface CriticalThinkingQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  textExplanation?: string;
  hint?: string;
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'logic' | 'analysis' | 'reasoning' | 'comprehension' | 'evaluation';
  tags: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CriticalThinkingExam {
  _id?: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: CriticalThinkingQuestion[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  isPublished: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface QuestionForm {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  textExplanation: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'logic' | 'analysis' | 'reasoning' | 'comprehension' | 'evaluation';
  tags: string[];
  imageFile: File | null;
}

interface ExamForm {
  title: string;
  description: string;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
}

const CriticalThinkingManagement: React.FC = () => {
  const [exams, setExams] = useState<CriticalThinkingExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<CriticalThinkingExam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [showExamForm, setShowExamForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingExam, setEditingExam] = useState<CriticalThinkingExam | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<CriticalThinkingQuestion | null>(null);
  
  const [examForm, setExamForm] = useState<ExamForm>({
    title: '',
    description: '',
    timeLimit: 90,
    difficulty: 'mixed'
  });
  
  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    textExplanation: '',
    hint: '',
    difficulty: 'medium',
    category: 'logic',
    tags: [],
    imageFile: null
  });

  const [tagInput, setTagInput] = useState('');

  // Загрузка экзаменов при монтировании компонента
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/critical-thinking/exams');
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

  // Функции для работы с экзаменами
  const handleCreateExam = () => {
    setEditingExam(null);
    setExamForm({
      title: '',
      description: '',
      timeLimit: 90,
      difficulty: 'mixed'
    });
    setShowExamForm(true);
  };

  const handleEditExam = (exam: CriticalThinkingExam) => {
    setEditingExam(exam);
    setExamForm({
      title: exam.title,
      description: exam.description,
      timeLimit: exam.timeLimit,
      difficulty: exam.difficulty
    });
    setShowExamForm(true);
  };

  const handleSaveExam = async () => {
    try {
      setLoading(true);
      const method = editingExam ? 'PUT' : 'POST';
      const url = editingExam 
        ? `/api/admin/critical-thinking/exams?id=${editingExam._id}`
        : '/api/admin/critical-thinking/exams';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(examForm)
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess(editingExam ? 'Экзамен обновлен' : 'Экзамен создан');
        setShowExamForm(false);
        fetchExams();
      } else {
        setError(result.message || 'Ошибка при сохранении экзамена');
      }
    } catch (err) {
      setError('Ошибка при сохранении экзамена');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот экзамен?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/critical-thinking/exams?id=${examId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess('Экзамен удален');
        fetchExams();
      } else {
        setError(result.message || 'Ошибка при удалении экзамена');
      }
    } catch (err) {
      setError('Ошибка при удалении экзамена');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishExam = async (exam: CriticalThinkingExam) => {
    if (exam.questions.length === 0) {
      setError('Нельзя опубликовать экзамен без вопросов');
      return;
    }

    if (!confirm(`Вы уверены, что хотите опубликовать экзамен "${exam.title}"? После публикации экзамен станет доступен для студентов.`)) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/critical-thinking/exams?id=${exam._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPublished: true
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess('Экзамен опубликован');
        fetchExams();
      } else {
        setError(result.message || 'Ошибка при публикации экзамена');
      }
    } catch (err) {
      setError('Ошибка при публикации экзамена');
    } finally {
      setLoading(false);
    }
  };

  // Функции для работы с вопросами
  const handleCreateQuestion = () => {
    if (!selectedExam) {
      setError('Выберите экзамен для добавления вопроса');
      return;
    }
    setEditingQuestion(null);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      textExplanation: '',
      hint: '',
      difficulty: 'medium',
      category: 'logic',
      tags: [],
      imageFile: null
    });
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question: CriticalThinkingQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      textExplanation: question.textExplanation || '',
      hint: question.hint || '',
      difficulty: question.difficulty,
      category: question.category,
      tags: [...question.tags],
      imageFile: null
    });
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = async () => {
    if (!selectedExam) {
      setError('Выберите экзамен');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      // Добавляем данные вопроса
      formData.append('examId', selectedExam._id!);
      formData.append('question', questionForm.question);
      formData.append('options', JSON.stringify(questionForm.options));
      formData.append('correctAnswer', questionForm.correctAnswer.toString());
      formData.append('explanation', questionForm.explanation);
      formData.append('textExplanation', questionForm.textExplanation);
      formData.append('hint', questionForm.hint);
      formData.append('difficulty', questionForm.difficulty);
      formData.append('category', questionForm.category);
      formData.append('tags', JSON.stringify(questionForm.tags));
      
      if (questionForm.imageFile) {
        formData.append('image', questionForm.imageFile);
      }
      
      if (editingQuestion) {
        formData.append('questionId', editingQuestion._id!);
      }
      
      const method = editingQuestion ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/critical-thinking/questions', {
        method,
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess(editingQuestion ? 'Вопрос обновлен' : 'Вопрос добавлен');
        setShowQuestionForm(false);
        fetchExams();
      } else {
        setError(result.message || 'Ошибка при сохранении вопроса');
      }
    } catch (err) {
      setError('Ошибка при сохранении вопроса');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот вопрос?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/critical-thinking/questions?id=${questionId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess('Вопрос удален');
        fetchExams();
      } else {
        setError(result.message || 'Ошибка при удалении вопроса');
      }
    } catch (err) {
      setError('Ошибка при удалении вопроса');
    } finally {
      setLoading(false);
    }
  };

  // Вспомогательные функции
  const addTag = () => {
    if (tagInput.trim() && !questionForm.tags.includes(tagInput.trim())) {
      setQuestionForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setQuestionForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQuestionForm(prev => ({ ...prev, imageFile: file }));
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="critical-thinking-management">
      <div className="header">
        <h2>Управление Critical Thinking</h2>
        <button 
          onClick={handleCreateExam}
          className="btn btn-primary"
          disabled={loading}
        >
          Создать экзамен
        </button>
      </div>

      {/* Сообщения об ошибках и успехе */}
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={clearMessages} className="close-btn">×</button>
        </div>
      )}

      {loading && <div className="loading">Загрузка...</div>}

      {/* Список экзаменов */}
      <div className="exams-section">
        <h3>Экзамены</h3>
        <div className="exams-grid">
          {exams.map(exam => (
            <div key={exam._id} className="exam-card">
              <div className="exam-header">
                <h4>{exam.title}</h4>
                <div className="exam-actions">
                  <button 
                    onClick={() => handleEditExam(exam)}
                    className="btn btn-sm btn-secondary"
                  >
                    Редактировать
                  </button>
                  <button 
                    onClick={() => handleDeleteExam(exam._id!)}
                    className="btn btn-sm btn-danger"
                  >
                    Удалить
                  </button>
                </div>
              </div>
              <p className="exam-description">{exam.description}</p>
              <div className="exam-info">
                <span className="time-limit">Время: {exam.timeLimit} мин</span>
                <span className="difficulty">Сложность: {exam.difficulty}</span>
                <span className="questions-count">Вопросов: {exam.questions.length}</span>
                <span className={`publish-status ${exam.isPublished ? 'published' : 'unpublished'}`}>
                  {exam.isPublished ? '✅ Опубликован' : '❌ Не опубликован'}
                </span>
              </div>
              <div className="exam-footer">
                <button 
                  onClick={() => setSelectedExam(exam)}
                  className={`btn btn-sm ${selectedExam?._id === exam._id ? 'btn-primary' : 'btn-outline'}`}
                >
                  {selectedExam?._id === exam._id ? 'Выбран' : 'Выбрать'}
                </button>
                {!exam.isPublished && (
                  <button 
                    onClick={() => handlePublishExam(exam)}
                    className="btn btn-sm btn-success"
                    disabled={exam.questions.length === 0 || loading}
                  >
                    Опубликовать
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Управление вопросами */}
      {selectedExam && (
        <div className="questions-section">
          <div className="questions-header">
            <h3>Вопросы для экзамена: {selectedExam.title}</h3>
            <button 
              onClick={handleCreateQuestion}
              className="btn btn-primary"
              disabled={loading}
            >
              Добавить вопрос
            </button>
          </div>
          
          <div className="questions-list">
            {selectedExam.questions.map((question, index) => (
              <div key={question._id} className="question-card">
                <div className="question-header">
                  <span className="question-number">Вопрос {index + 1}</span>
                  <div className="question-actions">
                    <button 
                      onClick={() => handleEditQuestion(question)}
                      className="btn btn-sm btn-secondary"
                    >
                      Редактировать
                    </button>
                    <button 
                      onClick={() => handleDeleteQuestion(question._id!)}
                      className="btn btn-sm btn-danger"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                <div className="question-content">
                  <p className="question-text">{question.question}</p>
                  {question.imageUrl && (
                    <img src={question.imageUrl} alt="Question image" className="question-image" />
                  )}
                  <div className="question-options">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`option ${optIndex === question.correctAnswer ? 'correct' : ''}`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </div>
                    ))}
                  </div>
                  <div className="question-meta">
                    <span className="difficulty">Сложность: {question.difficulty}</span>
                    <span className="category">Категория: {question.category}</span>
                    {question.tags.length > 0 && (
                      <div className="tags">
                        Теги: {question.tags.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Формы создания/редактирования экзамена */}
      {showExamForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingExam ? 'Редактировать экзамен' : 'Создать экзамен'}</h3>
              <button onClick={() => setShowExamForm(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Название экзамена *</label>
                <input
                  type="text"
                  value={examForm.title}
                  onChange={(e) => setExamForm({...examForm, title: e.target.value})}
                  placeholder="Введите название экзамена"
                />
              </div>
              <div className="form-group">
                <label>Описание *</label>
                <textarea
                  value={examForm.description}
                  onChange={(e) => setExamForm({...examForm, description: e.target.value})}
                  placeholder="Описание экзамена"
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Время (минуты) *</label>
                  <input
                    type="number"
                    value={examForm.timeLimit}
                    onChange={(e) => setExamForm({...examForm, timeLimit: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Сложность</label>
                  <select
                    value={examForm.difficulty}
                    onChange={(e) => setExamForm({...examForm, difficulty: e.target.value as any})}
                  >
                    <option value="easy">Легкий</option>
                    <option value="medium">Средний</option>
                    <option value="hard">Сложный</option>
                    <option value="mixed">Смешанный</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleSaveExam} className="btn btn-primary" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={() => setShowExamForm(false)} className="btn btn-secondary">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Форма создания/редактирования вопроса */}
      {showQuestionForm && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>{editingQuestion ? 'Редактировать вопрос' : 'Добавить вопрос'}</h3>
              <button onClick={() => setShowQuestionForm(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Текст вопроса *</label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                  placeholder="Введите текст вопроса"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>Варианты ответов *</label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="option-input">
                    <span className="option-label">{String.fromCharCode(65 + index)}.</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[index] = e.target.value;
                        setQuestionForm({...questionForm, options: newOptions});
                      }}
                      placeholder={`Вариант ${String.fromCharCode(65 + index)}`}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={questionForm.correctAnswer === index}
                      onChange={() => setQuestionForm({...questionForm, correctAnswer: index})}
                    />
                    <label>Правильный</label>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Объяснение *</label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                  placeholder="Объяснение правильного ответа"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Дополнительное объяснение</label>
                <textarea
                  value={questionForm.textExplanation}
                  onChange={(e) => setQuestionForm({...questionForm, textExplanation: e.target.value})}
                  placeholder="Дополнительное текстовое объяснение"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Подсказка</label>
                <input
                  type="text"
                  value={questionForm.hint}
                  onChange={(e) => setQuestionForm({...questionForm, hint: e.target.value})}
                  placeholder="Подсказка для вопроса"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Сложность</label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({...questionForm, difficulty: e.target.value as any})}
                  >
                    <option value="easy">Легкий</option>
                    <option value="medium">Средний</option>
                    <option value="hard">Сложный</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Категория</label>
                  <select
                    value={questionForm.category}
                    onChange={(e) => setQuestionForm({...questionForm, category: e.target.value as any})}
                  >
                    <option value="logic">Логика</option>
                    <option value="analysis">Анализ</option>
                    <option value="reasoning">Рассуждение</option>
                    <option value="comprehension">Понимание</option>
                    <option value="evaluation">Оценка</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Теги</label>
                <div className="tags-input">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Добавить тег"
                  />
                  <button type="button" onClick={addTag} className="btn btn-sm">Добавить</button>
                </div>
                <div className="tags-list">
                  {questionForm.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Изображение</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleSaveQuestion} className="btn btn-primary" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={() => setShowQuestionForm(false)} className="btn btn-secondary">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriticalThinkingManagement;

// Стили для компонента
const styles = `
.critical-thinking-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-error {
  background-color: #fee;
  color: #c53030;
  border: 1px solid #feb2b2;
}

.alert-success {
  background-color: #f0fff4;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

.exams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.exam-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.exam-actions {
  display: flex;
  gap: 8px;
}

.questions-section {
  margin-top: 40px;
}

.questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.question-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: white;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-options {
  margin: 12px 0;
}

.option {
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 4px;
  background: #f7fafc;
}

.option.correct {
  background: #c6f6d5;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.option-input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.option-label {
  font-weight: 500;
  min-width: 20px;
}

.tags-input {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
  color: #374151;
}

input, textarea, select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.loading {
  text-align: center;
  padding: 20px;
  color: #6b7280;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.close-btn:hover {
  color: #374151;
}
`;

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}