'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/app/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AuthContextType, AuthUser, UserProfile, UserRole, ProfileFormData, RolePermissions } from '@/app/types/auth';
import { hasPermission } from '@/app/utils/roles';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Prevent infinite loading state - max 5 seconds (reduced from 10)
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - forcing loading state to false');
        setLoading(false);
        setError('Authentication timeout. Please refresh the page if needed.');
      }
    }, 5000);

    const getSession = async () => {
      try {
        console.log('AuthContext: Starting getSession...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('AuthContext: Session result:', { session: !!session, error: sessionError });
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError.message);
        } else {
          setSession(session);
          setUser(session?.user as AuthUser ?? null);
          setError(null);
          console.log('AuthContext: Set user:', !!session?.user);
          
          // FIXED: Also load profile on initial session load (not just SIGNED_IN)
          if (session?.user) {
            (async () => {
              try {
                console.log('AuthContext: Loading profile for existing session:', session.user.email);
                
                const { data: existingProfile, error: fetchError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();

                if (fetchError && fetchError.code !== 'PGRST116') {
                  console.error('Error fetching profile on initial load:', fetchError);
                  return;
                }

                if (existingProfile) {
                  console.log('AuthContext: Profile loaded successfully - Role:', existingProfile.role);
                  setProfile(existingProfile as UserProfile);
                } else {
                  console.log('AuthContext: No profile found for user:', session.user.email);
                }
              } catch (error) {
                console.error('Error loading profile on initial session:', error);
              }
            })();
          }
        }
      } catch (err) {
        console.error('Unexpected error getting session:', err);
        setError('Failed to authenticate. Please try again.');
      } finally {
        console.log('AuthContext: Setting loading to false');
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    };

    getSession();

    // Set up auth state change listener with error handling
    let subscription: any = null;
    try {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event: any, session: any) => {
          setSession(session);
          setUser(session?.user as AuthUser ?? null);
          setLoading(false);
          setError(null);

        // Create or update user profile when user signs in
        if (session?.user && event === 'SIGNED_IN') {
          // Don't block the auth flow if profile operations fail
          (async () => {
            try {
              console.log('AuthContext: Attempting to fetch/create profile for user:', session.user.email);
              
              // For Parker's account, use the actual user ID from auth
              const isParkerAccount = session.user.email === 'parker@syntora.io';
              const profileId = session.user.id;
              
              const { data: existingProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

              if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching profile:', fetchError);
                return; // Don't continue if we can't fetch the profile
              }

              const profileData = {
                id: profileId,
                email: session.user.email,
                first_name: session.user.user_metadata?.first_name || 
                           (isParkerAccount ? 'Parker' : ''),
                last_name: session.user.user_metadata?.last_name || 
                          (isParkerAccount ? 'Gawne' : ''),
                full_name: session.user.user_metadata?.full_name || 
                          (isParkerAccount ? 'Parker Gawne' : ''),
                username: session.user.user_metadata?.username || 
                         (isParkerAccount ? 'parker' : ''),
                avatar_url: session.user.user_metadata?.avatar_url || '',
                role: existingProfile?.role || (isParkerAccount ? UserRole.SUPERADMIN : UserRole.USER),
                updated_at: new Date().toISOString(),
              };

              const { error } = await supabase
                .from('profiles')
                .upsert(profileData, {
                  onConflict: 'id'
                });

              if (error) {
                console.error('Error updating profile:', error);
              } else {
                console.log('AuthContext: Profile updated successfully');
                // Set the profile in state
                setProfile(profileData as UserProfile);
              }
            } catch (error) {
              console.error('Error creating/updating profile:', error);
            }
          })();
        }

        // Clear profile when user signs out
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      } // End of onAuthStateChange callback
      );
      subscription = authSubscription;
    } catch (err) {
      console.error('Error setting up auth listener:', err);
      setLoading(false);
      clearTimeout(loadingTimeout);
    }

    return () => {
      clearTimeout(loadingTimeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
      }
      
      return { error };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during sign in';
      setError(errorMessage);
      return { error: new Error(errorMessage) };
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      });
      
      if (error) {
        setError(error.message);
      }
      
      return { error };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during sign up';
      setError(errorMessage);
      return { error: new Error(errorMessage) };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        setError(error.message);
      }
      
      return { error };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during Google sign in';
      setError(errorMessage);
      return { error: new Error(errorMessage) };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
      }
      
      return { error };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during sign out';
      setError(errorMessage);
      return { error: new Error(errorMessage) };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?type=recovery&next=/update-password`,
      });
      
      if (error) {
        setError(error.message);
      }
      
      return { error };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during password reset';
      setError(errorMessage);
      return { error: new Error(errorMessage) };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        setError(error.message);
      }
      
      return { error };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during password update';
      setError(errorMessage);
      return { error: new Error(errorMessage) };
    }
  };

  const updateProfile = async (profileData: Partial<ProfileFormData>) => {
    try {
      setError(null);
      
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          username: profileData.username,
          full_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        }
      });

      if (authError) {
        setError(authError.message);
        return { error: authError };
      }

      // Update profile in database if profile exists
      if (profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            username: profileData.username,
            full_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
            bio: profileData.bio,
            website: profileData.website,
            location: profileData.location,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (profileError) {
          setError(profileError.message);
          return { error: profileError };
        }
      }
      
      return { error: null };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during profile update';
      setError(errorMessage);
      return { error: new Error(errorMessage) };
    }
  };

  const refreshUser = async () => {
    try {
      setError(null);
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      setUser(user as AuthUser);
      return { error: null };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while refreshing user';
      setError(errorMessage);
      return { error: new Error(errorMessage) };
    }
  };

  const checkPermission = (permission: keyof RolePermissions) => {
    return hasPermission(profile, permission);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshUser,
    hasPermission: checkPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 