'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { SignInLayout } from './SignInLayout';
import { SignUpForm } from './SignUpForm';
import { SignUpFormData, SignUpFormErrors } from '@/app/types/auth';
import { validateSignUpForm, hasValidationErrors } from '@/app/utils/validation';

export function SignUpPage() {
  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle, user } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignUp = async (formData: SignUpFormData) => {
    // Clear previous errors
    setErrors({});
    
    // Client-side validation
    const validationErrors = validateSignUpForm(formData);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const metadata = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      };

      const { error } = await signUp(formData.email, formData.password, metadata);
      
      if (error) {
        setErrors({ 
          general: error.message || 'Failed to create account. Please try again.' 
        });
      } else {
        // Show success message
        setErrors({
          general: 'Account created successfully! Please check your email to verify your account.'
        });
      }
      // Success will be handled by the AuthContext redirect
    } catch (err) {
      console.error('Sign up error:', err);
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
      <SignUpForm
        onSubmit={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
        isLoading={isLoading}
        errors={errors}
      />
      
      <div className="w-full text-center mt-4">
        <span className="text-xs text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            className="underline text-[#6E86FF] hover:text-[#FF6BBA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6E86FF] rounded"
            onClick={() => router.push('/login')}
          >
            Sign in here
          </button>
        </span>
      </div>
    </SignInLayout>
  );
}
