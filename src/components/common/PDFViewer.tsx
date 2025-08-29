import React, { useState, useEffect } from 'react';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, title, className = '' }) => {
  const [scale, setScale] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle zoom in
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  // Reset zoom
  const handleResetZoom = () => {
    setScale(1.0);
  };

  // Handle page navigation
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Handle direct page input
  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle PDF load
  const handlePDFLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  // Handle PDF error
  const handlePDFError = () => {
    setIsLoading(false);
    setError('Ошибка загрузки PDF-файла');
  };

  // Download PDF
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF
  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки PDF</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* PDF Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Предыдущая страница"
            >
              ←
            </button>
            
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={currentPage}
                onChange={handlePageInput}
                min={1}
                max={totalPages}
                className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">из {totalPages}</span>
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Следующая страница"
            >
              →
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Уменьшить"
            >
              🔍-
            </button>
            
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3.0}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Увеличить"
            >
              🔍+
            </button>
            
            <button
              onClick={handleResetZoom}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Сбросить масштаб"
            >
              100%
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
            title="Скачать PDF"
          >
            ⬇️
          </button>
          
          <button
            onClick={handlePrint}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Печать"
          >
            🖨️
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка PDF...</p>
            </div>
          </div>
        )}
        
        <div className="p-4 bg-gray-100 min-h-[600px] overflow-auto">
          <div className="flex justify-center">
            <iframe
              src={`${pdfUrl}#page=${currentPage}&zoom=${scale * 100}`}
              className="border border-gray-300 shadow-lg"
              style={{
                width: `${800 * scale}px`,
                height: `${1000 * scale}px`,
                minWidth: '400px',
                minHeight: '500px'
              }}
              onLoad={handlePDFLoad}
              onError={handlePDFError}
              title={title || 'PDF Document'}
            />
          </div>
        </div>
      </div>

      {/* PDF Info */}
      {title && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            PDF-документ • Страница {currentPage} из {totalPages}
          </p>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;