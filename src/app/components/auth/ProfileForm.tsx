'use client';

import React, { useState, useEffect } from 'react';
import { ProfileFormData, ProfileFormErrors, UserProfile } from '@/app/types/auth';
import { Input } from '@/app/components/auth/ui/Input';
import { Button } from '@/app/components/auth/ui/Button';
import { ErrorMessage } from '@/app/components/auth/ui/ErrorMessage';
import { validateUrl } from '@/app/utils/validation';

interface ProfileFormProps {
  profile: UserProfile | null;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading: boolean;
  errors: ProfileFormErrors;
  onSuccess?: () => void;
}

export function ProfileForm({ profile, onSubmit, isLoading, errors, onSuccess }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    website: '',
    location: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        website: profile.website || '',
        location: profile.location || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof ProfileFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      setIsSuccess(true);
      onSuccess?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      setIsSuccess(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.firstName ||
      formData.lastName ||
      formData.username ||
      formData.bio ||
      formData.website ||
      formData.location
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {isSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-green-400">Profile updated successfully!</span>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            label="First Name"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            disabled={isLoading}
            error={errors.firstName}
            autoComplete="given-name"
          />
          
          <Input
            type="text"
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            disabled={isLoading}
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>

        <Input
          type="text"
          label="Username"
          placeholder="Choose a unique username"
          value={formData.username}
          onChange={handleInputChange('username')}
          disabled={isLoading}
          error={errors.username}
          autoComplete="username"
        />
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Additional Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={handleInputChange('bio')}
            disabled={isLoading}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#6E86FF] focus:border-transparent transition-all duration-200 hover:bg-gray-800/70 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.bio && (
              <p className="text-sm text-red-400" role="alert">
                {errors.bio}
              </p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {formData.bio?.length || 0}/500
            </p>
          </div>
        </div>

        <Input
          type="url"
          label="Website"
          placeholder="https://your-website.com"
          value={formData.website}
          onChange={handleInputChange('website')}
          disabled={isLoading}
          error={errors.website}
          autoComplete="url"
        />

        <Input
          type="text"
          label="Location"
          placeholder="City, Country"
          value={formData.location}
          onChange={handleInputChange('location')}
          disabled={isLoading}
          error={errors.location}
        />
      </div>

      <ErrorMessage message={errors.general} />

      <div className="flex gap-3">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!isFormValid()}
          className="flex-1"
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (profile) {
              setFormData({
                firstName: profile.first_name || '',
                lastName: profile.last_name || '',
                username: profile.username || '',
                bio: profile.bio || '',
                website: profile.website || '',
                location: profile.location || '',
              });
            }
            setIsSuccess(false);
          }}
          disabled={isLoading}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
