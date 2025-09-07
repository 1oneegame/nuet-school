import React from 'react';
import { ResultsBlock as ResultsBlockType } from '../../types/frontend';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Регистрация компонентов Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ResultsBlockProps {
  data: ResultsBlockType;
  isAdmin?: boolean;
  onEdit?: () => void;
}

const ResultsBlock: React.FC<ResultsBlockProps> = ({ data, isAdmin = false, onEdit }) => {
  const { title, description, stats, cta } = data;

  // Конфигурация для графика
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };



  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        {isAdmin && (
          <button
            onClick={onEdit}
            className="mb-4 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Редактировать блок
          </button>
        )}

        <div className="text-center mb-12">
          <h2 className="heading-2 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{description}</p>
        </div>

        {/* Статистика */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        {cta && (
          <div className="text-center">
            <a href={cta.url} className="btn-primary">
              {cta.text}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResultsBlock;