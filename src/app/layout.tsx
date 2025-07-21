'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './components/Providers';
import Navigation from './components/layout/Navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize desktop features when the app starts
    const initDesktop = async () => {
      try {
        const { initializeDesktopFeatures } = await import('./utils/desktop');
        await initializeDesktopFeatures();
      } catch (error) {
        console.error('Failed to initialize desktop features:', error);
      }
    };

    initDesktop();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Syntora Todo</title>
        <meta name="description" content="Personal task manager with spiritual focus" />
        <link rel="icon" href="/FinalFavicon.png" />
      </head>
      <body className={`${inter.className} bg-black`}>
        <Providers>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 lg:pl-64">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
} 