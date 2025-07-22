'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './components/Providers';
import Navigation from './components/layout/Navigation';
import { GamingProvider } from '@/app/contexts/GamingContext';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { getDesktopManager } from '@/app/utils/desktop';

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
        const desktopManager = getDesktopManager();
        if (desktopManager && typeof desktopManager.init === 'function') {
          await desktopManager.init();
          if (desktopManager.isDesktopApp()) {
            console.log('Desktop features initialized');
          }
        }
      } catch (error) {
        console.error('Failed to initialize desktop features:', error);
      }
    };

    // Only run in browser environment
    if (typeof window !== 'undefined') {
      initDesktop();
    }
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
          <AuthProvider>
            <GamingProvider>
              <div className="flex min-h-screen">
                <Navigation />
                <main className="flex-1 lg:pl-64">
                  {children}
                </main>
              </div>
            </GamingProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}