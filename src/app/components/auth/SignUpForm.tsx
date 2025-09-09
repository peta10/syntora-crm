'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { SignUpFormData, SignUpFormErrors } from '@/app/types/auth';
import { Input } from '@/app/components/auth/ui/Input';
import { Button } from '@/app/components/auth/ui/Button';
import { ErrorMessage } from '@/app/components/auth/ui/ErrorMessage';
import { validateEmail, validateStrongPassword } from '@/app/utils/validation';

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  isLoading: boolean;
  errors: SignUpFormErrors;
}

export function SignUpForm({ onSubmit, onGoogleSignIn, isLoading, errors }: SignUpFormProps) {
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: keyof SignUpFormData) => (
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
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      return;
    }
    
    if (!validateEmail(formData.email)) {
      return;
    }

    const passwordValidation = validateStrongPassword(formData.password);
    if (!passwordValidation.isValid) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    await onSubmit(formData);
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      validateEmail(formData.email) &&
      validateStrongPassword(formData.password).isValid &&
      formData.password === formData.confirmPassword
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div className="w-full flex flex-col gap-3">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            disabled={isLoading}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <Input
            type="text"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            disabled={isLoading}
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange('password')}
            disabled={isLoading}
            error={errors.password}
            required
            autoComplete="new-password"
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

        {/* Confirm Password */}
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            disabled={isLoading}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            disabled={isLoading}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
          disabled={!isFormValid()}
          className="w-full"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
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
