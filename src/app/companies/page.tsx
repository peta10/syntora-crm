'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Building2, Plus, Search, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import CompanyList from '@/app/components/companies/CompanyList';
import CompanyForm from '@/app/components/companies/CompanyForm';
import { getCompanies, createCompany, updateCompany, deleteCompany, type CompanyWithMetrics } from '@/app/lib/api/companies';
import type { CrmBusiness } from '@/app/types/crm';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyWithMetrics[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyWithMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'revenue' | 'deals'>('name');

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    filterAndSortCompanies();
  }, [companies, searchQuery, businessTypeFilter, sortBy]);

  async function loadCompanies() {
    setLoading(true);
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortCompanies() {
    let filtered = companies;

    // Apply business type filter
    if (businessTypeFilter) {
      filtered = filtered.filter(c => c.business_type === businessTypeFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.company_name.toLowerCase().includes(query) ||
        c.industry?.toLowerCase().includes(query) ||
        c.website?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.company_name.localeCompare(b.company_name);
        case 'revenue':
          return b.total_revenue - a.total_revenue;
        case 'deals':
          return b.deals_count - a.deals_count;
        default:
          return 0;
      }
    });

    setFilteredCompanies(filtered);
  }

  async function handleSaveCompany(companyData: Partial<CrmBusiness>) {
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, companyData);
      } else {
        await createCompany(companyData);
      }
      await loadCompanies();
      setShowForm(false);
      setEditingCompany(null);
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Failed to save company. Please try again.');
    }
  }

  async function handleDeleteCompany(id: string) {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteCompany(id);
      await loadCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company. Please try again.');
    }
  }

  const stats = {
    total: companies.length,
    clients: companies.filter(c => c.business_type === 'client').length,
    totalRevenue: companies.reduce((sum, c) => sum + c.total_revenue, 0),
    totalMRR: companies.reduce((sum, c) => sum + c.mrr, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900/95 backdrop-blur-sm text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6E86FF]/30 border-t-[#6E86FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading companies...</p>
        </div>
      </div>
    );
  }

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
              Company Management
            </h1>
            <p className="text-gray-400">Track all businesses, clients, and financial relationships</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#6E86FF]/20 to-[#6E86FF]/10 border border-[#6E86FF]/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#6E86FF]" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-[#6E86FF]">Total Companies</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#6E86FF]/20 to-[#6E86FF]/10 border border-[#6E86FF]/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-[#6E86FF]" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.clients}</div>
              <div className="text-sm text-[#6E86FF]">Active Clients</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FF6BBA]/20 to-[#FF6BBA]/10 border border-[#FF6BBA]/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-[#FF6BBA]" />
            <div>
              <div className="text-2xl font-bold text-white">
                ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-[#FF6BBA]">Total Revenue</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#B279DB]/20 to-[#B279DB]/10 border border-[#B279DB]/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-[#B279DB]" />
            <div>
              <div className="text-2xl font-bold text-white">
                ${stats.totalMRR.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo
              </div>
              <div className="text-sm text-[#B279DB]">Active MRR</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies by name, industry, website..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
            />
          </div>

          {/* Business Type Filter */}
          <select
            value={businessTypeFilter}
            onChange={(e) => setBusinessTypeFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
          >
            <option value="">All Types</option>
            <option value="client">Clients</option>
            <option value="prospect">Prospects</option>
            <option value="partner">Partners</option>
            <option value="vendor">Vendors</option>
            <option value="competitor">Competitors</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6E86FF]"
          >
            <option value="name">Sort by Name</option>
            <option value="revenue">Sort by Revenue</option>
            <option value="deals">Sort by Deals</option>
          </select>
        </div>

        {/* Add Company Button */}
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white font-semibold rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Company
        </button>
      </div>

      {/* Company List */}
      <CompanyList
        companies={filteredCompanies}
        onEdit={(company) => {
          setEditingCompany(company);
          setShowForm(true);
        }}
        onDelete={handleDeleteCompany}
      />

      {/* Company Form Modal */}
      <CompanyForm
        company={editingCompany || undefined}
        onSave={handleSaveCompany}
        onCancel={() => {
          setShowForm(false);
          setEditingCompany(null);
        }}
        isOpen={showForm}
      />
    </div>
  );
}
