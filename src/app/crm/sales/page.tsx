'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar,
  User,
  Building,
  Target,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  List,
  Kanban
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CrmDeal, PipelineStage, CreateDealRequest } from '@/app/types/crm';
import { DealsAPI } from '@/app/lib/api/crm-deals';

// Default pipeline stages (will be loaded from database in future)
const defaultStages: PipelineStage[] = [
  { id: '1', stage_name: 'Lead', stage_order: 1, probability: 10, color_hex: '#6E86FF', is_active: true, created_at: '', updated_at: '' },
  { id: '2', stage_name: 'Qualified', stage_order: 2, probability: 25, color_hex: '#FF6BBA', is_active: true, created_at: '', updated_at: '' },
  { id: '3', stage_name: 'Proposal', stage_order: 3, probability: 50, color_hex: '#B279DB', is_active: true, created_at: '', updated_at: '' },
  { id: '4', stage_name: 'Negotiation', stage_order: 4, probability: 75, color_hex: '#22c55e', is_active: true, created_at: '', updated_at: '' },
  { id: '5', stage_name: 'Closed Won', stage_order: 5, probability: 100, color_hex: '#10b981', is_active: true, created_at: '', updated_at: '' },
  { id: '6', stage_name: 'Closed Lost', stage_order: 6, probability: 0, color_hex: '#6b7280', is_active: true, created_at: '', updated_at: '' }
];

// Removed mock deals - all data now loaded from Supabase
const _oldMockDeals: CrmDeal[] = [
  {
    id: '1',
    deal_name: 'Website Redesign - Tech Corp',
    contact_id: '1',
    value: 45000,
    currency: 'USD',
    stage: 'Proposal',
    probability: 50,
    expected_close_date: '2024-02-15',
    description: 'Complete website redesign and development project',
    next_action: 'Send proposal document',
    next_action_date: '2024-01-20T10:00:00Z',
    tags: ['web-design', 'enterprise'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    deal_name: 'Marketing Campaign - Marketing Plus',
    contact_id: '2',
    value: 25000,
    currency: 'USD',
    stage: 'Negotiation',
    probability: 75,
    expected_close_date: '2024-01-30',
    description: 'Digital marketing campaign for Q1',
    next_action: 'Final pricing discussion',
    next_action_date: '2024-01-18T14:00:00Z',
    tags: ['marketing', 'recurring'],
    created_at: '2023-12-15T00:00:00Z',
    updated_at: '2024-01-14T14:15:00Z'
  },
  {
    id: '3',
    deal_name: 'Brand Identity - Design Studio',
    contact_id: '3',
    value: 15000,
    currency: 'USD',
    stage: 'Qualified',
    probability: 25,
    expected_close_date: '2024-03-01',
    description: 'Complete brand identity package',
    next_action: 'Schedule discovery call',
    next_action_date: '2024-01-22T11:00:00Z',
    tags: ['branding', 'creative'],
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  },
  {
    id: '4',
    deal_name: 'E-commerce Platform - StartupCo',
    contact_id: '4',
    value: 85000,
    currency: 'USD',
    stage: 'Lead',
    probability: 10,
    expected_close_date: '2024-04-15',
    description: 'Custom e-commerce platform development',
    next_action: 'Initial consultation meeting',
    next_action_date: '2024-01-25T16:00:00Z',
    tags: ['e-commerce', 'startup'],
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  }
];

interface DealCardProps {
  deal: CrmDeal;
  onEdit: (deal: CrmDeal) => void;
  onDelete: (id: string) => void;
  onView: (deal: CrmDeal) => void;
  onMoveStage: (dealId: string, newStage: string) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onEdit, onDelete, onView, onMoveStage }) => {
  const [draggedOver, setDraggedOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('dealId', deal.id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: deal.currency || 'USD'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-400';
    if (probability >= 50) return 'text-yellow-400';
    if (probability >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <Card 
      className="bg-gray-800/50 border-gray-600/50 hover:border-[#6E86FF]/50 transition-all duration-300 group cursor-move"
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-white font-medium text-sm leading-tight">{deal.deal_name}</h3>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 rounded hover:bg-gray-700/50">
              <MoreVertical className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">{formatCurrency(deal.value)}</span>
            <span className={`text-xs font-medium ${getProbabilityColor(deal.probability)}`}>
              {deal.probability}%
            </span>
          </div>
          
          {deal.expected_close_date && (
            <div className="flex items-center text-xs text-gray-400">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Close: {formatDate(deal.expected_close_date)}</span>
            </div>
          )}
        </div>

        {deal.next_action && (
          <div className="mb-3">
            <p className="text-xs text-gray-300 mb-1">Next Action:</p>
            <p className="text-xs text-gray-400">{deal.next_action}</p>
          </div>
        )}

        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {deal.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded">
                {tag}
              </span>
            ))}
            {deal.tags.length > 2 && (
              <span className="text-xs text-gray-400">+{deal.tags.length - 2}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface PipelineColumnProps {
  stage: PipelineStage;
  deals: CrmDeal[];
  onDealMove: (dealId: string, newStage: string) => void;
  onEdit: (deal: CrmDeal) => void;
  onDelete: (id: string) => void;
  onView: (deal: CrmDeal) => void;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({ 
  stage, 
  deals, 
  onDealMove, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [draggedOver, setDraggedOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
    const dealId = e.dataTransfer.getData('dealId');
    if (dealId) {
      onDealMove(dealId, stage.stage_name);
    }
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-w-[280px] flex flex-col">
      {/* Column Header */}
      <div className="mb-4">
        <div 
          className="flex items-center justify-between p-3 rounded-lg border-2 border-dashed"
          style={{ borderColor: stage.color_hex + '40' }}
        >
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color_hex }}
            />
            <h3 className="font-medium text-white">{stage.stage_name}</h3>
            <span className="text-sm text-gray-400">({deals.length})</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-white">{formatCurrency(totalValue)}</div>
            <div className="text-xs text-gray-400">{stage.probability}% avg</div>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div 
        className={`flex-1 min-h-[400px] p-2 rounded-lg border-2 border-dashed transition-all ${
          draggedOver 
            ? 'border-[#6E86FF] bg-[#6E86FF]/10' 
            : 'border-gray-700/50 bg-gray-900/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-3">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onMoveStage={onDealMove}
            />
          ))}
          
          {deals.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">No deals in this stage</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DealRowProps {
  deal: CrmDeal;
  onEdit: (deal: CrmDeal) => void;
  onDelete: (id: string) => void;
  onView: (deal: CrmDeal) => void;
  onMoveStage: (dealId: string, newStage: string) => void;
}

const DealRow: React.FC<DealRowProps> = ({ deal, onEdit, onDelete, onView, onMoveStage }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: deal.currency || 'USD'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-400';
    if (probability >= 50) return 'text-yellow-400';
    if (probability >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <tr className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 group">
      <td className="px-6 py-4">
        <div>
          <div className="text-white font-medium">{deal.deal_name}</div>
          <div className="text-gray-400 text-sm">{deal.description}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-white font-bold">{formatCurrency(deal.value)}</div>
      </td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium">
          {deal.stage}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
          {deal.probability}%
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-300">{formatDate(deal.expected_close_date)}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-1">
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
            onClick={() => onView(deal)}
            className="p-1 rounded hover:bg-gray-700/50"
          >
            <Eye className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={() => onEdit(deal)}
            className="p-1 rounded hover:bg-gray-700/50"
          >
            <Edit className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={() => onDelete(deal.id)}
            className="p-1 rounded hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function DealsPage() {
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>(defaultStages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<CrmDeal | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);

  // Load deals from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use default stages (pipeline_stages table doesn't exist yet)
      setStages(defaultStages);
      
      // Load deals
      const response = await DealsAPI.getAll({ limit: 1000 });
      setDeals(response.data);
    } catch (err) {
      console.error('Error loading deals:', err);
      setError('Failed to load deals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Group deals by stage
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.stage_name] = deals.filter(deal => deal.stage === stage.stage_name);
    return acc;
  }, {} as Record<string, CrmDeal[]>);

  // Filter deals based on search
  const filteredDeals = deals.filter(deal =>
    deal.deal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleDealMove(dealId: string, newStage: string) {
    try {
      await DealsAPI.updateStage(dealId, newStage);
      await loadData(); // Reload from database
    } catch (err) {
      console.error('Error moving deal:', err);
      setError('Failed to update deal stage.');
    }
  }

  const handleEditDeal = (deal: CrmDeal) => {
    setSelectedDeal(deal);
    setIsNewDealOpen(true); // Reuse the form dialog for editing
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

  const handleViewDeal = (deal: CrmDeal) => {
    setSelectedDeal(deal);
    setIsDetailsOpen(true);
  };

  // Calculate pipeline metrics
  const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const avgDealSize = deals.length > 0 ? totalPipelineValue / deals.length : 0;
  const dealsClosingThisMonth = deals.filter(deal => {
    if (!deal.expected_close_date) return false;
    const closeDate = new Date(deal.expected_close_date);
    const now = new Date();
    return closeDate.getMonth() === now.getMonth() && closeDate.getFullYear() === now.getFullYear();
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-900/95 backdrop-blur-sm text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Sales Dashboard
            </h1>
            <p className="text-gray-400">
              Track and manage your deals through the sales process
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1 mb-8">
          <button
            className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-blue-500 text-white"
          >
            <DollarSign className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <Target className="w-4 h-4" />
            <span>Pipeline</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Forecast</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{formatCurrency(totalPipelineValue)}</div>
                <div className="text-sm text-blue-300">Total Pipeline</div>
                <div className="text-xs text-gray-400">{deals.length} active deals</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{formatCurrency(avgDealSize)}</div>
                <div className="text-sm text-green-300">Avg Deal Size</div>
                <div className="text-xs text-gray-400">Per opportunity</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{dealsClosingThisMonth.length}</div>
                <div className="text-sm text-purple-300">Closing This Month</div>
                <div className="text-xs text-gray-400">{formatCurrency(dealsClosingThisMonth.reduce((sum, deal) => sum + deal.value, 0))} value</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-white">73%</div>
                <div className="text-sm text-orange-300">Win Rate</div>
                <div className="text-xs text-gray-400">Last 30 days</div>
              </div>
            </div>
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
            {/* View Toggle - Switched order */}
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
            <Button className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white">
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
              <DollarSign className="w-12 h-12 text-gray-400" />
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
              >
                Create Your First Deal
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 