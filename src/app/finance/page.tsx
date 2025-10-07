'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { DollarSign, CreditCard, BarChart3, FileText } from 'lucide-react';
import Image from 'next/image';

// Dynamically import components to reduce initial bundle size
const RevenueTable = dynamic(() => import('@/app/components/finance/revenue/RevenueTable'), { ssr: false });
const ExpenseTable = dynamic(() => import('@/app/components/finance/expenses/ExpenseTable'), { ssr: false });
const AnalyticsDashboard = dynamic(() => import('@/app/components/finance/analytics/AnalyticsDashboard'), { ssr: false });
const FinancialReports = dynamic(() => import('@/app/components/finance/reports/FinancialReports'), { ssr: false });

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'expenses' | 'analytics' | 'reports'>('revenue');

  const tabs = [
    { id: 'revenue' as const, label: 'Revenue', icon: DollarSign, description: 'Track and manage revenue' },
    { id: 'expenses' as const, label: 'Expenses', icon: CreditCard, description: 'Track and categorize expenses' },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3, description: 'Financial insights and KPIs' },
    { id: 'reports' as const, label: 'Reports', icon: FileText, description: 'Financial statements' },
  ];

  return (
    <div className="min-h-screen bg-gray-900/95 backdrop-blur-sm text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Image
            src="/FinalFavicon.webp"
            alt="Syntora Logo"
            width={48}
            height={48}
            className="rounded-xl"
          />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Financial Management
            </h1>
            <p className="text-gray-400">Complete revenue and expense tracking with tax-compliant reporting</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }
                `}
              >
                {/* Active tab background effect */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <Icon className={`w-5 h-5 relative z-10 ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Tab Description */}
        <motion.p
          key={activeTab}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="text-sm text-gray-400 mt-3"
        >
          {tabs.find(tab => tab.id === activeTab)?.description}
        </motion.p>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'revenue' && <RevenueTable />}
        {activeTab === 'expenses' && <ExpenseTable />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'reports' && <FinancialReports />}
      </div>
    </div>
  );
}
