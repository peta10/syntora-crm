'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { SignInLayout } from './SignInLayout';
import { SignInForm } from './SignInForm';
import { SignInFormData, SignInFormErrors } from '@/app/types/auth';
import { validateSignInForm, hasValidationErrors } from '@/app/utils/validation';

export function SignInPage() {
  console.log('SignInPage: Component starting to render...');
  
  const [errors, setErrors] = useState<SignInFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  console.log('SignInPage: About to call useAuth...');
  const { signIn, signInWithGoogle, user } = useAuth();
  console.log('SignInPage: useAuth completed, user:', !!user);
  
  const router = useRouter();

  // Debug logging
  console.log('SignInPage rendered - user:', !!user, 'isLoading:', isLoading, 'errors:', errors);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignIn = async (formData: SignInFormData) => {
    // Clear previous errors
    setErrors({});
    
    // Client-side validation
    const validationErrors = validateSignInForm(formData);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setErrors({ 
          general: error.message || 'Failed to sign in. Please try again.' 
        });
      }
      // Success will be handled by the AuthContext redirect
    } catch (err) {
      console.error('Sign in error:', err);
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrors({});
    setIsLoading(true);

    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setErrors({ 
          general: error.message || 'Failed to sign in with Google. Please try again.' 
        });
      }
      // OAuth will handle redirect
    } catch (err) {
      console.error('Google sign in error:', err);
      setErrors({ 
        general: 'Failed to sign in with Google. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignInLayout>
      <SignInForm
        onSubmit={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        isLoading={isLoading}
        errors={errors}
      />
      
      <div className="w-full text-center mt-4">
        <span className="text-xs text-gray-400">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="underline text-[#6E86FF] hover:text-[#FF6BBA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6E86FF] rounded"
            onClick={() => router.push('/signup')}
          >
            Sign up, it&apos;s free!
          </button>
        </span>
      </div>
      
      <div className="w-full text-center mt-2">
        <button
          type="button"
          className="text-xs text-gray-400 hover:text-[#6E86FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6E86FF] rounded"
          onClick={() => router.push('/reset-password')}
        >
          Forgot your password?
        </button>
      </div>
    </SignInLayout>
  );
}
