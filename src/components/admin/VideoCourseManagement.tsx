import React, { useState, useEffect } from 'react';

interface Lesson {
  _id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  theoryPdf?: string;
  homeworkPdf?: string;
  completed: boolean;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface LessonForm {
  title: string;
  duration: string;
  videoFile: File | null;
  theoryFile: File | null;
  homeworkFile: File | null;
}

interface UploadFiles {
  video: File | null;
  theory: File | null;
  homework: File | null;
}

const VideoCourseManagement: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка модулей при монтировании компонента
  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/modules');
      const result = await response.json();
      
      if (result.success) {
        setModules(result.data);
      } else {
        setError(result.message || 'Ошибка при загрузке модулей');
      }
    } catch (err) {
      setError('Ошибка при загрузке модулей');
    } finally {
      setLoading(false);
    }
  };

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: ''
  });

  const [lessonForm, setLessonForm] = useState<LessonForm>({
    title: '',
    duration: '',
    videoFile: null,
    theoryFile: null,
    homeworkFile: null
  });
  const [uploadFiles, setUploadFiles] = useState<UploadFiles>({
    video: null,
    theory: null,
    homework: null
  });
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleAddModule = () => {
    setEditingModule(null);
    setModuleForm({ title: '', description: '' });
    setShowModuleForm(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleForm({ title: module.title, description: module.description });
    setShowModuleForm(true);
  };

  const handleSaveModule = async () => {
    try {
      setLoading(true);
      
      if (editingModule) {
        // Обновление существующего модуля
        const response = await fetch('/api/admin/modules', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingModule._id,
            title: moduleForm.title,
            description: moduleForm.description
          }),
        });
        
        const result = await response.json();
        if (result.success) {
          setModules(modules.map(m => 
            m._id === editingModule._id 
              ? { ...m, title: moduleForm.title, description: moduleForm.description }
              : m
          ));
        } else {
          setError(result.message || 'Ошибка при обновлении модуля');
        }
      } else {
        // Создание нового модуля
        const response = await fetch('/api/admin/modules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: moduleForm.title,
            description: moduleForm.description
          }),
        });
        
        const result = await response.json();
        if (result.success) {
          setModules([...modules, result.data]);
        } else {
          setError(result.message || 'Ошибка при создании модуля');
        }
      }
      
      setShowModuleForm(false);
      setEditingModule(null);
    } catch (err) {
      setError('Ошибка при сохранении модуля');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот модуль?')) {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/modules', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: moduleId }),
        });
        
        const result = await response.json();
        if (result.success) {
          setModules(modules.filter(m => m._id !== moduleId));
          if (selectedModule?._id === moduleId) {
            setSelectedModule(null);
          }
        } else {
          setError(result.message || 'Ошибка при удалении модуля');
        }
      } catch (err) {
        setError('Ошибка при удалении модуля');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddLesson = () => {
    if (!selectedModule) return;
    setEditingLesson(null);
    setLessonForm({ title: '', duration: '', videoFile: null, theoryFile: null, homeworkFile: null });
    setShowLessonForm(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({ 
      title: lesson.title, 
      duration: lesson.duration, 
      videoFile: null, 
      theoryFile: null, 
      homeworkFile: null 
    });
    setShowLessonForm(true);
  };

  const handleSaveLesson = async () => {
    if (!selectedModule) return;

    try {
      setLoading(true);
      
      if (editingLesson) {
        // Обновление существующего урока
        const response = await fetch('/api/admin/lessons', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingLesson._id,
            moduleId: selectedModule._id,
            title: lessonForm.title,
            duration: lessonForm.duration
          }),
        });
        
        const result = await response.json();
        if (result.success) {
          setModules(modules.map(m => 
            m._id === selectedModule._id 
              ? {
                  ...m,
                  lessons: (m.lessons || []).map(l => 
                    l._id === editingLesson._id 
                      ? { ...l, title: lessonForm.title, duration: lessonForm.duration }
                      : l
                  )
                }
              : m
          ));
        } else {
          setError(result.message || 'Ошибка при обновлении урока');
        }
      } else {
        // Создание нового урока
        const response = await fetch('/api/admin/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            moduleId: selectedModule._id,
            title: lessonForm.title,
            duration: lessonForm.duration
          }),
        });
        
        const result = await response.json();
        if (result.success) {
          setModules(modules.map(m => 
            m._id === selectedModule._id 
              ? { ...m, lessons: [...m.lessons, result.data] }
              : m
          ));
        } else {
          setError(result.message || 'Ошибка при создании урока');
        }
      }
      
      setShowLessonForm(false);
      setEditingLesson(null);
    } catch (err) {
      setError('Ошибка при сохранении урока');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedModule) return;
    
    if (confirm('Вы уверены, что хотите удалить этот урок?')) {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/lessons', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ moduleId: selectedModule._id, lessonId: lessonId }),
        });
        
        const result = await response.json();
        if (result.success) {
          setModules(modules.map(m => 
            m._id === selectedModule._id 
              ? { ...m, lessons: m.lessons.filter(l => l._id !== lessonId) }
              : m
          ));
        } else {
          setError(result.message || 'Ошибка при удалении урока');
        }
      } catch (err) {
        setError('Ошибка при удалении урока');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileSelect = (fileType: 'video' | 'theory' | 'homework', file: File | null) => {
    setUploadFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
    setUploadStatus('');
  };

  const handleUploadContent = async () => {
    if (!selectedLesson) {
      setError('Выберите урок для загрузки контента');
      return;
    }

    if (!selectedLesson._id) {
      setError('Ошибка: ID урока не найден');
      return;
    }

    const { video, theory, homework } = uploadFiles;
    if (!video && !theory && !homework) {
      setError('Выберите хотя бы один файл для загрузки');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setUploadStatus('Загрузка файлов...');
      setUploadProgress({});

      // Validate file sizes before upload
      const maxFileSize = 1024 * 1024 * 1024; // 1GB
      const filesToCheck = [
        { file: video, name: 'Видео' },
        { file: theory, name: 'Теория' },
        { file: homework, name: 'Домашнее задание' }
      ];
      
      for (const { file, name } of filesToCheck) {
        if (file && file.size > maxFileSize) {
          setError(`${name}: размер файла превышает 1GB`);
          return;
        }
        if (file && file.size === 0) {
          setError(`${name}: файл пустой или поврежден`);
          return;
        }
      }

      const formData = new FormData();
      formData.append('lessonId', selectedLesson._id.toString());
      
      if (video) {
        formData.append('video', video);
        setUploadProgress(prev => ({ ...prev, video: 0 }));
      }
      if (theory) {
        formData.append('theory', theory);
        setUploadProgress(prev => ({ ...prev, theory: 0 }));
      }
      if (homework) {
        formData.append('homework', homework);
        setUploadProgress(prev => ({ ...prev, homework: 0 }));
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          Object.keys(newProgress).forEach(key => {
            if (newProgress[key] < 90) {
              newProgress[key] = Math.min(90, newProgress[key] + Math.random() * 20);
            }
          });
          return newProgress;
        });
      }, 500);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setError('Превышено время ожидания загрузки (5 минут)');
      }, 5 * 60 * 1000); // 5 minute timeout

      const response = await fetch('/api/admin/lessons/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      setUploadProgress(prev => {
        const completed = { ...prev };
        Object.keys(completed).forEach(key => {
          completed[key] = 100;
        });
        return completed;
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Ошибка сервера при загрузке файлов';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          if (response.status === 413) {
            errorMessage = 'Файл слишком большой для загрузки';
          } else if (response.status === 500) {
            errorMessage = 'Внутренняя ошибка сервера';
          } else if (response.status === 400) {
            errorMessage = 'Неверный формат файла или данных';
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadStatus('Файлы успешно загружены!');
        
        // Update the lesson in modules state
        setModules(modules.map(m => 
          m._id === selectedModule?._id 
            ? { 
                ...m, 
                lessons: (m.lessons || []).map(l => 
                  l._id === selectedLesson._id ? result.data : l
                )
              }
            : m
        ));
        
        // Update selected lesson
        setSelectedLesson(result.data);
        
        // Clear file inputs and state
        setUploadFiles({ video: null, theory: null, homework: null });
        const videoInput = document.getElementById('video-upload') as HTMLInputElement;
        const theoryInput = document.getElementById('theory-upload') as HTMLInputElement;
        const homeworkInput = document.getElementById('homework-upload') as HTMLInputElement;
        if (videoInput) videoInput.value = '';
        if (theoryInput) theoryInput.value = '';
        if (homeworkInput) homeworkInput.value = '';
        
        // Clear upload status after 3 seconds
        setTimeout(() => {
          setUploadStatus('');
          setUploadProgress({});
        }, 3000);
        
      } else {
        throw new Error(result.message || 'Неизвестная ошибка при загрузке файлов');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      
      let errorMessage = 'Ошибка при загрузке файлов';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Загрузка была прервана из-за превышения времени ожидания';
      } else if (err.message && (err.message.includes('NetworkError') || err.message.includes('Failed to fetch'))) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setUploadStatus('');
      setUploadProgress({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление видеокурсами</h1>
        <p className="text-gray-600">Управляйте модулями, уроками и загружайте контент</p>
      </div>
      
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
        {/* Modules List */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">📚 Модули курса</h2>
            <button
              onClick={handleAddModule}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Добавить
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {modules.map((module) => (
              <div
                key={module._id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedModule?._id === module._id
                    ? 'bg-indigo-50 border-2 border-indigo-200'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
                onClick={() => setSelectedModule(module)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    <p className="text-xs text-blue-600 mt-2">{module.lessons?.length || 0} уроков</p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditModule(module);
                      }}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-800 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module._id);
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

        {/* Lessons List */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              🎥 {selectedModule ? `Уроки: ${selectedModule.title}` : 'Выберите модуль'}
            </h2>
            {selectedModule && (
              <button
                onClick={handleAddLesson}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Урок
              </button>
            )}
          </div>
          
          {selectedModule ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(selectedModule.lessons || []).map((lesson) => (
                <div
                  key={lesson._id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                      <p className="text-sm text-gray-600">{lesson.duration}</p>
                      <div className="flex space-x-2 mt-2">
                        {lesson.videoUrl && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Видео</span>}
                        {lesson.theoryPdf && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Теория</span>}
                        {lesson.homeworkPdf && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">ДЗ</span>}
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLesson(lesson);
                        }}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(lesson._id);
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
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📚</div>
              <p>Выберите модуль для просмотра уроков</p>
            </div>
          )}
        </div>

        {/* Content Upload */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📤 {selectedLesson ? `Контент: ${selectedLesson.title}` : 'Выберите урок'}
          </h2>
          
          {selectedLesson ? (
            <div className="space-y-4">
              {/* Upload Status */}
              {uploadStatus && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                  {uploadStatus}
                </div>
              )}

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Видео урока</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🎥</div>
                  <p className="text-sm text-gray-600 mb-2">
                    {uploadFiles.video ? uploadFiles.video.name : 'Загрузить видео'}
                  </p>
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    id="video-upload"
                    onChange={(e) => handleFileSelect('video', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="video-upload" className="bg-blue-600 text-white px-3 py-1 rounded text-sm cursor-pointer hover:bg-blue-700">
                    {uploadFiles.video ? 'Изменить файл' : 'Выбрать файл'}
                  </label>
                  {uploadProgress.video !== undefined && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: `${uploadProgress.video}%`}}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Theory PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Теория (PDF)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📄</div>
                  <p className="text-sm text-gray-600 mb-2">
                    {uploadFiles.theory ? uploadFiles.theory.name : 'Загрузить теорию'}
                  </p>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    id="theory-upload"
                    onChange={(e) => handleFileSelect('theory', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="theory-upload" className="bg-green-600 text-white px-3 py-1 rounded text-sm cursor-pointer hover:bg-green-700">
                    {uploadFiles.theory ? 'Изменить PDF' : 'Выбрать PDF'}
                  </label>
                  {uploadProgress.theory !== undefined && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: `${uploadProgress.theory}%`}}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Homework PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Домашнее задание (PDF)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <p className="text-sm text-gray-600 mb-2">
                    {uploadFiles.homework ? uploadFiles.homework.name : 'Загрузить ДЗ'}
                  </p>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    id="homework-upload"
                    onChange={(e) => handleFileSelect('homework', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="homework-upload" className="bg-orange-600 text-white px-3 py-1 rounded text-sm cursor-pointer hover:bg-orange-700">
                    {uploadFiles.homework ? 'Изменить PDF' : 'Выбрать PDF'}
                  </label>
                  {uploadProgress.homework !== undefined && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{width: `${uploadProgress.homework}%`}}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleUploadContent}
                disabled={loading || (!uploadFiles.video && !uploadFiles.theory && !uploadFiles.homework)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Загрузка...' : 'Сохранить контент'}
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📤</div>
              <p>Выберите урок для загрузки контента</p>
            </div>
          )}
        </div>
      </div>

      {/* Module Form Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {editingModule ? 'Редактировать модуль' : 'Добавить модуль'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название модуля</label>
                <input
                  type="text"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Введите название модуля"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                  placeholder="Краткое описание модуля"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowModuleForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveModule}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Form Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {editingLesson ? 'Редактировать урок' : 'Добавить урок'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название урока</label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Введите название урока"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Длительность</label>
                <input
                  type="text"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Например: 25 мин"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowLessonForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveLesson}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

export default VideoCourseManagement;