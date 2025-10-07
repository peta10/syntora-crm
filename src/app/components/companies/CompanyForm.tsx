'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { CrmBusiness } from '@/app/types/crm';

interface CompanyFormProps {
  company?: Partial<CrmBusiness>;
  onSave: (data: Partial<CrmBusiness>) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

export default function CompanyForm({ company, onSave, onCancel, isOpen }: CompanyFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CrmBusiness>>({
    company_name: company?.company_name || '',
    website: company?.website || '',
    industry: company?.industry || '',
    business_type: company?.business_type || 'prospect',
    phone: company?.phone || '',
    description: company?.description || '',
    address_line_1: company?.address_line_1 || '',
    address_line_2: company?.address_line_2 || '',
    city: company?.city || '',
    state: company?.state || '',
    postal_code: company?.postal_code || '',
    country: company?.country || 'USA',
    company_size: company?.company_size || undefined,
    annual_revenue: company?.annual_revenue || undefined,
    linkedin_url: company?.linkedin_url || '',
    twitter_url: company?.twitter_url || '',
    tags: company?.tags || [],
    notes: company?.notes || '',
    lead_score: company?.lead_score || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border-2 border-[#6E86FF]/30 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] bg-clip-text text-transparent">
            {company?.id ? 'Edit Company' : 'Add New Company'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Basic Information */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name <span className="text-[#FF6BBA]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Type <span className="text-[#FF6BBA]">*</span>
                </label>
                <select
                  required
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value as any })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                >
                  <option value="prospect">Prospect</option>
                  <option value="client">Client</option>
                  <option value="partner">Partner</option>
                  <option value="vendor">Vendor</option>
                  <option value="competitor">Competitor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="Technology, Healthcare, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Size
                </label>
                <select
                  value={formData.company_size || ''}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value as any })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                >
                  <option value="">Select size...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                placeholder="Brief description of the company..."
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Address</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.address_line_1}
                onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.address_line_2}
                onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                placeholder="Suite 100"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Social Links</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                placeholder="Internal notes about this company..."
              />
            </div>

            {formData.business_type === 'prospect' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lead Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.lead_score}
                  onChange={(e) => setFormData({ ...formData, lead_score: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
                />
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA]"
                    style={{ width: `${formData.lead_score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : (company?.id ? 'Update Company' : 'Create Company')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
