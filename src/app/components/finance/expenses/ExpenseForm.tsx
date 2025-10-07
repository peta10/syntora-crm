'use client';

import { useState, useEffect } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';
import type { ExpenseFormData } from '@/app/lib/finance/types';
import { 
  getExpenseCategories, 
  getSubcategories, 
  getBusinesses, 
  createExpense,
  getExpenseAccounts
} from '@/app/lib/finance/queries';
import { useAuth } from '@/app/contexts/AuthContext';

interface ExpenseFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  'Business Credit Card', 'Business Checking', 'Petty Cash', 'Personal Reimbursement', 
  'ACH Transfer', 'Check', 'Wire Transfer'
];

const IRS_MILEAGE_RATE = 0.67; // 2024 rate

export default function ExpenseForm({ onClose, onSuccess }: ExpenseFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    expense_date: new Date().toISOString().split('T')[0],
    amount: '',
    primary_category: '',
    subcategory: '',
    business_use_percentage: '100',
    vendor_name: '',
    payment_status: 'paid',
    is_recurring: false,
    description: '',
    business_purpose: '',
    billable: false,
  });

  useEffect(() => {
    loadCategories();
    loadBusinesses();
  }, []);

  useEffect(() => {
    if (formData.primary_category) {
      loadSubcategories(formData.primary_category);
    }
  }, [formData.primary_category]);

  async function loadCategories() {
    try {
      const data = await getExpenseCategories(true); // Parent categories only
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function loadSubcategories(parentCode: string) {
    try {
      const data = await getSubcategories(parentCode);
      setSubcategories(data || []);
      
      // Get category details
      const category = categories.find(c => c.category_code === parentCode);
      setSelectedCategory(category);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  }

  async function loadBusinesses() {
    try {
      const data = await getBusinesses();
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  }

  const calculateDeductibleAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    const deductionPct = selectedCategory?.default_deduction_percentage || 100;
    const businessUsePct = parseFloat(formData.business_use_percentage) || 100;
    return (amount * deductionPct / 100 * businessUsePct / 100).toFixed(2);
  };

  const calculateMileageAmount = () => {
    const miles = parseFloat(formData.mileage || '0');
    return (miles * IRS_MILEAGE_RATE).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the current user ID from auth context
      if (!user?.id) {
        alert('User not authenticated');
        return;
      }
      
      // Get expense account
      const expenseAccounts = await getExpenseAccounts();
      const account = expenseAccounts[0]; // TODO: Map category to correct account

      const expense = {
        expense_date: formData.expense_date,
        amount: parseFloat(formData.amount),
        primary_category: formData.primary_category,
        subcategory: formData.subcategory,
        expense_account_id: account?.id,
        tax_deductible: selectedCategory?.tax_deductible || true,
        deduction_percentage: selectedCategory?.default_deduction_percentage || 100,
        business_use_percentage: parseFloat(formData.business_use_percentage),
        vendor_name: formData.vendor_name,
        vendor_type: formData.vendor_type,
        payment_status: formData.payment_status,
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        payment_account: formData.payment_account,
        is_recurring: formData.is_recurring,
        recurring_frequency: formData.recurring_frequency,
        trip_purpose: formData.trip_purpose,
        trip_destination: formData.trip_destination,
        mileage: formData.mileage ? parseFloat(formData.mileage) : undefined,
        mileage_rate: formData.mileage ? IRS_MILEAGE_RATE : undefined,
        meal_attendees: formData.meal_attendees?.split(',').map(a => a.trim()),
        meal_business_purpose: formData.meal_business_purpose,
        description: formData.description,
        business_purpose: formData.business_purpose,
        project_id: formData.project_id,
        client_id: formData.client_id,
        billable: formData.billable,
        created_by: user.id,
      };

      await createExpense(expense);
      onSuccess();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const requiresReceipt = parseFloat(formData.amount) > 75;
  const isTravelCategory = formData.primary_category === 'TRAV';
  const isMealCategory = formData.primary_category === 'MEAL';
  const is1099Vendor = formData.vendor_type === 'contractor_1099';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Expense</h2>
            <p className="text-sm text-gray-400">Track business expenses with tax-compliant categorization</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Date & Amount */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📅</span> Date & Amount
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expense Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                  Payment Status
                </label>
                <select
                  value={formData.payment_status}
                  onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as any })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid (Accounts Payable)</option>
                  <option value="reimbursable">Reimbursable</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Category & Tax Info (CRITICAL) */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📋</span> Category & Tax Information
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">TAX CRITICAL</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Category <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.primary_category}
                  onChange={(e) => setFormData({ ...formData, primary_category: e.target.value, subcategory: '' })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.category_code} value={cat.category_code}>
                      {cat.icon} {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subcategory <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  disabled={!formData.primary_category}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">Select subcategory...</option>
                  {subcategories.map((sub) => (
                    <option key={sub.category_code} value={sub.category_code}>
                      {sub.icon} {sub.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCategory && (
              <div className="bg-gray-800/50 rounded p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tax Deductible:</span>
                  <span className={selectedCategory.tax_deductible ? 'text-green-400' : 'text-red-400'}>
                    {selectedCategory.tax_deductible ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Deduction Percentage:</span>
                  <span className="text-white font-semibold">
                    {selectedCategory.default_deduction_percentage}%
                  </span>
                </div>
                {selectedCategory.irs_schedule && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">IRS Schedule:</span>
                    <span className="text-blue-400">{selectedCategory.irs_schedule}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Business Use %:</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.business_use_percentage}
                    onChange={(e) => setFormData({ ...formData, business_use_percentage: e.target.value })}
                    className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-right"
                  />
                </div>
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-gray-300">Deductible Amount:</span>
                    <span className="text-green-400 text-lg">${calculateDeductibleAmount()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Vendor Information */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🏪</span> Vendor Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vendor Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Who was paid?"
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vendor Type
                </label>
                <select
                  value={formData.vendor_type}
                  onChange={(e) => setFormData({ ...formData, vendor_type: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type...</option>
                  <option value="contractor_1099">Contractor (1099) 👷</option>
                  <option value="employee_w2">Employee (W-2)</option>
                  <option value="vendor">Vendor</option>
                  <option value="utility">Utility</option>
                  <option value="subscription">Subscription</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {is1099Vendor && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-orange-400 flex-shrink-0 mt-1" size={20} />
                  <div className="text-sm">
                    <p className="text-orange-400 font-semibold mb-1">1099 Contractor Warning</p>
                    <p className="text-gray-300">
                      This vendor will be included in year-end 1099 reporting. If total payments exceed $600, 
                      you must collect their W-9 form and issue a 1099-NEC.
                    </p>
                  </div>
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
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account (Last 4)
                  </label>
                  <input
                    type="text"
                    placeholder="1234"
                    maxLength={4}
                    value={formData.payment_account}
                    onChange={(e) => setFormData({ ...formData, payment_account: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Travel Details (Conditional) */}
          {isTravelCategory && (
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>✈️</span> Travel Details
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Required by IRS</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trip Purpose <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required={isTravelCategory}
                    placeholder="e.g., Client meeting, Conference"
                    value={formData.trip_purpose}
                    onChange={(e) => setFormData({ ...formData, trip_purpose: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={formData.trip_destination}
                    onChange={(e) => setFormData({ ...formData, trip_destination: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">🚗 Mileage Tracking</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Miles Driven</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">IRS Rate (2024)</label>
                    <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                      ${IRS_MILEAGE_RATE}/mile
                    </div>
                  </div>
                </div>
                {formData.mileage && (
                  <div className="mt-2 text-sm text-green-400">
                    💰 Mileage Deduction: ${calculateMileageAmount()} 
                    <span className="text-gray-400 ml-2">
                      ({formData.mileage} miles × ${IRS_MILEAGE_RATE})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 6: Meals & Entertainment (Conditional) */}
          {isMealCategory && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>🍽️</span> Meals & Entertainment
                <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">50% Deductible</span>
              </h3>
              
              <div className="bg-orange-500/10 rounded p-3 mb-4">
                <p className="text-sm text-orange-300">
                  ⚠️ <strong>IRS Rule:</strong> Most business meals are only 50% tax deductible. 
                  You must document who attended and the business purpose.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Purpose <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required={isMealCategory}
                  placeholder="e.g., Discussing Q4 project scope with client"
                  value={formData.meal_business_purpose}
                  onChange={(e) => setFormData({ ...formData, meal_business_purpose: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Attendees (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="John Smith, Jane Doe"
                  value={formData.meal_attendees}
                  onChange={(e) => setFormData({ ...formData, meal_attendees: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Section 7: Description & Business Purpose (TAX CRITICAL) */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📝</span> Description & Business Purpose
              <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">TAX CRITICAL</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What Was Purchased? <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Be specific: e.g., 'Adobe Creative Cloud subscription for design work'"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Purpose (Why was this necessary?) <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g., 'Required software for client project deliverables and ongoing design work'"
                value={formData.business_purpose}
                onChange={(e) => setFormData({ ...formData, business_purpose: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 The IRS requires clear business purpose documentation for all deductions
              </p>
            </div>
          </div>

          {/* Section 8: Receipt Upload */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🧾</span> Receipt & Documentation
              {requiresReceipt && (
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">Required {'>'}$75</span>
              )}
            </h3>
            
            {requiresReceipt && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-300">
                  📄 <strong>IRS Requirement:</strong> Receipts are required for all expenses over $75
                </p>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-300 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            </div>
          </div>

          {/* Section 9: Project Allocation (Optional) */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📊</span> Project Allocation (Optional)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Allocate to Client
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.billable}
                    onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span>Billable to Client</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
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
              {loading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
