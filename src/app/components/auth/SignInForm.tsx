'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { SignInFormData, SignInFormErrors } from '@/app/types/auth';
import { Input } from '@/app/components/auth/ui/Input';
import { Button } from '@/app/components/auth/ui/Button';
import { ErrorMessage } from '@/app/components/auth/ui/ErrorMessage';
import { validateEmail } from '@/app/utils/validation';

interface SignInFormProps {
  onSubmit: (data: SignInFormData) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  isLoading: boolean;
  errors: SignInFormErrors;
}

export function SignInForm({ onSubmit, onGoogleSignIn, isLoading, errors }: SignInFormProps) {
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof SignInFormData) => (
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
    if (!formData.email || !formData.password) {
      return;
    }
    
    if (!validateEmail(formData.email)) {
      return;
    }

    await onSubmit(formData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
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
        />

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange('password')}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            error={errors.password}
            required
            autoComplete="current-password"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            disabled={isLoading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <ErrorMessage message={errors.general} />
      </div>

      <hr className="border-gray-700/50" />

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!formData.email || !formData.password || !validateEmail(formData.email)}
          className="w-full"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onGoogleSignIn}
          disabled={isLoading}
          className="w-full"
          icon={
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
          }
        >
          Continue with Google
        </Button>
      </div>
    </form>
  );
}
