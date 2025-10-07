'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Filter, 
  List,
  Kanban
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Deal, PipelineStage } from '@/app/types/sales';
import { CreateDealRequest as CrmCreateDealRequest } from '@/app/types/crm';
import { DealDetailsDialog } from '@/app/components/sales/DealDetailsDialog';
import { NewDealForm } from '@/app/components/sales/NewDealForm';
import { PipelineColumn } from '@/app/components/sales/PipelineColumn';
import { DealsAPI } from '@/app/lib/api/crm-deals';
import type { CrmDeal } from '@/app/types/crm';

interface DealRowProps {
  deal: Deal;
  stages: PipelineStage[];
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onView: (deal: Deal) => void;
  onMoveStage: (dealId: string, newStage: string) => void;
}

const DealRow: React.FC<DealRowProps> = ({ deal, stages, onEdit, onDelete, onView, onMoveStage }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStageColor = (stage: string) => {
    const stageInfo = stages.find(s => s.stage_name === stage);
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
          {stages.map(stage => (
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
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load deals and stages on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use default stages (pipeline_stages table doesn't exist yet)
      // TODO: Create crm_pipeline_stages table and load from database
      setStages([
        { id: '1', stage_name: 'New', stage_order: 1, probability: 10, color_hex: '#3B82F6', is_active: true, created_at: '', updated_at: '' },
        { id: '2', stage_name: 'Qualified', stage_order: 2, probability: 25, color_hex: '#8B5CF6', is_active: true, created_at: '', updated_at: '' },
        { id: '3', stage_name: 'Proposal', stage_order: 3, probability: 50, color_hex: '#F59E0B', is_active: true, created_at: '', updated_at: '' }, 
        { id: '4', stage_name: 'Negotiation', stage_order: 4, probability: 75, color_hex: '#EF4444', is_active: true, created_at: '', updated_at: '' },
        { id: '5', stage_name: 'Closed Won', stage_order: 5, probability: 100, color_hex: '#10B981', is_active: true, created_at: '', updated_at: '' },
        { id: '6', stage_name: 'Closed Lost', stage_order: 6, probability: 0, color_hex: '#6B7280', is_active: true, created_at: '', updated_at: '' }
      ]);
      
      // Load deals
      const dealsResponse = await DealsAPI.getAll({ limit: 1000 });
      
      // Map CrmDeal to Deal type
      const mappedDeals: Deal[] = dealsResponse.data.map((d: CrmDeal) => ({
        id: d.id,
        title: d.deal_name,
        contact_id: d.contact_id,
        value: d.value,
        stage: d.stage,
        probability: d.probability,
        close_date: d.expected_close_date || '',
        description: d.description,
        tags: d.tags || [],
        created_at: d.created_at,
        updated_at: d.updated_at
      }));
      
      setDeals(mappedDeals);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load deals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

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

  async function handleDealMove(dealId: string, newStage: string) {
    try {
      await DealsAPI.updateStage(dealId, newStage);
      await loadData(); // Reload from database
    } catch (err) {
      console.error('Error moving deal:', err);
      setError('Failed to update deal stage.');
    }
  }

  const handleEditDeal = (deal: Deal) => {
    // Implement edit functionality
    console.log('Edit deal:', deal);
  };

  async function handleDeleteDeal(id: string) {
    if (!confirm('Are you sure you want to delete this deal?')) {
      return;
    }
    
    try {
      await DealsAPI.delete(id);
      await loadData(); // Reload from database
    } catch (err) {
      console.error('Error deleting deal:', err);
      setError('Failed to delete deal.');
    }
  }

  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDetailsOpen(true);
  };

  async function handleCreateDeal(dealData: CrmCreateDealRequest) {
    try {
      await DealsAPI.create(dealData);
      await loadData(); // Reload from database
      setIsNewDealOpen(false);
    } catch (err) {
      console.error('Error creating deal:', err);
      setError('Failed to create deal.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-900/95 backdrop-blur-sm text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Image
              src="/FinalFavicon.webp"
              alt="Syntora Logo"
              width={48}
              height={48}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Sales Pipeline
              </h1>
              <p className="text-gray-400">
                Manage your deals and pipeline
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => { setError(null); loadData(); }}
              className="mt-2 text-sm text-red-300 hover:text-red-100 underline"
            >
              Try again
            </button>
          </div>
        )}

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
                      stages={stages}
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