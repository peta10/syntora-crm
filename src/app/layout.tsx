'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './components/Providers';
import { GamingProvider } from '@/app/contexts/GamingContext';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { AuthGuard } from '@/app/components/auth/AuthGuard';
import { NavigationWrapper } from '@/app/components/layout/NavigationWrapper';
import { getDesktopManager } from '@/app/utils/desktop';
import TaskCompletionListener from '@/app/components/gaming/TaskCompletionListener';

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
            <AuthGuard>
              <GamingProvider>
                <TaskCompletionListener />
                <NavigationWrapper>
                  {children}
                </NavigationWrapper>
              </GamingProvider>
            </AuthGuard>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}