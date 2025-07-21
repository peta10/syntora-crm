'use client';

import { ThemeProvider } from 'next-themes';
import { GamingProvider } from '@/app/contexts/GamingContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <GamingProvider>
        {children}
      </GamingProvider>
    </ThemeProvider>
  );
} 