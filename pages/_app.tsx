import type { AppProps } from 'next/app';
import React from 'react';
import '@/index.css';
import App from '@/App';

export default function MyApp({ Component, pageProps }: AppProps) {
  // We render the existing SPA root component. Client-side routing is handled by Wouter inside the App.
  return <App />;
}
