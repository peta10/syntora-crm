'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { getRevenueEntries, deleteRevenueEntry } from '@/app/lib/finance/queries';
import type { RevenueEntry } from '@/app/lib/finance/types';
import RevenueForm from './RevenueForm';

export default function RevenueTable() {
  const [entries, setEntries] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState<'revenue_date' | 'amount'>('revenue_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      setLoading(true);
      const data = await getRevenueEntries();
      setEntries(data);
    } catch (error) {
      console.error('Error loading revenue entries:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this revenue entry?')) return;
    
    try {
      await deleteRevenueEntry(id);
      await loadEntries();
    } catch (error) {
      console.error('Error deleting revenue entry:', error);
      alert('Failed to delete revenue entry');
    }
  }

  const filteredEntries = entries
    .filter(entry => {
      // Status filter
      if (statusFilter !== 'all' && entry.payment_status !== statusFilter) return false;
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          entry.business?.company_name?.toLowerCase().includes(search) ||
          entry.service_description?.toLowerCase().includes(search) ||
          entry.revenue_category?.toLowerCase().includes(search)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      const aVal = sortColumn === 'revenue_date' ? new Date(a.revenue_date).getTime() : a.amount;
      const bVal = sortColumn === 'revenue_date' ? new Date(b.revenue_date).getTime() : b.amount;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const totalRevenue = filteredEntries.reduce((sum, e) => sum + e.amount, 0);
  const paidRevenue = filteredEntries.filter(e => e.payment_status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  const pendingRevenue = filteredEntries.filter(e => e.payment_status !== 'paid').reduce((sum, e) => sum + e.amount, 0);

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      invoiced: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      partially_paid: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Revenue Entries</h2>
          <p className="text-gray-400">Track all revenue and client payments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <Plus size={20} />
          Add Revenue
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#6E86FF]/20 to-[#6E86FF]/10 border border-[#6E86FF]/30 rounded-lg p-4">
          <div className="text-sm text-[#6E86FF] mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-white">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-gradient-to-br from-[#34D399]/20 to-[#34D399]/10 border border-[#34D399]/30 rounded-lg p-4">
          <div className="text-sm text-[#34D399] mb-1">Paid</div>
          <div className="text-2xl font-bold text-white">${paidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-gradient-to-br from-[#B279DB]/20 to-[#B279DB]/10 border border-[#B279DB]/30 rounded-lg p-4">
          <div className="text-sm text-[#B279DB] mb-1">Pending</div>
          <div className="text-2xl font-bold text-white">${pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by client, description, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="invoiced">Invoiced</option>
          <option value="pending">Pending</option>
          <option value="partially_paid">Partially Paid</option>
        </select>

        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors">
          <Download size={20} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortColumn('revenue_date');
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Date {sortColumn === 'revenue_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortColumn('amount');
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Amount {sortColumn === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No revenue entries found. Click "Add Revenue" to get started.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-white">
                      {new Date(entry.revenue_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {entry.business?.logo_url && (
                          <img src={entry.business.logo_url} alt="" className="w-6 h-6 rounded" />
                        )}
                        <span className="text-sm text-white">{entry.business?.company_name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-white">
                      ${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {entry.revenue_category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(entry.payment_status)}`}>
                        {entry.payment_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {entry.is_recurring && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          🔄 Recurring
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {/* TODO: Implement edit */}}
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div>Showing {filteredEntries.length} of {entries.length} entries</div>
        <div>Total: ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <RevenueForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadEntries();
          }}
        />
      )}
    </div>
  );
}
