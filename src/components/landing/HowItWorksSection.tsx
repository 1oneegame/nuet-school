import React from 'react';

interface Step {
  title: string;
  icon: React.ReactNode;
}

interface HowItWorksSectionProps {
  steps: Step[];
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ steps }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Как это работает</h2>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center max-w-xs"
            >
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute transform translate-x-32">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-blue-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 8l4 4m0 0l-4 4m4-4H3" 
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;