import { UserRole, RolePermissions, UserProfile } from '@/app/types/auth';

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.USER]: {
    canManageUsers: false,
    canManageContent: false,
    canViewAnalytics: false,
    canAccessAdmin: false,
    canManageSystem: false,
    canDeleteUsers: false,
    canManageRoles: false,
    canViewLogs: false,
    canBackupData: false,
  },
  [UserRole.MODERATOR]: {
    canManageUsers: false,
    canManageContent: true,
    canViewAnalytics: true,
    canAccessAdmin: false,
    canManageSystem: false,
    canDeleteUsers: false,
    canManageRoles: false,
    canViewLogs: false,
    canBackupData: false,
  },
  [UserRole.ADMIN]: {
    canManageUsers: true,
    canManageContent: true,
    canViewAnalytics: true,
    canAccessAdmin: true,
    canManageSystem: false,
    canDeleteUsers: false,
    canManageRoles: false,
    canViewLogs: true,
    canBackupData: false,
  },
  [UserRole.SUPERADMIN]: {
    canManageUsers: true,
    canManageContent: true,
    canViewAnalytics: true,
    canAccessAdmin: true,
    canManageSystem: true,
    canDeleteUsers: true,
    canManageRoles: true,
    canViewLogs: true,
    canBackupData: true,
  },
};

export function getUserPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[UserRole.USER];
}

export function hasPermission(
  profile: UserProfile | null,
  permission: keyof RolePermissions
): boolean {
  if (!profile) return false;
  
  const permissions = getUserPermissions(profile.role);
  return permissions[permission];
}

export function hasRole(profile: UserProfile | null, roles: UserRole[]): boolean {
  if (!profile) return false;
  return roles.includes(profile.role);
}

export function canAccessRoute(
  profile: UserProfile | null,
  requiredRoles?: UserRole[]
): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return hasRole(profile, requiredRoles);
}

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.USER]: 'User',
  [UserRole.MODERATOR]: 'Moderator',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.SUPERADMIN]: 'Super Administrator',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.USER]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  [UserRole.MODERATOR]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [UserRole.ADMIN]: 'bg-red-500/20 text-red-400 border-red-500/30',
  [UserRole.SUPERADMIN]: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};
