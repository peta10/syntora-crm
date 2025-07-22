'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';
import { supabase } from '@/app/lib/supabase/client';

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Just check if Supabase is initialized
    const initCheck = async () => {
      try {
        await supabase.from('daily_todos').select('id').limit(1);
      } catch (error) {
        console.error('Supabase initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initCheck();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
} 