'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Plus, Edit2, Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { getExpenses, deleteExpense } from '@/app/lib/finance/queries';
import type { Expense } from '@/app/lib/finance/types';
import ExpenseForm from './ExpenseForm';

export default function ExpenseTable() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState<'expense_date' | 'amount'>('expense_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await deleteExpense(id);
      await loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  }

  const filteredExpenses = expenses
    .filter(expense => {
      // Category filter
      if (categoryFilter !== 'all' && expense.primary_category !== categoryFilter) return false;
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          expense.vendor_name?.toLowerCase().includes(search) ||
          expense.description?.toLowerCase().includes(search) ||
          expense.primary_category?.toLowerCase().includes(search)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      const aVal = sortColumn === 'expense_date' ? new Date(a.expense_date).getTime() : a.amount;
      const bVal = sortColumn === 'expense_date' ? new Date(b.expense_date).getTime() : b.amount;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const deductibleAmount = filteredExpenses.reduce((sum, e) => sum + (e.deductible_amount || 0), 0);
  const nonDeductibleAmount = totalExpenses - deductibleAmount;

  const uniqueCategories = [...new Set(expenses.map(e => e.primary_category))];

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
          <h2 className="text-2xl font-bold text-white">Expense Tracking</h2>
          <p className="text-gray-400">IRS-compliant expense categorization with tax deductions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6BBA] to-[#B279DB] text-white rounded-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#FF6BBA]/20 to-[#FF6BBA]/10 border border-[#FF6BBA]/30 rounded-lg p-4">
          <div className="text-sm text-[#FF6BBA] mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-white">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-gradient-to-br from-[#34D399]/20 to-[#34D399]/10 border border-[#34D399]/30 rounded-lg p-4">
          <div className="text-sm text-[#34D399] mb-1">Tax Deductible</div>
          <div className="text-2xl font-bold text-white">${deductibleAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-gradient-to-br from-[#B279DB]/20 to-[#B279DB]/10 border border-[#B279DB]/30 rounded-lg p-4">
          <div className="text-sm text-[#B279DB] mb-1">Non-Deductible</div>
          <div className="text-2xl font-bold text-white">${nonDeductibleAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by vendor, description, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
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
                    setSortColumn('expense_date');
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Date {sortColumn === 'expense_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
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
                  Deductible
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Receipt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No expenses found. Click "Add Expense" to get started.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const needsReceipt = expense.amount > 75 && !expense.receipt_url;
                  return (
                    <tr key={expense.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-white">
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {expense.vendor_name}
                        {expense.vendor_type === 'contractor_1099' && (
                          <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-1 py-0.5 rounded">1099</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {expense.subcategory}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-white">
                        ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        {expense.tax_deductible ? (
                          <div className="text-sm">
                            <div className="text-green-400 font-semibold">
                              ${(expense.deductible_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            {expense.deduction_percentage < 100 && (
                              <div className="text-xs text-gray-500">
                                {expense.deduction_percentage}% deductible
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Non-deductible</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {expense.receipt_url ? (
                          <CheckCircle className="text-green-400" size={20} />
                        ) : needsReceipt ? (
                          <div className="flex items-center gap-1 text-orange-400" title="Receipt required (>$75)">
                            <AlertTriangle size={20} />
                          </div>
                        ) : (
                          <span className="text-gray-600">-</span>
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
                            onClick={() => handleDelete(expense.id)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div>Showing {filteredExpenses.length} of {expenses.length} expenses</div>
        <div className="flex items-center gap-4">
          <span>Total: ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-green-400">Deductible: ${deductibleAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ExpenseForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadExpenses();
          }}
        />
      )}
    </div>
  );
}
