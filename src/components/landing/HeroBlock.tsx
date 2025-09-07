import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeroBlock as HeroBlockType } from '../../types/frontend';

interface HeroBlockProps {
  data: HeroBlockType;
  isAdmin?: boolean;
  onEdit?: () => void;
}

const HeroBlock: React.FC<HeroBlockProps> = ({ data, isAdmin = false, onEdit }) => {
  const { title, subtitle, buttons } = data;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-white to-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            {isAdmin && (
              <button
                onClick={onEdit}
                className="mb-4 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Редактировать блок
              </button>
            )}
            
            <h1 className="heading-1 mb-6">{title}</h1>
            
            <p className="text-lg text-gray-600 mb-8">{subtitle}</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {buttons.map((button, index) => (
                <Link 
                  key={index}
                  href={button.url} 
                  className={`btn-${button.variant}`}
                >
                  {button.text}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="w-full max-w-lg aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
              <p className="text-primary-600 font-semibold">NUET Preparation</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBlock;