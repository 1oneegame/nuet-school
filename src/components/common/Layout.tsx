import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'НУЕТ Подготовка - Эффективная подготовка к экзаменам',
  description = 'Платформа для подготовки к НУЕТ и развития критического мышления. Видеокурсы, тренировочные тесты и полезные материалы.',
  keywords = 'НУЕТ, подготовка к НУЕТ, критическое мышление, видеокурс, тренировка, экзамены',
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;