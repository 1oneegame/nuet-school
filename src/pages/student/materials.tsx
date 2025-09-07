import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { studentAPI } from '@/utils/api';

interface Material {
  _id: string;
  title: string;
  description?: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  category: string;
  isVisible: boolean;
  uploadedAt: string;
}

const Materials: React.FC = () => {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data } = await studentAPI.getMaterials();
      if (data?.success) {
        setMaterials(data.data.filter((material: Material) => material.isVisible));
      } else if (Array.isArray(data)) {
        setMaterials((data as any[]).filter((m: any) => m.isVisible));
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
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
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'document': return '📄';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'image': return '🖼️';
      default: return '📁';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'document': return 'Документ';
      case 'video': return 'Видео';
      case 'audio': return 'Аудио';
      case 'image': return 'Изображение';
      default: return 'Другое';
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(materials.map(m => m.category)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка материалов...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Учебные материалы - 240 School</title>
        <meta name="description" content="Дополнительные учебные материалы для студентов 240 School" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToDashboard}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>Назад к дашборду</span>
                </button>
                <div className="text-2xl font-bold text-indigo-600">240 SCHOOL</div>
              </div>
              <div className="text-sm text-gray-500">Учебные материалы</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Учебные материалы</h1>
            <p className="text-gray-600">Дополнительные материалы для изучения</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Поиск</label>
                <input
                  type="text"
                  placeholder="Поиск по названию или описанию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">Все категории</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>
                      {getCategoryName(category)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Materials Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100 text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Материалы не найдены</h3>
              <p className="text-gray-600">Попробуйте изменить параметры поиска или фильтры</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div key={material._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{getCategoryIcon(material.category)}</div>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {getCategoryName(material.category)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {material.title}
                    </h3>
                    
                    {material.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {material.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex justify-between">
                        <span>Размер:</span>
                        <span>{formatFileSize(material.fileSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Загружено:</span>
                        <span>{formatDate(material.uploadedAt)}</span>
                      </div>
                    </div>
                    
                    <a
                      href={material.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-center block"
                    >
                      Скачать файл
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Materials;