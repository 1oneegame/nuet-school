import React from 'react';
import { HowItWorksBlock as HowItWorksBlockType } from '../../frontend/types';

interface HowItWorksBlockProps {
  data: HowItWorksBlockType;
  isAdmin?: boolean;
  onEdit?: () => void;
}

const HowItWorksBlock: React.FC<HowItWorksBlockProps> = ({ data, isAdmin = false, onEdit }) => {
  const { title, description, steps } = data;

  return (
    <section className="py-16 bg-gray-50">
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

        <div className="relative">
          {/* Соединительная линия для десктопа */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-primary-200 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold mb-6">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksBlock;