'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Activity, Users, Target } from 'lucide-react';
import { getFinancialKPIs, getExpensesByCategory } from '@/app/lib/finance/queries';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KPI {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('ytd');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = getStartDate(dateRange);

      // Load KPIs
      const kpiData = await getFinancialKPIs(startDate, endDate);
      
      setKpis([
        {
          label: 'Total Revenue',
          value: `$${kpiData.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          icon: <DollarSign size={24} />,
          color: 'from-[#6E86FF]/20 to-[#6E86FF]/10 border-[#6E86FF]/30',
        },
        {
          label: 'Total Expenses',
          value: `$${kpiData.total_expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          icon: <CreditCard size={24} />,
          color: 'from-[#FF6BBA]/20 to-[#FF6BBA]/10 border-[#FF6BBA]/30',
        },
        {
          label: 'Net Profit',
          value: `$${kpiData.net_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          icon: <TrendingUp size={24} />,
          color: 'from-[#34D399]/20 to-[#34D399]/10 border-[#34D399]/30',
        },
        {
          label: 'Profit Margin',
          value: `${kpiData.profit_margin.toFixed(1)}%`,
          icon: <Target size={24} />,
          color: 'from-[#B279DB]/20 to-[#B279DB]/10 border-[#B279DB]/30',
        },
        {
          label: 'MRR',
          value: `$${kpiData.mrr.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          icon: <Activity size={24} />,
          color: 'from-[#FF6BBA]/20 to-[#FF6BBA]/10 border-[#FF6BBA]/30',
        },
        {
          label: 'Burn Rate',
          value: `$${kpiData.burn_rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo`,
          icon: <PiggyBank size={24} />,
          color: 'from-[#8B5CF6]/20 to-[#8B5CF6]/10 border-[#8B5CF6]/30',
        },
      ]);

      // Load expense breakdown
      const expenses = await getExpensesByCategory(startDate, endDate);
      setExpenseBreakdown(expenses.slice(0, 8)); // Top 8 categories

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStartDate(range: string): string {
    const now = new Date();
    switch (range) {
      case 'today':
        return now.toISOString().split('T')[0];
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return weekAgo.toISOString().split('T')[0];
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return monthAgo.toISOString().split('T')[0];
      case 'quarter':
        const quarterAgo = new Date(now.setMonth(now.getMonth() - 3));
        return quarterAgo.toISOString().split('T')[0];
      case 'ytd':
        return `${now.getFullYear()}-01-01`;
      case 'year':
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        return yearAgo.toISOString().split('T')[0];
      default:
        return `${now.getFullYear()}-01-01`;
    }
  }

  const COLORS = ['#6E86FF', '#FF6BBA', '#B279DB', '#34D399', '#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899'];

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Financial Analytics</h2>
          <p className="text-gray-400">Visual insights into your business performance</p>
        </div>
        
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="ytd">Year to Date</option>
          <option value="year">Last 12 Months</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${kpi.color} border rounded-lg p-6 relative overflow-hidden hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-white opacity-80">{kpi.icon}</div>
              {kpi.change !== undefined && (
                <div className={`flex items-center gap-1 text-sm font-semibold ${kpi.change >= 0 ? 'text-[#34D399]' : 'text-[#FF6BBA]'}`}>
                  {kpi.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(kpi.change)}%
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{kpi.value}</div>
            <div className="text-sm text-gray-300">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid - Empty State */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Data Yet</h3>
          <p className="text-gray-400 mb-6">
            Start by adding revenue and expenses to see your financial analytics and charts here.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-sm text-gray-500">
              Charts will appear once you have:
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-[#6E86FF]">💰</span>
              <span>Revenue entries</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-[#FF6BBA]">💸</span>
              <span>Expense entries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Deduction Summary */}
      {expenseBreakdown.length > 0 && (
        <div className="bg-gradient-to-br from-[#B279DB]/10 to-[#6E86FF]/10 border-2 border-[#B279DB]/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">📋 Tax Deduction Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Deductible</div>
              <div className="text-2xl font-bold text-[#34D399]">
                ${expenseBreakdown.reduce((sum, e) => sum + (e.deductible_amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Meals (50%)</div>
              <div className="text-2xl font-bold text-[#FF6BBA]">$0.00</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Mileage</div>
              <div className="text-2xl font-bold text-[#6E86FF]">$0.00</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">1099 Payments</div>
              <div className="text-2xl font-bold text-[#B279DB]">$0.00</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Expense Categories */}
      {expenseBreakdown.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Expense Categories</h3>
          <div className="space-y-3">
            {expenseBreakdown.map((expense, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-300">{expense.category}</div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA]"
                      style={{ width: `${expense.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right text-sm font-semibold text-white">
                  ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="w-16 text-right text-sm text-gray-400">
                  {expense.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
