'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { SignInLayout } from './SignInLayout';
import { ResetPasswordForm } from './ResetPasswordForm';
import { ResetPasswordFormData, ResetPasswordFormErrors } from '@/app/types/auth';
import { validateResetPasswordForm, hasValidationErrors } from '@/app/utils/validation';

export function ResetPasswordPage() {
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, user } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleResetPassword = async (formData: ResetPasswordFormData) => {
    // Clear previous errors
    setErrors({});
    
    // Client-side validation
    const validationErrors = validateResetPasswordForm(formData);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword(formData.email);
      
      if (error) {
        setErrors({ 
          general: error.message || 'Failed to send reset email. Please try again.' 
        });
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignInLayout>
      <ResetPasswordForm
        onSubmit={handleResetPassword}
        isLoading={isLoading}
        errors={errors}
        isSuccess={isSuccess}
      />
      
      {!isSuccess && (
        <div className="w-full text-center mt-4">
          <span className="text-xs text-gray-400">
            Remember your password?{' '}
            <button
              type="button"
              className="underline text-[#6E86FF] hover:text-[#FF6BBA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6E86FF] rounded"
              onClick={() => router.push('/login')}
            >
              Sign in here
            </button>
          </span>
        </div>
      )}
      
      {isSuccess && (
        <div className="w-full text-center mt-4">
          <button
            type="button"
            className="text-sm text-[#6E86FF] hover:text-[#FF6BBA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6E86FF] rounded"
            onClick={() => router.push('/login')}
          >
            ← Back to sign in
          </button>
        </div>
      )}
    </SignInLayout>
  );
}
