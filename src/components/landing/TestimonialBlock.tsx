import React, { useState } from 'react';
import Image from 'next/image';
import { TestimonialBlock as TestimonialBlockType } from '../../frontend/types';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface TestimonialBlockProps {
  data: TestimonialBlockType;
  isAdmin?: boolean;
  onEdit?: () => void;
}

const TestimonialBlock: React.FC<TestimonialBlockProps> = ({ data, isAdmin = false, onEdit }) => {
  const { title, description, testimonials } = data;
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

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

        {testimonials.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 relative rounded-full overflow-hidden flex-shrink-0">
                  {testimonials[activeIndex].avatar ? (
                    <Image
                      src={testimonials[activeIndex].avatar}
                      alt={testimonials[activeIndex].author}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      {testimonials[activeIndex].author.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <blockquote className="text-lg italic text-gray-600 mb-4">
                    "{testimonials[activeIndex].text}"
                  </blockquote>
                  <div className="font-semibold">{testimonials[activeIndex].author}</div>
                  <div className="text-gray-500 text-sm">{testimonials[activeIndex].role}</div>
                </div>
              </div>
            </div>

            {/* Навигация */}
            {testimonials.length > 1 && (
              <div className="flex justify-center mt-6 gap-4">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
                  aria-label="Предыдущий отзыв"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${index === activeIndex ? 'bg-primary-600' : 'bg-gray-300'}`}
                      aria-label={`Отзыв ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
                  aria-label="Следующий отзыв"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">Отзывы отсутствуют</div>
        )}
      </div>
    </section>
  );
};

export default TestimonialBlock;