import React from 'react';
import Link from 'next/link';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  buttons: Array<{
    text: string;
    href: string;
    primary: boolean;
  }>;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, buttons }) => {
  return (
    <section className="bg-gradient-to-r from-secondary-900 to-primary-800 text-white py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {title}
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {buttons.map((button, index) => (
              <Link 
                key={index} 
                href={button.href}
                className={`px-8 py-3 rounded-lg text-lg font-medium transition-all ${
                  button.primary 
                    ? 'bg-secondary-700 text-white hover:bg-secondary-600' 
                    : 'bg-transparent border border-secondary-600 text-white hover:bg-secondary-700/40'
                }`}
              >
                {button.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;