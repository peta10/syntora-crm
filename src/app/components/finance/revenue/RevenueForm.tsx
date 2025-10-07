'use client';

import { useState, useEffect } from 'react';
import { X, Building2, ExternalLink } from 'lucide-react';
import type { RevenueFormData } from '@/app/lib/finance/types';
import { getBusinesses, getRevenueAccounts, createRevenueEntry } from '@/app/lib/finance/queries';
import { createCompany } from '@/app/lib/api/companies';
import { useAuth } from '@/app/contexts/AuthContext';

interface RevenueFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const REVENUE_CATEGORIES = [
  { value: 'service_revenue', label: 'Service Revenue', account: '4000' },
  { value: 'product_sales', label: 'Product Sales', account: '4100' },
  { value: 'subscription_revenue', label: 'Subscription Revenue', account: '4200' },
  { value: 'consulting_fees', label: 'Consulting Fees', account: '4300' },
  { value: 'project_revenue', label: 'Project Revenue', account: '4400' },
  { value: 'retainer_revenue', label: 'Monthly Retainer', account: '4500' },
  { value: 'commission_revenue', label: 'Commission Income', account: '4600' },
  { value: 'licensing_fees', label: 'Licensing Fees', account: '4700' },
  { value: 'other_revenue', label: 'Other Income', account: '4900' },
];

const PAYMENT_METHODS = [
  'Bank Transfer', 'Credit Card', 'Check', 'PayPal', 'Stripe', 'Wire Transfer', 'Cash', 'Other'
];

export default function RevenueForm({ onClose, onSuccess }: RevenueFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedBusinessDetails, setSelectedBusinessDetails] = useState<any>(null);
  const [quickAddData, setQuickAddData] = useState({ company_name: '', business_type: 'client', website: '' });
  const [formData, setFormData] = useState<RevenueFormData>({
    business_id: '',
    revenue_date: new Date().toISOString().split('T')[0],
    amount: '',
    revenue_category: 'service_revenue',
    is_recurring: false,
    payment_status: 'invoiced',
    service_description: '',
  });

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const data = await getBusinesses();
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  }

  async function handleQuickAddCompany() {
    if (!quickAddData.company_name) {
      alert('Please enter a company name');
      return;
    }

    try {
      const newCompany = await createCompany({
        company_name: quickAddData.company_name,
        business_type: quickAddData.business_type as any,
        website: quickAddData.website,
      });

      if (newCompany) {
        await loadBusinesses();
        setFormData({ ...formData, business_id: newCompany.id });
        setSelectedBusinessDetails(newCompany);
        setShowQuickAdd(false);
        setQuickAddData({ company_name: '', business_type: 'client', website: '' });
      }
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Failed to create company');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the current user ID from auth context
      if (!user?.id) {
        alert('User not authenticated');
        return;
      }

      // Find the revenue account for this category
      const category = REVENUE_CATEGORIES.find(c => c.value === formData.revenue_category);
      const revenueAccounts = await getRevenueAccounts();
      const account = revenueAccounts.find(a => a.account_code === category?.account);

      const entry = {
        business_id: formData.business_id,
        revenue_date: formData.revenue_date,
        amount: parseFloat(formData.amount),
        revenue_category: formData.revenue_category,
        revenue_account_id: account?.id || revenueAccounts[0].id,
        is_recurring: formData.is_recurring,
        recurring_frequency: formData.recurring_frequency,
        contract_start_date: formData.contract_start_date,
        contract_end_date: formData.contract_end_date,
        payment_status: formData.payment_status,
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        invoice_number: formData.invoice_number,
        taxable_amount: formData.taxable_amount ? parseFloat(formData.taxable_amount) : undefined,
        tax_rate: formData.tax_rate ? parseFloat(formData.tax_rate) : undefined,
        tax_jurisdiction: formData.tax_jurisdiction,
        service_description: formData.service_description,
        project_name: formData.project_name,
        hours_worked: formData.hours_worked ? parseFloat(formData.hours_worked) : undefined,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
        notes: formData.notes,
        created_by: user.id,
      };

      await createRevenueEntry(entry);
      onSuccess();
    } catch (error) {
      console.error('Error creating revenue entry:', error);
      alert('Failed to create revenue entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Revenue Entry</h2>
            <p className="text-sm text-gray-400">Track new revenue and client payments</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Client & Date */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🏢</span> Client & Date Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client/Company <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.business_id}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '__add_new__') {
                      setShowQuickAdd(true);
                      return;
                    }
                    setFormData({ ...formData, business_id: value });
                    const business = businesses.find(b => b.id === value);
                    setSelectedBusinessDetails(business);
                  }}
                  className="w-full bg-gray-700 border border-[#6E86FF]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                >
                  <option value="">Select client...</option>
                  {businesses
                    .filter(b => b.business_type === 'client' || b.business_type === 'prospect')
                    .map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.company_name} ({business.business_type})
                      </option>
                    ))}
                  <option value="__add_new__" className="text-[#6E86FF]">
                    + Add New Company
                  </option>
                </select>

                {/* Company Summary Sidebar */}
                {selectedBusinessDetails && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-[#6E86FF]/10 to-[#B279DB]/10 border border-[#6E86FF]/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#6E86FF]" />
                        <span className="font-semibold text-white">{selectedBusinessDetails.company_name}</span>
                      </div>
                      <a
                        href={`/companies/${selectedBusinessDetails.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6E86FF] hover:text-[#FF6BBA] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white capitalize">{selectedBusinessDetails.business_type}</span>
                      </div>
                      {selectedBusinessDetails.industry && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Industry:</span>
                          <span className="text-white">{selectedBusinessDetails.industry}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Revenue Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.revenue_date}
                  onChange={(e) => setFormData({ ...formData, revenue_date: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Status <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as any })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="paid">Paid</option>
                <option value="invoiced">Invoiced (Not Yet Paid)</option>
                <option value="pending">Pending</option>
                <option value="partially_paid">Partially Paid</option>
              </select>
            </div>
          </div>

          {/* Section 2: Amount & Category */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>💰</span> Amount & Category
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ($) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Revenue Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.revenue_category}
                  onChange={(e) => setFormData({ ...formData, revenue_category: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {REVENUE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Recurring Revenue */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🔄</span> Recurring Revenue
            </h3>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-300">This is recurring revenue (monthly retainer)</span>
            </label>

            {formData.is_recurring && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.recurring_frequency}
                    onChange={(e) => setFormData({ ...formData, recurring_frequency: e.target.value as any })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contract Start
                  </label>
                  <input
                    type="date"
                    value={formData.contract_start_date}
                    onChange={(e) => setFormData({ ...formData, contract_start_date: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contract End
                  </label>
                  <input
                    type="date"
                    value={formData.contract_end_date}
                    onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Payment Details */}
          {formData.payment_status === 'paid' && (
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>💳</span> Payment Details
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select method...</option>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    placeholder="INV-001"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Service Details */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📋</span> Service Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Description <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe the services provided (required for tax documentation)"
                value={formData.service_description}
                onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Be specific: e.g., "Web design services for homepage redesign project"
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hours Worked
                </label>
                <input
                  type="number"
                  step="0.25"
                  placeholder="0.00"
                  value={formData.hours_worked}
                  onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Notes */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📝</span> Additional Notes
            </h3>
            
            <textarea
              rows={3}
              placeholder="Any additional notes or context..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Revenue Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Add Company Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-[#6E86FF]/30 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Add Company</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name <span className="text-[#FF6BBA]">*</span>
                  </label>
                  <input
                    type="text"
                    value={quickAddData.company_name}
                    onChange={(e) => setQuickAddData({ ...quickAddData, company_name: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                    placeholder="Acme Corporation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={quickAddData.business_type}
                    onChange={(e) => setQuickAddData({ ...quickAddData, business_type: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  >
                    <option value="client">Client</option>
                    <option value="prospect">Prospect</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={quickAddData.website}
                    onChange={(e) => setQuickAddData({ ...quickAddData, website: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowQuickAdd(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuickAddCompany}
                  className="px-4 py-2 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Add & Select
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
