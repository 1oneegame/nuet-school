import React from 'react';

const TestimonialsSection: React.FC = () => {
  // Данные отзывов (в реальном приложении будут загружаться из API)
  const testimonials = [
    {
      id: 1,
      text: 'Благодаря курсу я смог поднять свой балл на НУЕТ с 75 до 95. Особенно помогли тренажеры и видеоуроки по сложным темам.',
      author: 'Алексей Смирнов',
      role: 'Студент, поступил в МГУ',
      avatar: '/images/testimonials/avatar1.jpg'
    },
    {
      id: 2,
      text: 'Очень удобная система подготовки. Занималась всего 3 месяца перед экзаменом и смогла набрать достаточно баллов для поступления на бюджет.',
      author: 'Екатерина Иванова',
      role: 'Студентка, поступила в СПбГУ',
      avatar: '/images/testimonials/avatar2.jpg'
    },
    {
      id: 3,
      text: 'Как преподаватель, я рекомендую эту платформу своим ученикам. Здесь собраны все необходимые материалы для качественной подготовки к НУЕТ.',
      author: 'Ольга Петрова',
      role: 'Преподаватель математики',
      avatar: '/images/testimonials/avatar3.jpg'
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Отзывы наших студентов</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-gray-50 p-6 rounded-lg shadow-sm"
            >
              <p className="text-gray-600 italic mb-6">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback для отсутствующих изображений
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/48';
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.author}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;