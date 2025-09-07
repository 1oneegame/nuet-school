import React, { useState } from 'react';
import { FaqBlock as FaqBlockType } from '../../types/frontend';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface FaqBlockProps {
  data: FaqBlockType;
  isAdmin?: boolean;
  onEdit?: () => void;
}

const FaqBlock: React.FC<FaqBlockProps> = ({ data, isAdmin = false, onEdit }) => {
  const { title, description, faqs } = data;
  const [openIndex, setOpenIndex] = useState<number | null>(0); // По умолчанию открыт первый вопрос

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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

        <div className="max-w-3xl mx-auto">
          {faqs.length > 0 ? (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex justify-between items-center p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={openIndex === index}
                  >
                    <span className="font-medium text-lg">{faq.question}</span>
                    {openIndex === index ? (
                      <FiChevronUp className="flex-shrink-0 ml-2" />
                    ) : (
                      <FiChevronDown className="flex-shrink-0 ml-2" />
                    )}
                  </button>
                  
                  {openIndex === index && (
                    <div className="p-5 bg-white">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">Вопросы отсутствуют</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FaqBlock;