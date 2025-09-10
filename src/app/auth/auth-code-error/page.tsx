'use client';

import { useRouter } from 'next/navigation';

export default function AuthCodeErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          Authentication Error
        </h1>
        
        <p className="text-gray-400 mb-6">
          The authentication link is invalid, expired, or has already been used. Please try again.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/reset-password')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Request New Reset Link
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>If you continue to have problems, please contact support.</p>
        </div>
      </div>
    </div>
  );
}
