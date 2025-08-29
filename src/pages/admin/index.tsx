import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import VideoCourseManagement from '../../components/admin/VideoCourseManagement';
import NUETPracticeManagement from '../../components/admin/NUETPracticeManagement';
import CriticalThinkingManagement from '../../components/admin/CriticalThinkingManagement';
import UserManagement from '../../components/admin/UserManagement';
import AdminLogin from '../../components/admin/AdminLogin';
import useAdminAuth from '../../hooks/useAdminAuth';

interface Material {
  _id: string;
  title: string;
  originalName: string;
  description: string;
  category: string;
  fileSize: number;
  uploadDate: string;
  isVisible: boolean;
  filePath: string;
}

const AdminDashboard = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, login, logout } = useAdminAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [showCriticalThinkingModal, setShowCriticalThinkingModal] = useState(false);
  
  // States for file management
  const [materials, setMaterials] = useState<Material[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState('document');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Functions for file management
  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/admin/materials');
      const data = await response.json();
      if (data.success) {
        setMaterials(data.data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  // Load materials when Other Content section is active
  React.useEffect(() => {
    if (activeSection === 'other-content') {
      fetchMaterials();
    }
  }, [activeSection]);

  const handleLogout = () => {
    logout();
  };

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      setUploadMessage('Пожалуйста, выберите файл и введите название');
      return;
    }

    setIsUploading(true);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);
    formData.append('description', uploadDescription);
    formData.append('category', uploadCategory);
    formData.append('isVisible', isVisible.toString());

    try {
      const response = await fetch('/api/admin/materials', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setUploadMessage('Файл успешно загружен!');
        setUploadFile(null);
        setUploadTitle('');
        setUploadDescription('');
        setUploadCategory('document');
        setIsVisible(true);
        fetchMaterials(); // Refresh the list
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setUploadMessage(data.message || 'Ошибка при загрузке файла');
      }
    } catch (error) {
      setUploadMessage('Ошибка при загрузке файла');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот материал?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/materials', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: materialId }),
      });

      const data = await response.json();
      if (data.success) {
        fetchMaterials(); // Refresh the list
      } else {
        alert('Ошибка при удалении материала');
      }
    } catch (error) {
      alert('Ошибка при удалении материала');
      console.error('Delete error:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const menuItems = [
    { id: 'overview', title: 'Обзор', icon: '📊' },
    { id: 'users', title: 'Пользователи', icon: '👥' },
    { id: 'video-courses', title: 'Видеокурсы', icon: '🎥' },
    { id: 'nuet-practice', title: 'NUET Practice', icon: '📝' },
    { id: 'critical-thinking', title: 'Critical Thinking', icon: '🧠' },
    { id: 'other-content', title: 'Other Content', icon: '📁' },
    { id: 'settings', title: 'Настройки', icon: '⚙️' }
  ];

  // Показываем загрузку во время проверки авторизации
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Показываем форму входа, если пользователь не авторизован
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={login} />;
  }

  return (
    <>
      <Head>
        <title>Административная панель - 240 School</title>
        <meta name="description" content="Панель администратора для управления платформой 240 School" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-indigo-600">240 SCHOOL</div>
                <div className="text-sm text-gray-500">Административная панель</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">Администратор</div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-lg min-h-screen">
            <nav className="mt-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-6 py-3 text-left hover:bg-indigo-50 transition-colors ${
                    activeSection === item.id ? 'bg-indigo-100 border-r-4 border-indigo-500 text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            {activeSection === 'overview' && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Добро пожаловать в административную панель</h1>
                  <p className="text-gray-600">Управляйте всеми аспектами платформы 240 School</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Последняя активность</h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">👤</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Новый студент зарегистрировался</p>
                        <p className="text-sm text-gray-600">Айдар Нурланов присоединился к платформе</p>
                      </div>
                      <div className="text-sm text-gray-500">5 мин назад</div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">📚</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Курс обновлен</p>
                        <p className="text-sm text-gray-600">Добавлены новые материалы в "Критическое мышление"</p>
                      </div>
                      <div className="text-sm text-gray-500">1 час назад</div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">🎯</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Высокий результат</p>
                        <p className="text-sm text-gray-600">Студент получил 215 баллов на пробном НУЕТ</p>
                      </div>
                      <div className="text-sm text-gray-500">3 часа назад</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'users' && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление пользователями</h1>
                  <p className="text-gray-600">Управляйте доступом пользователей к платформе</p>
                </div>
                <UserManagement />
              </div>
            )}

            {activeSection === 'video-courses' && (
              <VideoCourseManagement />
            )}

            {activeSection === 'nuet-practice' && (
              <NUETPracticeManagement />
            )}

            {activeSection === 'critical-thinking' && (
              <CriticalThinkingManagement />
            )}

            {activeSection === 'critical-thinking-old' && (
               <div>
                 <div className="mb-8">
                   <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление Critical Thinking</h1>
                   <p className="text-gray-600">Создавайте и редактируйте задания на критическое мышление</p>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Create Question Section */}
                   <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                     <h2 className="text-xl font-bold text-gray-900 mb-4">🧠 Создать задание</h2>
                     <div className="space-y-4">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Тип задания</label>
                         <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                           <option>Логические выводы</option>
                           <option>Анализ аргументов</option>
                           <option>Причинно-следственные связи</option>
                           <option>Интерпретация данных</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Уровень сложности</label>
                         <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                           <option>Базовый</option>
                           <option>Средний</option>
                           <option>Продвинутый</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Текст задания</label>
                         <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32" placeholder="Введите текст задания..."></textarea>
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Варианты ответов</label>
                         <div className="space-y-2">
                           <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Вариант A" />
                           <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Вариант B" />
                           <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Вариант C" />
                           <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Вариант D" />
                         </div>
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Правильный ответ</label>
                         <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                           <option>A</option>
                           <option>B</option>
                           <option>C</option>
                           <option>D</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Объяснение правильного ответа</label>
                         <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24" placeholder="Подробное объяснение, почему этот ответ правильный..."></textarea>
                       </div>
                       <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium">Создать задание</button>
                     </div>
                   </div>

                   {/* Existing Questions */}
                   <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                     <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Существующие задания</h2>
                     <div className="space-y-3 max-h-96 overflow-y-auto">
                       <div className="p-4 bg-gray-50 rounded-lg">
                         <div className="flex justify-between items-start mb-2">
                           <span className="text-sm font-medium text-purple-600">Логические выводы</span>
                           <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Базовый</span>
                         </div>
                         <p className="text-sm text-gray-700 mb-2">Если все студенты изучают математику, и Айдар - студент...</p>
                         <div className="flex space-x-2">
                           <button className="text-blue-600 hover:text-blue-800 text-xs">Редактировать</button>
                           <button className="text-green-600 hover:text-green-800 text-xs">Объяснение</button>
                           <button className="text-red-600 hover:text-red-800 text-xs">Удалить</button>
                         </div>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-lg">
                         <div className="flex justify-between items-start mb-2">
                           <span className="text-sm font-medium text-purple-600">Анализ аргументов</span>
                           <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Средний</span>
                         </div>
                         <p className="text-sm text-gray-700 mb-2">Проанализируйте следующий аргумент и определите его слабые стороны...</p>
                         <div className="flex space-x-2">
                           <button className="text-blue-600 hover:text-blue-800 text-xs">Редактировать</button>
                           <button className="text-green-600 hover:text-green-800 text-xs">Объяснение</button>
                           <button className="text-red-600 hover:text-red-800 text-xs">Удалить</button>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Bulk Operations */}
                 <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                   <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Массовые операции</h2>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="text-center">
                       <div className="text-3xl mb-2">📤</div>
                       <h3 className="font-medium mb-2">Импорт заданий</h3>
                       <p className="text-sm text-gray-600 mb-3">Загрузите JSON файл с заданиями</p>
                       <input type="file" accept=".json" className="hidden" id="import-questions" />
                       <label htmlFor="import-questions" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer text-sm">
                         Выбрать файл
                       </label>
                     </div>
                     <div className="text-center">
                       <div className="text-3xl mb-2">📥</div>
                       <h3 className="font-medium mb-2">Экспорт заданий</h3>
                       <p className="text-sm text-gray-600 mb-3">Скачать все задания в JSON</p>
                       <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                         Скачать
                       </button>
                     </div>
                     <div className="text-center">
                       <div className="text-3xl mb-2">🔄</div>
                       <h3 className="font-medium mb-2">Обновить объяснения</h3>
                       <p className="text-sm text-gray-600 mb-3">Массовое редактирование объяснений</p>
                       <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm">
                         Редактировать
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             )}







            {activeSection === 'other-content' && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Other Content</h1>
                  <p className="text-gray-600">Управление дополнительными материалами для студентов</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Загрузить новый файл</h2>
                  
                  {uploadMessage && (
                    <div className={`mb-4 p-4 rounded-lg ${
                      uploadMessage.includes('успешно') 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {uploadMessage}
                    </div>
                  )}
                  
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Название *</label>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Введите название файла"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                      <textarea
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        placeholder="Краткое описание файла"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                      <select 
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="document">Документ</option>
                        <option value="video">Видео</option>
                        <option value="audio">Аудио</option>
                        <option value="image">Изображение</option>
                        <option value="other">Другое</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Файл *</label>
                      <input
                        id="file-upload"
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is-visible"
                        checked={isVisible}
                        onChange={(e) => setIsVisible(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is-visible" className="ml-2 block text-sm text-gray-900">
                        Видимый для студентов
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className={`px-6 py-2 rounded-lg transition-colors ${
                        isUploading
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isUploading ? 'Загрузка...' : 'Загрузить файл'}
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Загруженные файлы ({materials.length})</h2>
                  
                  {materials.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📁</div>
                      <p className="text-gray-500">Файлы не найдены. Загрузите первый файл выше.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Размер</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата загрузки</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {materials.map((material) => (
                            <tr key={material._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{material.title}</div>
                                <div className="text-sm text-gray-500">{material.originalName}</div>
                                {material.description && (
                                  <div className="text-sm text-gray-400 mt-1">{material.description}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  material.category === 'document' ? 'bg-blue-100 text-blue-800' :
                                  material.category === 'video' ? 'bg-purple-100 text-purple-800' :
                                  material.category === 'audio' ? 'bg-green-100 text-green-800' :
                                  material.category === 'image' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {material.category === 'document' ? 'Документ' :
                                   material.category === 'video' ? 'Видео' :
                                   material.category === 'audio' ? 'Аудио' :
                                   material.category === 'image' ? 'Изображение' : 'Другое'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatFileSize(material.fileSize)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(material.uploadDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  material.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {material.isVisible ? 'Видимый' : 'Скрытый'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a
                                  href={material.filePath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                  Скачать
                                </a>
                                <button 
                                  onClick={() => handleDeleteMaterial(material._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Удалить
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Настройки системы</h1>
                  <p className="text-gray-600">Конфигурируйте параметры платформы</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Общие настройки</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Название платформы</label>
                      <input
                        type="text"
                        defaultValue="240 School"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email поддержки</label>
                      <input
                        type="email"
                        defaultValue="support@240school.kz"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Максимальное количество попыток теста</label>
                      <input
                        type="number"
                        defaultValue="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notifications"
                        defaultChecked
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                        Включить email уведомления
                      </label>
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
                      Сохранить настройки
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      
      {/* Critical Thinking Management Modal */}
      {showCriticalThinkingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Управление задачами критического мышления</h2>
              <button
                onClick={() => setShowCriticalThinkingModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <CriticalThinkingManagement />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;