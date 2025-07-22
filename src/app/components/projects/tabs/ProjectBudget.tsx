import React, { useState } from 'react';
import { Project, ProjectBudgetItem } from '@/app/types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Filter,
  Search,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  BarChart2
} from 'lucide-react';

interface ProjectBudgetProps {
  project: Project;
}

export const ProjectBudget: React.FC<ProjectBudgetProps> = ({
  project
}) => {
  const [budgetItems, setBudgetItems] = useState<ProjectBudgetItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectBudgetItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ProjectBudgetItem['status']>('all');
  const [sortBy, setSortBy] = useState<'category' | 'amount' | 'variance'>('amount');

  const getStatusColor = (status: ProjectBudgetItem['status']) => {
    switch (status) {
      case 'planned': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'approved': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'spent': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'cancelled': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-400';
    if (variance < 0) return 'text-green-400';
    return 'text-gray-400';
  };

  const handleAddItem = () => {
    // TODO: Implement budget item addition
    setShowAddItem(false);
  };

  const handleEditItem = (item: ProjectBudgetItem) => {
    // TODO: Implement budget item editing
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    // TODO: Implement budget item deletion
  };

  const filteredItems = budgetItems
    .filter(item => {
      if (filterStatus === 'all') return true;
      return item.status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'category':
          return a.category.localeCompare(b.category);
        case 'amount':
          return b.estimated_amount - a.estimated_amount;
        case 'variance':
          const varianceA = (a.actual_amount || 0) - a.estimated_amount;
          const varianceB = (b.actual_amount || 0) - b.estimated_amount;
          return Math.abs(varianceB) - Math.abs(varianceA);
        default:
          return 0;
      }
    });

  const totalEstimated = budgetItems.reduce((acc, item) => acc + item.estimated_amount, 0);
  const totalActual = budgetItems.reduce((acc, item) => acc + (item.actual_amount || 0), 0);
  const totalVariance = totalActual - totalEstimated;
  const approvedItems = budgetItems.filter(item => item.status === 'approved');
  const spentItems = budgetItems.filter(item => item.status === 'spent');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Budget</h2>
          <p className="text-gray-400">Track and manage project expenses</p>
        </div>
        <Button
          onClick={() => setShowAddItem(true)}
          className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Budget Item
        </Button>
      </div>

      {/* Budget Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                ${totalEstimated.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Budget</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BarChart2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                ${totalActual.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Actual Spent</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              totalVariance > 0 ? 'bg-red-500/20' : 'bg-green-500/20'
            }`}>
              {totalVariance > 0 ? (
                <ArrowUp className={`w-5 h-5 ${
                  totalVariance > 0 ? 'text-red-400' : 'text-green-400'
                }`} />
              ) : (
                <ArrowDown className={`w-5 h-5 ${
                  totalVariance > 0 ? 'text-red-400' : 'text-green-400'
                }`} />
              )}
            </div>
            <div>
              <div className={`text-2xl font-bold ${getVarianceColor(totalVariance)}`}>
                ${Math.abs(totalVariance).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">
                {totalVariance > 0 ? 'Over Budget' : 'Under Budget'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {((spentItems.length / budgetItems.length) * 100 || 0).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400">Budget Utilized</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
            >
              <option value="all">All Status</option>
              <option value="planned">Planned</option>
              <option value="approved">Approved</option>
              <option value="spent">Spent</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
            >
              <option value="category">Category</option>
              <option value="amount">Amount</option>
              <option value="variance">Variance</option>
            </select>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search budget items..."
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
          />
        </div>
      </div>

      {/* Budget Items List */}
      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="bg-gray-900/50 border-gray-700/50 p-4 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`mt-1 p-2 rounded-lg ${getStatusColor(item.status)}`}>
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{item.category}</h3>
                  <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                  <div className="flex items-center flex-wrap gap-4 mt-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                    <div className="flex items-center text-gray-400">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>Estimated: ${item.estimated_amount.toLocaleString()}</span>
                    </div>
                    {item.actual_amount !== undefined && (
                      <div className="flex items-center text-gray-400">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>Actual: ${item.actual_amount.toLocaleString()}</span>
                      </div>
                    )}
                    {item.variance !== undefined && (
                      <div className={`flex items-center ${getVarianceColor(item.variance)}`}>
                        {item.variance > 0 ? (
                          <ArrowUp className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDown className="w-4 h-4 mr-1" />
                        )}
                        <span>
                          Variance: ${Math.abs(item.variance).toLocaleString()}
                          {item.variance > 0 ? ' Over' : ' Under'}
                        </span>
                      </div>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-2">{item.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingItem(item)}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No budget items found</h3>
            <p className="text-gray-400 mb-4">
              {filterStatus === 'all'
                ? 'Start by adding budget items'
                : `No ${filterStatus} budget items found`}
            </p>
            <Button
              onClick={() => setShowAddItem(true)}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Budget Item
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddItem || editingItem) && (
        <Card className="bg-gray-900/50 border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingItem ? 'Edit Budget Item' : 'Add Budget Item'}
          </h3>
          
          {/* Form fields will go here */}
          <div className="space-y-4">
            {/* TODO: Add form fields */}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddItem(false);
                setEditingItem(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingItem ? handleEditItem(editingItem) : handleAddItem()}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              {editingItem ? 'Update Budget Item' : 'Add Budget Item'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}; 