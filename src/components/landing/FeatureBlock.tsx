import React from 'react';
import Image from 'next/image';
import { FeatureBlock as FeatureBlockType } from '../../frontend/types';
import { FiCheck, FiStar, FiAward, FiClock, FiBook, FiTrendingUp } from 'react-icons/fi';

interface FeatureBlockProps {
  data: FeatureBlockType;
  isAdmin?: boolean;
  onEdit?: () => void;
}

const FeatureBlock: React.FC<FeatureBlockProps> = ({ data, isAdmin = false, onEdit }) => {
  const { title, description, features } = data;

  // Функция для выбора иконки по названию
  const getIconByName = (iconName: string) => {
    switch (iconName) {
      case 'check':
        return <FiCheck className="w-6 h-6" />;
      case 'star':
        return <FiStar className="w-6 h-6" />;
      case 'award':
        return <FiAward className="w-6 h-6" />;
      case 'clock':
        return <FiClock className="w-6 h-6" />;
      case 'book':
        return <FiBook className="w-6 h-6" />;
      case 'trending-up':
        return <FiTrendingUp className="w-6 h-6" />;
      default:
        return <FiCheck className="w-6 h-6" />;
    }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 mr-4">
                  {getIconByName(feature.icon || 'check')}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureBlock;