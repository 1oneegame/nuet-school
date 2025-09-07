import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PDFViewer from '../../../components/common/PDFViewer';
import { studentAPI } from '@/utils/api';

interface LessonData {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  theory: {
    title: string;
    content: string[];
    keyPoints: string[];
  };
  materials: {
    id: number;
    title: string;
    type: 'pdf' | 'doc' | 'ppt' | 'txt';
    size: string;
    downloadUrl: string;
  }[];
  moduleTitle: string;
  moduleId: string;
  theoryPdf?: string;
  homeworkPdf?: string;
}

interface PDFMaterial {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  filePath: string;
  uploadedAt: string;
}

const LessonPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState<'theory' | 'materials'>('theory');
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [pdfMaterials, setPdfMaterials] = useState<PDFMaterial[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch PDF materials from API
  const fetchPdfMaterials = async () => {
    try {
      const { data } = await studentAPI.getMaterials();
      setPdfMaterials((data && data.data) || data || []);
    } catch (err) {
      console.error('Error fetching PDF materials:', err);
    }
  };

  // Fetch lesson data from API
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data } = await studentAPI.getLesson(String(id));
        setLessonData(data);
        setError(null);
        
        // Fetch PDF materials
        await fetchPdfMaterials();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки урока');
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [id]);



  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'ppt': return '📊';
      case 'txt': return '📋';
      default: return '📁';
    }
  };

  const handleDownload = (material: LessonData['materials'][0]) => {
    // In a real app, this would trigger actual file download
    const link = document.createElement('a');
    link.href = material.downloadUrl;
    link.download = material.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка урока...</p>
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
          <Link href="/student/video-course" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            ← Назад к курсу
          </Link>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Урок не найден</h1>
          <p className="text-gray-600 mb-4">Запрашиваемый урок не существует</p>
          <Link href="/student/video-course" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            ← Назад к курсу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{lessonData.title} | 240 School</title>
        <meta name="description" content={`Урок: ${lessonData.title}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link href="/student/video-course" className="text-blue-600 hover:text-blue-800 mr-4">
                  ← Назад к курсу
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{lessonData.title}</h1>
                  <p className="text-sm text-gray-600">Продолжительность: {lessonData.duration}</p>
                  <p className="text-sm text-gray-500">Модуль: {lessonData.moduleTitle}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Video Player */}
          <div className="mb-6">
            <div className="bg-black rounded-lg overflow-hidden">
              {lessonData.videoUrl ? (
                 <video 
                   className="w-full aspect-video"
                   controls
                   preload="metadata"
                   controlsList="nodownload"
                   onContextMenu={(e) => e.preventDefault()}
                 >
                   <source src={lessonData.videoUrl} type="video/mp4" />
                   <source src={lessonData.videoUrl} type="video/webm" />
                   <source src={lessonData.videoUrl} type="video/ogg" />
                   Ваш браузер не поддерживает воспроизведение видео.
                 </video>
              ) : (
                <div className="bg-gray-900 aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🎥</div>
                    <p className="text-lg">Видео недоступно</p>
                    <p className="text-sm opacity-75">Видеоурок еще не загружен</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('theory')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'theory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📚 Теория
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'materials'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📁 Материалы
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-md">

            {/* Theory Tab */}
            {activeTab === 'theory' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {lessonData.theory.title}
                  </h3>
                  
                  <div className="space-y-4">
                    {lessonData.theory.content.map((paragraph, index) => (
                      <p key={index} className="text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  
                  {lessonData.theory.keyPoints.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">Ключевые моменты:</h4>
                      <ul className="space-y-2">
                        {lessonData.theory.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span className="text-blue-800">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* PDF Materials Section */}
                {pdfMaterials.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Теоретические материалы (PDF)
                    </h3>
                    
                    {!selectedPdf ? (
                      <div className="space-y-3">
                        {pdfMaterials.map((material) => (
                          <div key={material.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{material.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <span>{material.fileName}</span>
                                <span className="mx-2">•</span>
                                <span>{material.fileSize}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedPdf(material.filePath)}
                              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Открыть PDF
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">
                            {pdfMaterials.find(m => m.filePath === selectedPdf)?.title || 'PDF Документ'}
                          </h4>
                          <button
                            onClick={() => setSelectedPdf(null)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Закрыть PDF
                          </button>
                        </div>
                        <PDFViewer pdfUrl={selectedPdf} />
                      </div>
                    )}
                  </div>
                )}

                {/* Theory PDF from lesson data */}
                {lessonData.theoryPdf && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Теоретический материал урока
                    </h3>
                    <PDFViewer pdfUrl={lessonData.theoryPdf} />
                  </div>
                )}
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Материалы для скачивания</h2>
                
                {lessonData.materials && lessonData.materials.length > 0 ? (
                  <>
                    <div className="grid gap-4">
                      {lessonData.materials.map((material) => (
                        <div key={material.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{getFileIcon(material.type)}</span>
                            <div>
                              <h3 className="font-medium text-gray-900">{material.title}</h3>
                              <p className="text-sm text-gray-600">
                                {material.type.toUpperCase()} • {material.size}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(material)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                          >
                            <span className="mr-2">⬇️</span>
                            Скачать
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-start">
                        <span className="text-yellow-600 text-xl mr-3">💡</span>
                        <div>
                          <h3 className="font-medium text-yellow-900 mb-1">Совет</h3>
                          <p className="text-yellow-800 text-sm">
                            Рекомендуем скачать все материалы перед началом изучения урока для более эффективного обучения.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📁</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Материалы не загружены</h3>
                    <p className="text-gray-600">
                      Дополнительные материалы для этого урока пока не добавлены.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors">
              ← Предыдущий урок
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              Следующий урок →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonPage;