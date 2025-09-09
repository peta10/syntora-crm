'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { ProfileForm } from '@/app/components/auth/ProfileForm';
import { UpdatePasswordForm } from '@/app/components/auth/UpdatePasswordForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Shield } from 'lucide-react';
import { 
  ProfileFormData, 
  ProfileFormErrors, 
  UpdatePasswordFormData, 
  UpdatePasswordFormErrors 
} from '@/app/types/auth';
import { 
  validateProfileForm, 
  validateUpdatePasswordForm, 
  hasValidationErrors 
} from '@/app/utils/validation';
import { ROLE_DISPLAY_NAMES, ROLE_COLORS } from '@/app/utils/roles';

export default function ProfileSettingsPage() {
  const { user, profile, updateProfile, updatePassword } = useAuth();
  
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<UpdatePasswordFormErrors>({});
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleProfileUpdate = async (formData: ProfileFormData) => {
    // Clear previous errors
    setProfileErrors({});
    
    // Client-side validation
    const validationErrors = validateProfileForm(formData);
    if (hasValidationErrors(validationErrors)) {
      setProfileErrors(validationErrors);
      return;
    }

    setIsProfileLoading(true);

    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        setProfileErrors({ 
          general: error.message || 'Failed to update profile. Please try again.' 
        });
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setProfileErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (formData: UpdatePasswordFormData) => {
    // Clear previous errors
    setPasswordErrors({});
    
    // Client-side validation
    const validationErrors = validateUpdatePasswordForm(formData);
    if (hasValidationErrors(validationErrors)) {
      setPasswordErrors(validationErrors);
      return;
    }

    setIsPasswordLoading(true);

    try {
      const { error } = await updatePassword(formData.newPassword);
      
      if (error) {
        setPasswordErrors({ 
          general: error.message || 'Failed to update password. Please try again.' 
        });
      }
    } catch (err) {
      console.error('Password update error:', err);
      setPasswordErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-gray-400">Manage your account and security preferences</p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-lg">
                  {profile?.full_name || user?.user_metadata?.full_name || 'Anonymous User'}
                </div>
                <div className="text-sm text-gray-400 font-normal">
                  {user?.email}
                </div>
              </div>
              {profile?.role && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${ROLE_COLORS[profile.role]} ml-auto`}>
                  {ROLE_DISPLAY_NAMES[profile.role]}
                </div>
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-gray-700/50">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6E86FF] data-[state=active]:to-[#FF6BBA] data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6E86FF] data-[state=active]:to-[#FF6BBA] data-[state=active]:text-white">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileForm
                  profile={profile}
                  onSubmit={handleProfileUpdate}
                  isLoading={isProfileLoading}
                  errors={profileErrors}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <UpdatePasswordForm
                  onSubmit={handlePasswordUpdate}
                  isLoading={isPasswordLoading}
                  errors={passwordErrors}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
