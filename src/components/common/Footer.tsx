import React from 'react';
import Link from 'next/link';
import { FaVk, FaTelegram, FaYoutube } from 'react-icons/fa';

interface FooterProps {
  brandName?: string;
  contactEmail?: string;
}

const Footer: React.FC<FooterProps> = ({ 
  brandName = 'НУЕТ Подготовка',
  contactEmail = 'contact@nuet-prep.com'
}) => {
  const currentYear = new Date().getFullYear();
  
  // Only show links to available pages to avoid 404 errors
  const footerLinks = [
    { title: 'Навигация', links: [
      { name: 'Главная', href: '/' },
      { name: 'Дашборд', href: '/dashboard' },
      { name: 'Авторизация', href: '/auth' },
    ]},
    { title: 'Студенческие ресурсы', links: [
      { name: 'Видеокурс', href: '/student/video-course' },
      { name: 'Тесты и практика', href: '/student/practice' },
      { name: 'Critical Thinking', href: '/student/critical-thinking' },
      { name: 'Материалы', href: '/student/materials' },
    ]},
    { title: 'Администрирование', links: [
      { name: 'Админ панель', href: '/admin' },
      { name: 'Управление пользователями', href: '/admin/users' },
    ]},
  ];

  const socialLinks = [
    { name: 'VK', icon: <FaVk />, href: 'https://vk.com/' },
    { name: 'Telegram', icon: <FaTelegram />, href: 'https://t.me/' },
    { name: 'YouTube', icon: <FaYoutube />, href: 'https://youtube.com/' },
  ];

  return (
    <footer className="bg-gray-100 pt-12 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Бренд и описание */}
          <div>
            <Link href="/" className="text-xl font-bold text-blue-600">
              {brandName}
            </Link>
            <p className="mt-4 text-gray-600">
              Персональная подготовка к НУЕТ и развитие критического мышления.
              Видеоуроки, тесты и тренировочные экзамены для эффективной подготовки.
            </p>
          </div>

          {/* Ссылки */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-base text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Нижняя часть футера */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            © {currentYear} {brandName}. Все права защищены.
          </div>
          
          {/* Социальные сети */}
          <div className="flex space-x-6">
            {socialLinks.map((social) => (
              <a 
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 transition-colors"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
            
            <a 
              href={`mailto:${contactEmail}`}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              {contactEmail}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;