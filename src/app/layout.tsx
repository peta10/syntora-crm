'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './components/Providers';
import { initializeDesktopFeatures } from './utils/desktop';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize desktop features when the app starts
    initializeDesktopFeatures().catch(console.error);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Syntora Todo</title>
        <meta name="description" content="Personal task manager with spiritual focus" />
        <link rel="icon" href="/FinalFavicon.png" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
} 