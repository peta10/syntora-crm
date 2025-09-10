'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/app/lib/supabase/client';
import { type EmailOtpType } from '@supabase/supabase-js';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type') as EmailOtpType | null;
        const next = searchParams.get('next') ?? '/update-password';

        if (!token_hash || !type) {
          setError('Missing confirmation parameters');
          setIsLoading(false);
          return;
        }

        const supabase = getSupabaseClient();

        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash,
        });

        if (error) {
          console.error('Auth confirmation error:', error);
          setError(error.message);
          // Redirect to error page
          router.push('/auth/auth-code-error');
          return;
        }

        // Success - redirect to next page
        router.push(next);
      } catch (err) {
        console.error('Unexpected error during confirmation:', err);
        setError('An unexpected error occurred');
        router.push('/auth/auth-code-error');
      } finally {
        setIsLoading(false);
      }
    };

    handleConfirmation();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6E86FF] mx-auto mb-4"></div>
          <p className="text-white">Confirming your request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Confirmation Failed</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-[#6E86FF] text-white rounded-lg hover:bg-[#5A73FF] transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // This shouldn't normally be reached, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <p className="text-white">Processing...</p>
      </div>
    </div>
  );
}
