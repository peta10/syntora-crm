'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  List,
  Kanban
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Deal, PipelineStage, CreateDealRequest } from '@/app/types/sales';
import { DealDetailsDialog } from '@/app/components/sales/DealDetailsDialog';
import { NewDealForm } from '@/app/components/sales/NewDealForm';
import { PipelineColumn } from '@/app/components/sales/PipelineColumn';

// Mock pipeline stages
const mockStages: PipelineStage[] = [
  { id: '1', stage_name: 'Lead', stage_order: 1, probability: 10, color_hex: '#ef4444', is_active: true, created_at: '', updated_at: '' },
  { id: '2', stage_name: 'Qualified', stage_order: 2, probability: 25, color_hex: '#f97316', is_active: true, created_at: '', updated_at: '' },
  { id: '3', stage_name: 'Proposal', stage_order: 3, probability: 50, color_hex: '#eab308', is_active: true, created_at: '', updated_at: '' },
  { id: '4', stage_name: 'Negotiation', stage_order: 4, probability: 75, color_hex: '#22c55e', is_active: true, created_at: '', updated_at: '' },
  { id: '5', stage_name: 'Closed Won', stage_order: 5, probability: 100, color_hex: '#10b981', is_active: true, created_at: '', updated_at: '' },
  { id: '6', stage_name: 'Closed Lost', stage_order: 6, probability: 0, color_hex: '#6b7280', is_active: true, created_at: '', updated_at: '' }
];

// Mock deals data
const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Website Redesign - Tech Corp',
    contact_id: '1',
    value: 45000,
    stage: 'Proposal',
    probability: 50,
    close_date: '2024-02-15',
    description: 'Complete website redesign and development project',
    tags: ['web-design', 'enterprise'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  // ... other mock deals ...
];

interface DealRowProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onView: (deal: Deal) => void;
  onMoveStage: (dealId: string, newStage: string) => void;
}

const DealRow: React.FC<DealRowProps> = ({ deal, onEdit, onDelete, onView, onMoveStage }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStageColor = (stage: string) => {
    const stageInfo = mockStages.find(s => s.stage_name === stage);
    return stageInfo?.color_hex || '#6E86FF';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-400';
    if (probability >= 60) return 'text-yellow-400';
    if (probability >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <tr className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 group">
      <td className="px-6 py-4" onClick={() => onView(deal)}>
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6E86FF]/20 to-[#FF6BBA]/20 rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-medium">{deal.title}</div>
            <div className="text-gray-400 text-sm">{deal.description}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4" onClick={() => onView(deal)}>
        <div className="text-white font-medium cursor-pointer">{formatCurrency(deal.value)}</div>
      </td>
      <td className="px-6 py-4">
        <select
          value={deal.stage}
          onChange={(e) => onMoveStage(deal.id, e.target.value)}
          className="px-3 py-1 rounded-full text-sm font-medium border bg-transparent cursor-pointer hover:border-[#6E86FF] transition-colors"
          style={{ 
            color: getStageColor(deal.stage),
            borderColor: `${getStageColor(deal.stage)}50`
          }}
        >
          {mockStages.map(stage => (
            <option key={stage.id} value={stage.stage_name}>
              {stage.stage_name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-6 py-4" onClick={() => onView(deal)}>
        <span className={`text-sm font-medium cursor-pointer ${getProbabilityColor(deal.probability)}`}>
          {deal.probability}%
        </span>
      </td>
      <td className="px-6 py-4" onClick={() => onView(deal)}>
        <div className="text-gray-300 cursor-pointer">
          {new Date(deal.close_date).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4" onClick={() => onView(deal)}>
        <div className="flex items-center space-x-1 cursor-pointer">
          {deal.tags && deal.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-800/50 text-xs text-gray-300 rounded">
              {tag}
            </span>
          ))}
          {deal.tags && deal.tags.length > 2 && (
            <span className="text-xs text-gray-400">+{deal.tags.length - 2}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(deal);
            }}
            className="p-1 rounded hover:bg-gray-700/50"
          >
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(deal.id);
            }}
            className="p-1 rounded hover:bg-red-500/20"
          >
            <Plus className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Add helper function to convert Deal to CrmDeal
const convertToCrmDeal = (deal: Deal) => ({
  id: deal.id,
  deal_name: deal.title,
  contact_id: deal.contact_id || '',
  value: deal.value,
  currency: 'USD',
  stage: deal.stage,
  probability: deal.probability,
  expected_close_date: deal.close_date,
  description: deal.description,
  tags: deal.tags,
  created_at: deal.created_at,
  updated_at: deal.updated_at
});

export default function SalesPage() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [stages] = useState<PipelineStage[]>(mockStages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);

  // Group deals by stage
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.stage_name] = deals.filter(deal => deal.stage === stage.stage_name);
    return acc;
  }, {} as Record<string, Deal[]>);

  // Filter deals based on search and stage
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = !selectedStage || deal.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const handleDealMove = (dealId: string, newStage: string) => {
    setDeals(prev => prev.map(deal => 
      deal.id === dealId 
        ? { 
            ...deal, 
            stage: newStage,
            probability: stages.find(s => s.stage_name === newStage)?.probability || deal.probability,
            updated_at: new Date().toISOString()
          }
        : deal
    ));
  };

  const handleEditDeal = (deal: Deal) => {
    // Implement edit functionality
    console.log('Edit deal:', deal);
  };

  const handleDeleteDeal = (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDetailsOpen(true);
  };

  const handleCreateDeal = (dealData: CreateDealRequest) => {
    const newDeal: Deal = {
      id: Math.random().toString(36).substr(2, 9), // Generate a random ID
      title: dealData.title,
      contact_id: dealData.contact_id,
      value: dealData.value,
      stage: dealData.stage,
      probability: dealData.probability,
      close_date: dealData.close_date,
      description: dealData.description,
      tags: dealData.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setDeals(prev => [...prev, newDeal]);
    setIsNewDealOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Sales
            </h1>
            <p className="text-gray-400">
              Manage your deals and pipeline
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search deals by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700/50 text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm">List</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Kanban className="w-4 h-4" />
                <span className="text-sm">Kanban</span>
              </button>
            </div>
            
            <Button variant="outline" className="border-gray-700/50 text-gray-300 hover:text-white">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
              onClick={() => setIsNewDealOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white"
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage.id} value={stage.stage_name}>{stage.stage_name}</option>
            ))}
          </select>
        </div>

        {/* Main Content - List or Kanban View */}
        {viewMode === 'list' ? (
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Deal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Probability
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Close Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredDeals.map((deal) => (
                    <DealRow
                      key={deal.id}
                      deal={deal}
                      onEdit={handleEditDeal}
                      onDelete={handleDeleteDeal}
                      onView={handleViewDeal}
                      onMoveStage={handleDealMove}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex space-x-6 pb-6 min-w-max">
              {stages.map((stage) => (
                <PipelineColumn
                  key={stage.id}
                  stage={stage}
                  deals={dealsByStage[stage.stage_name] || []}
                  onDealMove={handleDealMove}
                  onEdit={handleEditDeal}
                  onDelete={handleDeleteDeal}
                  onView={handleViewDeal}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-[#6E86FF]/20 to-[#FF6BBA]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No deals found</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery || selectedStage
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first deal'
              }
            </p>
            {!searchQuery && !selectedStage && (
              <Button 
                className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA]"
                onClick={() => setIsNewDealOpen(true)}
              >
                Create Your First Deal
              </Button>
            )}
          </div>
        )}

        {/* Deal Details Dialog */}
        {selectedDeal && (
          <DealDetailsDialog
            deal={convertToCrmDeal(selectedDeal)}
            isOpen={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedDeal(null);
            }}
          />
        )}

        {/* New Deal Form */}
        <NewDealForm
          isOpen={isNewDealOpen}
          onClose={() => setIsNewDealOpen(false)}
          onSubmit={handleCreateDeal}
          stages={stages}
        />
      </div>
    </div>
  );
} 