'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  console.log('AuthGuard: Component starting...');
  
  const { user, loading } = useAuth();
  console.log('AuthGuard: Got auth state - user:', !!user, 'loading:', loading);
  
  const router = useRouter();
  const pathname = usePathname();
  const [timeoutLoading, setTimeoutLoading] = useState(false);
  
  console.log('AuthGuard: Pathname:', pathname);


  // Fallback timeout in case AuthContext gets stuck
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && !user) {
        setTimeoutLoading(true);
        router.push('/login');
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(timeout);
  }, [loading, user, router]);

  // Pages that don't require authentication
  const publicPaths = ['/login', '/signup', '/reset-password'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) || pathname === '/login/' || pathname === '/signup/' || pathname === '/reset-password/';

  useEffect(() => {
    // If we're still loading, don't redirect yet
    if (loading) return;

    // If user is not authenticated and trying to access protected route
    if (!user && !isPublicPath) {
      router.push('/login');
      return;
    }

    // If user is authenticated and on login page, redirect to dashboard
    if (user && isPublicPath) {
      router.push('/');
      return;
    }
  }, [user, loading, router, pathname, isPublicPath]);

  // Show loading screen only briefly
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  console.log('AuthGuard: About to render - user:', !!user, 'isPublicPath:', isPublicPath, 'pathname:', pathname);

  // SIMPLIFIED: Just render everything, let individual pages handle auth
  return <>{children}</>;
}
