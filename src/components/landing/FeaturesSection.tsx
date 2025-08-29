import React from 'react';
import Link from 'next/link';

interface Feature {
  title: string;
  description: string;
  href: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Наши возможности</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Link 
              key={index} 
              href={feature.href}
              className="group bg-gray-50 hover:bg-blue-50 rounded-xl p-6 transition-all hover:shadow-lg"
            >
              <div className="h-full flex flex-col">
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  {feature.description}
                </p>
                <div className="text-blue-600 font-medium flex items-center">
                  Подробнее
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;