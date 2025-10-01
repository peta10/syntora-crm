'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/app/contexts/AuthContext';
import { RolePermissions } from '@/app/types/auth';
import {
  LayoutDashboard,
  CheckSquare,
  Trophy,
  BarChart2,
  Users,
  Briefcase,
  Timer,
  Settings,
  DollarSign,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresPermission?: keyof RolePermissions;
}

const Navigation = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const { hasPermission } = useAuth();
  
  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Reports', href: '/reports', icon: BarChart2, requiresPermission: 'canViewAnalytics' as keyof RolePermissions },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Sales', href: '/sales', icon: DollarSign },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Focus', href: '/focus', icon: Timer },
    { name: 'Admin', href: '/admin', icon: Settings, requiresPermission: 'canAccessAdmin' as keyof RolePermissions },
  ].filter(item => !item.requiresPermission || hasPermission?.(item.requiresPermission));

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6 text-gray-400" />
        ) : (
          <Menu className="w-6 h-6 text-gray-400" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50 transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/SyntoraLogo1.webp"
              alt="Syntora Logo"
              width={152}
              height={34}
              className="rounded-lg"
            />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 mb-2 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  active
                    ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white shadow-lg hover:shadow-[#6E86FF]/50'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] rounded-xl opacity-20 blur-lg transition-opacity group-hover:opacity-30" />
                )}
                <Icon className={`w-5 h-5 relative ${
                  active
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-[#6E86FF]'
                }`} />
                <span className="font-medium relative">{item.name}</span>
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white ml-auto relative" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile and Sign Out */}
        {user && (
          <div className="mt-auto p-4 border-t border-gray-700/50 space-y-2">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            
            <Link
              href="/settings/profile"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all duration-200 group"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile Settings</span>
            </Link>
            
            <button
              onClick={() => signOut()}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation; 