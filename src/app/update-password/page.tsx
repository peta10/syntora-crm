'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { SignInLayout } from '@/app/components/auth/SignInLayout';
import { NewPasswordForm } from '@/app/components/auth/NewPasswordForm';
import { NewPasswordFormData, NewPasswordFormErrors } from '@/app/types/auth';
import { validateNewPasswordForm, hasValidationErrors } from '@/app/utils/validation';

export default function UpdatePasswordPage() {
  const [errors, setErrors] = useState<NewPasswordFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { updatePassword, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we have the required tokens from the reset email
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    // If no tokens, redirect to reset password page
    if (!accessToken || !refreshToken) {
      router.push('/reset-password');
      return;
    }
  }, [searchParams, router]);

  // Redirect to dashboard if already authenticated with new password
  useEffect(() => {
    if (isSuccess && user) {
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }, [isSuccess, user, router]);

  const handleUpdatePassword = async (formData: NewPasswordFormData) => {
    // Clear previous errors
    setErrors({});
    
    // Client-side validation
    const validationErrors = validateNewPasswordForm(formData);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(formData.password);
      
      if (error) {
        setErrors({ 
          general: error.message || 'Failed to update password. Please try again.' 
        });
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error('Update password error:', err);
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignInLayout>
      <NewPasswordForm
        onSubmit={handleUpdatePassword}
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
    </SignInLayout>
  );
}
