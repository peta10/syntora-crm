'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { UpdatePasswordFormData, UpdatePasswordFormErrors } from '@/app/types/auth';
import { Input } from '@/app/components/auth/ui/Input';
import { Button } from '@/app/components/auth/ui/Button';
import { ErrorMessage } from '@/app/components/auth/ui/ErrorMessage';
import { validateStrongPassword } from '@/app/utils/validation';

interface UpdatePasswordFormProps {
  onSubmit: (data: UpdatePasswordFormData) => Promise<void>;
  isLoading: boolean;
  errors: UpdatePasswordFormErrors;
  onSuccess?: () => void;
}

export function UpdatePasswordForm({ onSubmit, isLoading, errors, onSuccess }: UpdatePasswordFormProps) {
  const [formData, setFormData] = useState<UpdatePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (field: keyof UpdatePasswordFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    setIsSuccess(false);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      setIsSuccess(true);
      onSuccess?.();
      
      // Clear form and success message after 3 seconds
      setTimeout(() => {
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      setIsSuccess(false);
    }
  };

  const isFormValid = () => {
    const passwordValidation = validateStrongPassword(formData.newPassword);
    return (
      formData.currentPassword &&
      formData.newPassword &&
      formData.confirmPassword &&
      passwordValidation.isValid &&
      formData.newPassword === formData.confirmPassword &&
      formData.currentPassword !== formData.newPassword
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Change Password</h3>
        
        {/* Success Message */}
        {isSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-400">Password updated successfully!</span>
          </div>
        )}

        {/* Current Password */}
        <div className="relative">
          <Input
            type={showPasswords.current ? 'text' : 'password'}
            label="Current Password"
            placeholder="Enter your current password"
            value={formData.currentPassword}
            onChange={handleInputChange('currentPassword')}
            disabled={isLoading}
            error={errors.currentPassword}
            required
            autoComplete="current-password"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute right-3 top-[42px] transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            disabled={isLoading}
            aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
          >
            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* New Password */}
        <div className="relative">
          <Input
            type={showPasswords.new ? 'text' : 'password'}
            label="New Password"
            placeholder="Enter your new password"
            value={formData.newPassword}
            onChange={handleInputChange('newPassword')}
            disabled={isLoading}
            error={errors.newPassword}
            required
            autoComplete="new-password"
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute right-3 top-[42px] transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            disabled={isLoading}
            aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
          >
            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Confirm New Password */}
        <div className="relative">
          <Input
            type={showPasswords.confirm ? 'text' : 'password'}
            label="Confirm New Password"
            placeholder="Confirm your new password"
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
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute right-3 top-[42px] transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            disabled={isLoading}
            aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
          >
            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <ErrorMessage message={errors.general} />

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={!isFormValid()}
        className="w-full"
      >
        {isLoading ? 'Updating password...' : 'Update Password'}
      </Button>
    </form>
  );
}
