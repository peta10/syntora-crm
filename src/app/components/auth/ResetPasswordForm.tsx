'use client';

import React, { useState } from 'react';
import { ResetPasswordFormData, ResetPasswordFormErrors } from '@/app/types/auth';
import { Input } from '@/app/components/auth/ui/Input';
import { Button } from '@/app/components/auth/ui/Button';
import { ErrorMessage } from '@/app/components/auth/ui/ErrorMessage';
import { validateEmail } from '@/app/utils/validation';

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => Promise<void>;
  isLoading: boolean;
  errors: ResetPasswordFormErrors;
  isSuccess: boolean;
}

export function ResetPasswordForm({ onSubmit, isLoading, errors, isSuccess }: ResetPasswordFormProps) {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: '',
  });

  const handleInputChange = (field: keyof ResetPasswordFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.email) {
      return;
    }
    
    if (!validateEmail(formData.email)) {
      return;
    }

    await onSubmit(formData);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col w-full gap-4 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">
          Check your email
        </h3>
        
        <p className="text-gray-400 text-sm mb-6">
          We&apos;ve sent a password reset link to <strong>{formData.email}</strong>
        </p>
        
        <div className="text-xs text-gray-500">
          <p>Didn&apos;t receive the email? Check your spam folder or try again.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-white mb-2">
          Reset your password
        </h3>
        <p className="text-gray-400 text-sm">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange('email')}
          disabled={isLoading}
          error={errors.email}
          required
          autoComplete="email"
          autoFocus
        />

        <ErrorMessage message={errors.general} />
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={!formData.email || !validateEmail(formData.email)}
        className="w-full"
      >
        {isLoading ? 'Sending...' : 'Send reset link'}
      </Button>
    </form>
  );
}
