'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardMetrics } from '@/app/types/crm';

// Mock data for demonstration
const mockDashboardData: DashboardMetrics = {
  monthlyRevenue: 125000,
  monthlyRevenueChange: 12.3,
  activeDeals: 24,
  activeDealsChange: 5,
  newContacts: 18,
  newContactsChange: 8,
  completedTasks: 142,
  totalTasks: 168,
  taskCompletionRate: 84.5,
  revenueHistory: [
    { month: 'Jan', revenue: 95000 },
    { month: 'Feb', revenue: 110000 },
    { month: 'Mar', revenue: 125000 },
    { month: 'Apr', revenue: 140000 },
    { month: 'May', revenue: 135000 },
    { month: 'Jun', revenue: 150000 },
  ],
  pipelineData: [
    { stage: 'Lead', count: 12, value: 25000 },
    { stage: 'Qualified', count: 8, value: 45000 },
    { stage: 'Proposal', count: 5, value: 125000 },
    { stage: 'Negotiation', count: 3, value: 85000 },
  ],
  recentActivities: [],
  upcomingTasks: [],
  contactInsights: {
    totalContacts: 1248,
    newThisMonth: 18,
    byType: [
      { type: 'prospect', count: 456 },
      { type: 'client', count: 234 },
      { type: 'friend', count: 345 },
      { type: 'unknown', count: 213 },
    ],
    topCompanies: [
      { company: 'Tech Corp', count: 23 },
      { company: 'Marketing Plus', count: 18 },
      { company: 'Design Studio', count: 15 },
    ]
  }
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon, description }) => {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{title}</CardTitle>
        <div className="w-8 h-8 bg-gradient-to-br from-[#6E86FF]/20 to-[#FF6BBA]/20 rounded-lg flex items-center justify-center group-hover:from-[#6E86FF]/30 group-hover:to-[#FF6BBA]/30 transition-all">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className={`text-xs flex items-center ${trendColor}`}>
          <TrendIcon className="w-4 h-4 mr-1" />
          {Math.abs(change)}% from last month
        </div>
        {description && (
          <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface RecentActivityItemProps {
  type: 'call' | 'email' | 'meeting' | 'deal';
  title: string;
  subtitle: string;
  time: string;
}

const RecentActivityItem: React.FC<RecentActivityItemProps> = ({ type, title, subtitle, time }) => {
  const getIcon = () => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4 text-blue-400" />;
      case 'email': return <Mail className="w-4 h-4 text-green-400" />;
      case 'meeting': return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'deal': return <Users className="w-4 h-4 text-yellow-400" />;
      default: return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-gray-400 truncate">{subtitle}</p>
      </div>
      <div className="text-xs text-gray-500">{time}</div>
    </div>
  );
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockDashboardData);
  const [isLoading, setIsLoading] = useState(false);

  // In a real app, you'd fetch this data from your API
  useEffect(() => {
    // fetchDashboardMetrics();
  }, []);

  const recentActivities = [
    { type: 'call' as const, title: 'Call with John Smith', subtitle: 'Tech Corp - Follow up on proposal', time: '2 hours ago' },
    { type: 'email' as const, title: 'Email sent to Sarah Johnson', subtitle: 'Marketing Plus - Project update', time: '4 hours ago' },
    { type: 'meeting' as const, title: 'Meeting scheduled', subtitle: 'Design Studio - Initial consultation', time: '6 hours ago' },
    { type: 'deal' as const, title: 'Deal moved to Negotiation', subtitle: '$45,000 - Website Redesign', time: '1 day ago' },
  ];

  const upcomingTasks = [
    { title: 'Follow up with Tech Corp', due: 'Today, 2:00 PM', priority: 'high' as const },
    { title: 'Send proposal to Marketing Plus', due: 'Tomorrow, 10:00 AM', priority: 'medium' as const },
    { title: 'Schedule demo for Design Studio', due: 'Friday, 3:00 PM', priority: 'low' as const },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <div className="w-16 h-16 border-4 border-[#6E86FF]/30 border-t-[#6E86FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Welcome back! Here&#39;s what&#39;s happening with your business.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200">
              Quick Actions
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Monthly Revenue"
            value={`$${metrics.monthlyRevenue.toLocaleString()}`}
            change={metrics.monthlyRevenueChange}
            trend="up"
            icon={<DollarSign className="w-5 h-5 text-green-400" />}
            description="Target: $150,000"
          />
          <MetricCard
            title="Active Deals"
            value={metrics.activeDeals}
            change={metrics.activeDealsChange}
            trend="up"
            icon={<Target className="w-5 h-5 text-blue-400" />}
            description="In pipeline"
          />
          <MetricCard
            title="New Contacts"
            value={metrics.newContacts}
            change={metrics.newContactsChange}
            trend="up"
            icon={<Users className="w-5 h-5 text-purple-400" />}
            description="This month"
          />
          <MetricCard
            title="Task Completion"
            value={`${metrics.taskCompletionRate}%`}
            change={5.2}
            trend="up"
            icon={<TrendingUp className="w-5 h-5 text-yellow-400" />}
            description={`${metrics.completedTasks}/${metrics.totalTasks} tasks`}
          />
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
            <CardHeader>
              <CardTitle className="text-white flex items-center group-hover:text-white/90 transition-colors">
                <BarChart3 className="w-5 h-5 mr-2 text-[#6E86FF] group-hover:text-[#6E86FF]/90 transition-colors" />
                Revenue Trend
              </CardTitle>
              <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Monthly revenue over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {metrics.revenueHistory.map((item, index) => (
                  <div key={item.month} className="flex flex-col items-center space-y-2">
                    <div 
                      className="bg-gradient-to-t from-[#6E86FF] to-[#FF6BBA] rounded-t-sm group-hover:from-[#6E86FF]/90 group-hover:to-[#FF6BBA]/90 transition-colors"
                      style={{ 
                        height: `${(item.revenue / Math.max(...metrics.revenueHistory.map(h => h.revenue))) * 200}px`,
                        width: '40px'
                      }}
                    />
                    <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{item.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Overview */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
            <CardHeader>
              <CardTitle className="text-white flex items-center group-hover:text-white/90 transition-colors">
                <Target className="w-5 h-5 mr-2 text-[#FF6BBA] group-hover:text-[#FF6BBA]/90 transition-colors" />
                Sales Pipeline
              </CardTitle>
              <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Deals by stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.pipelineData.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                      />
                      <span className="text-sm text-white group-hover:text-white/90 transition-colors">{stage.stage}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white group-hover:text-white/90 transition-colors">{stage.count} deals</div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">${stage.value.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <Card className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
            <CardHeader>
              <CardTitle className="text-white group-hover:text-white/90 transition-colors">Recent Activities</CardTitle>
              <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Latest interactions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentActivities.map((activity, index) => (
                  <RecentActivityItem
                    key={index}
                    type={activity.type}
                    title={activity.title}
                    subtitle={activity.subtitle}
                    time={activity.time}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
            <CardHeader>
              <CardTitle className="text-white group-hover:text-white/90 transition-colors">Upcoming Tasks</CardTitle>
              <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Tasks due soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{task.title}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                    </div>
                    <p className="text-xs text-gray-400">{task.due}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-[#6E86FF] hover:text-[#FF6BBA] transition-colors">
                View all tasks →
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Insights */}
        <div className="mt-8">
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
            <CardHeader>
              <CardTitle className="text-white flex items-center group-hover:text-white/90 transition-colors">
                <Users className="w-5 h-5 mr-2 text-[#6E86FF] group-hover:text-[#6E86FF]/90 transition-colors" />
                Contact Insights
              </CardTitle>
              <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Overview of your contact database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact Types */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">By Type</h4>
                  <div className="space-y-2">
                    {metrics.contactInsights.byType.map((type) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300 capitalize">{type.type}</span>
                        <span className="text-sm font-medium text-white">{type.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Companies */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Top Companies</h4>
                  <div className="space-y-2">
                    {metrics.contactInsights.topCompanies.map((company) => (
                      <div key={company.company} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{company.company}</span>
                        <span className="text-sm font-medium text-white">{company.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Quick Stats</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Total Contacts</span>
                      <span className="text-sm font-medium text-white">{metrics.contactInsights.totalContacts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">New This Month</span>
                      <span className="text-sm font-medium text-white">{metrics.contactInsights.newThisMonth}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 