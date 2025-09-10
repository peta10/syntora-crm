'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { NewPasswordFormData, NewPasswordFormErrors } from '@/app/types/auth';
import { Input } from '@/app/components/auth/ui/Input';
import { Button } from '@/app/components/auth/ui/Button';
import { ErrorMessage } from '@/app/components/auth/ui/ErrorMessage';
import { validateStrongPassword } from '@/app/utils/validation';

interface NewPasswordFormProps {
  onSubmit: (data: NewPasswordFormData) => Promise<void>;
  isLoading: boolean;
  errors: NewPasswordFormErrors;
  isSuccess: boolean;
}

export function NewPasswordForm({ onSubmit, isLoading, errors, isSuccess }: NewPasswordFormProps) {
  const [formData, setFormData] = useState<NewPasswordFormData>({
    password: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  const handleInputChange = (field: keyof NewPasswordFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.password || !formData.confirmPassword) {
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const passwordValidation = validateStrongPassword(formData.password);
    if (!passwordValidation.isValid) {
      return;
    }

    await onSubmit(formData);
  };

  const passwordValidation = validateStrongPassword(formData.password);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  if (isSuccess) {
    return (
      <div className="flex flex-col w-full gap-4 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">
          Password updated successfully!
        </h3>
        
        <p className="text-gray-400 text-sm mb-6">
          Your password has been changed. You&apos;ll be redirected to your dashboard shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Set New Password</h2>
        <p className="text-gray-400 text-sm">
          Choose a strong password for your account
        </p>
      </div>

      <ErrorMessage message={errors.general} />

      <div className="space-y-4">
        {/* New Password */}
        <div>
          <div className="relative">
            <Input
              type={showPasswords.password ? 'text' : 'password'}
              placeholder="New password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('password')}
              className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors p-1"
            >
              {showPasswords.password ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <ErrorMessage message={errors.password} />
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  passwordValidation.strength === 'weak' ? 'bg-red-500' :
                  passwordValidation.strength === 'medium' ? 'bg-yellow-500' :
                  passwordValidation.strength === 'strong' ? 'bg-green-500' : 'bg-gray-600'
                }`} />
                <span className="text-gray-400 capitalize">
                  {passwordValidation.strength} password
                </span>
              </div>
              <div className="space-y-1">
                {passwordValidation.issues.map((issue, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-red-400">
                    <div className="w-1 h-1 bg-red-400 rounded-full" />
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <div className="relative">
            <Input
              type={showPasswords.confirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={errors.confirmPassword}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirmPassword')}
              className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors p-1"
            >
              {showPasswords.confirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <ErrorMessage message={errors.confirmPassword} />
          
          {/* Password Match Indicator */}
          {formData.confirmPassword && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                passwordsMatch ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className={passwordsMatch ? 'text-green-400' : 'text-red-400'}>
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </span>
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        disabled={!passwordValidation.isValid || !passwordsMatch}
        className="mt-6"
      >
        {isLoading ? 'Updating Password...' : 'Update Password'}
      </Button>
    </form>
  );
}
