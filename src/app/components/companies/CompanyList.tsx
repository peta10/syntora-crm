'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, Users, DollarSign, TrendingUp, Edit, Trash2, ExternalLink } from 'lucide-react';
import type { CompanyWithMetrics } from '@/app/lib/api/companies';

interface CompanyListProps {
  companies: CompanyWithMetrics[];
  onEdit: (company: CompanyWithMetrics) => void;
  onDelete: (id: string) => void;
}

const BUSINESS_TYPE_STYLES = {
  client: {
    bg: 'from-[#6E86FF]/20 to-[#6E86FF]/10',
    border: 'border-[#6E86FF]/30',
    text: 'text-[#6E86FF]',
    label: 'Client',
  },
  prospect: {
    bg: 'from-[#B279DB]/20 to-[#B279DB]/10',
    border: 'border-[#B279DB]/30',
    text: 'text-[#B279DB]',
    label: 'Prospect',
  },
  partner: {
    bg: 'from-[#6E86FF]/20 via-[#B279DB]/20 to-[#B279DB]/10',
    border: 'border-[#B279DB]/30',
    text: 'text-[#B279DB]',
    label: 'Partner',
  },
  vendor: {
    bg: 'from-[#FF6BBA]/20 to-[#FF6BBA]/10',
    border: 'border-[#FF6BBA]/30',
    text: 'text-[#FF6BBA]',
    label: 'Vendor',
  },
  competitor: {
    bg: 'from-gray-600/20 to-gray-700/10',
    border: 'border-gray-600/30',
    text: 'text-gray-400',
    label: 'Competitor',
  },
};

export default function CompanyList({ companies, onEdit, onDelete }: CompanyListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900/50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Company
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Contacts
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Revenue
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              MRR
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Deals
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Last Contact
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {companies.map((company) => {
            const typeStyle = BUSINESS_TYPE_STYLES[company.business_type];
            
            return (
              <tr key={company.id} className="hover:bg-gray-800/50 transition-colors">
                {/* Company Logo & Name */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <Link href={`/companies/${company.id}`} className="flex items-center gap-3 group">
                    {company.logo_url ? (
                      <Image
                        src={company.logo_url}
                        alt={company.company_name}
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6E86FF] to-[#FF6BBA] flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(company.company_name)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-white group-hover:text-[#6E86FF] transition-colors">
                        {company.company_name}
                      </div>
                      {company.industry && (
                        <div className="text-xs text-gray-500">{company.industry}</div>
                      )}
                    </div>
                  </Link>
                </td>

                {/* Business Type Badge */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${typeStyle.bg} border ${typeStyle.border} ${typeStyle.text}`}>
                    {typeStyle.label}
                  </span>
                </td>

                {/* Contacts Count */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#B279DB]" />
                    <span className="text-white">{company.contacts_count}</span>
                  </div>
                </td>

                {/* Total Revenue */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#6E86FF]" />
                    <span className="text-white font-medium">
                      {formatCurrency(company.total_revenue)}
                    </span>
                  </div>
                </td>

                {/* MRR */}
                <td className="px-4 py-4 whitespace-nowrap">
                  {company.mrr > 0 ? (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#FF6BBA]" />
                      <span className="text-[#FF6BBA] font-medium">
                        {formatCurrency(company.mrr)}/mo
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">One-time</span>
                  )}
                </td>

                {/* Deals Count */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-white">{company.deals_count}</span>
                </td>

                {/* Last Contact Date */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-gray-400 text-sm">
                    {formatDate(company.last_contact_date)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/companies/${company.id}`}
                      className="p-2 hover:bg-[#6E86FF]/10 rounded-lg transition-colors group"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#6E86FF]" />
                    </Link>
                    <button
                      onClick={() => onEdit(company)}
                      className="p-2 hover:bg-[#B279DB]/10 rounded-lg transition-colors group"
                    >
                      <Edit className="w-4 h-4 text-gray-400 group-hover:text-[#B279DB]" />
                    </button>
                    <button
                      onClick={() => onDelete(company.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {companies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No companies found</h3>
          <p className="text-gray-400">Try adjusting your filters or add a new company</p>
        </div>
      )}
    </div>
  );
}
