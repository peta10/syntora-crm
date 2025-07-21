'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
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
  X
} from 'lucide-react';

const Navigation = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Achievements', href: '/achievements', icon: Trophy },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Sales', href: '/sales', icon: DollarSign },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Focus', href: '/focus', icon: Timer },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

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
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/SyntoraLogo1.webp"
              alt="Syntora Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Syntora
            </span>
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