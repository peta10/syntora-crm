export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignInFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface SignUpFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  general?: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface ResetPasswordFormErrors {
  email?: string;
  general?: string;
}

export interface UpdatePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export interface ProfileFormData {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  website?: string;
  location?: string;
}

export interface ProfileFormErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  website?: string;
  location?: string;
  general?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  location?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export interface RolePermissions {
  canManageUsers: boolean;
  canManageContent: boolean;
  canViewAnalytics: boolean;
  canAccessAdmin: boolean;
}

// Auth state interface
export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Auth actions interface
export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  updateProfile: (profileData: Partial<ProfileFormData>) => Promise<{ error: any }>;
  refreshUser: () => Promise<{ error: any }>;
  hasPermission: (permission: keyof RolePermissions) => boolean;
}

export type AuthContextType = AuthState & AuthActions;

export interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  publicPaths?: string[];
}

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}
