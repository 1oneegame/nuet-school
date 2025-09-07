import '../frontend/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { authManager } from '../utils/authManager';
import '../utils/testAuth';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    authManager.checkAuthStatus();
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>НУЕТ Подготовка</title>
        <meta name="description" content="Персональная подготовка к НУЕТ" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;