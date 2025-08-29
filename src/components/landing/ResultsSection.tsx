import React from 'react';

const ResultsSection: React.FC = () => {
  // Данные о результатах (в реальном приложении будут загружаться из API)
  const stats = [
    { value: '95%', label: 'студентов улучшили свои результаты' },
    { value: '80+', label: 'баллов в среднем набирают наши ученики' },
    { value: '1000+', label: 'выпускников поступили в ведущие вузы' },
    { value: '200+', label: 'часов видеоматериалов' },
  ];

  return (
    <section className="py-16 bg-blue-700 text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Результаты наших студентов</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 bg-blue-800 bg-opacity-50 rounded-lg"
            >
              <span className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</span>
              <span className="text-blue-100">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-xl mb-6 max-w-3xl mx-auto">
            Наша методика подготовки помогла сотням студентов достичь высоких результатов на НУЕТ 
            и поступить в престижные университеты.
          </p>
          <button className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-medium transition-all">
            Присоединиться к ним
          </button>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;