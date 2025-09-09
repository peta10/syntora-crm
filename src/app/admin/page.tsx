'use client';

import React from 'react';
import { RoleGuard } from '@/app/components/auth/RoleGuard';
import { UserRole } from '@/app/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Shield, 
  Activity, 
  Settings,
  TrendingUp,
  Database
} from 'lucide-react';

function AdminDashboard() {
  const adminStats = [
    { title: 'Total Users', value: '1,248', change: '+12%', icon: Users, color: 'text-blue-400' },
    { title: 'Active Sessions', value: '342', change: '+8%', icon: Activity, color: 'text-green-400' },
    { title: 'Security Events', value: '23', change: '-15%', icon: Shield, color: 'text-yellow-400' },
    { title: 'System Health', value: '99.9%', change: '+0.1%', icon: TrendingUp, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400">System administration and management</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-gray-400">
                    <span className="text-green-400">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Manage Users</h4>
                  <p className="text-gray-400 text-sm">Add, edit, or remove user accounts</p>
                </div>
                <button className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm">
                  Manage
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Role Assignment</h4>
                  <p className="text-gray-400 text-sm">Assign roles and permissions</p>
                </div>
                <button className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm">
                  Assign
                </button>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Application Config</h4>
                  <p className="text-gray-400 text-sm">Configure system settings</p>
                </div>
                <button className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm">
                  Configure
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Database Backup</h4>
                  <p className="text-gray-400 text-sm">Manage data backups and restoration</p>
                </div>
                <button className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm">
                  Backup
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Recent Admin Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'User role updated', user: 'john.doe@example.com', time: '2 hours ago' },
                { action: 'System backup completed', user: 'System', time: '4 hours ago' },
                { action: 'New user registered', user: 'jane.smith@example.com', time: '6 hours ago' },
                { action: 'Security policy updated', user: 'admin@syntora.io', time: '1 day ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">{activity.action}</p>
                    <p className="text-gray-400 text-xs">{activity.user}</p>
                  </div>
                  <span className="text-gray-500 text-xs">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <AdminDashboard />
    </RoleGuard>
  );
}
