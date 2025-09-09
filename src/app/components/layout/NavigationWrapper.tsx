'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Navigation from './Navigation';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export function NavigationWrapper({ children }: NavigationWrapperProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Pages that shouldn't show navigation
  const noNavPaths = ['/login', '/signup', '/reset-password'];
  const shouldShowNav = user && !noNavPaths.includes(pathname);

  console.log('NavigationWrapper - pathname:', pathname, 'shouldShowNav:', shouldShowNav, 'user:', !!user);

  if (!shouldShowNav) {
    console.log('NavigationWrapper: Rendering login page layout');
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 lg:pl-64">
        {children}
      </main>
    </div>
  );
}
