'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { RoleGuardProps } from '@/app/types/auth';
import { hasRole } from '@/app/utils/roles';

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { profile, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] rounded-xl flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 bg-white rounded-full animate-bounce"></div>
          </div>
          <p className="text-gray-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (!hasRole(profile, allowedRoles)) {
    return fallback || (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            Access Denied
          </h2>
          
          <p className="text-gray-400 mb-6">
            You don&apos;t have permission to access this page.
          </p>
          
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
