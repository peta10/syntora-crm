'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrmDeal, CrmActivity } from '@/app/types/crm';
import { 
  DollarSign, 
  Calendar, 
  User, 
  Building,
  Clock,
  Tag,
  MessageSquare,
  FileText,
  TrendingUp
} from 'lucide-react';

interface DealDetailsDialogProps {
  deal: CrmDeal;
  isOpen: boolean;
  onClose: () => void;
}

export function DealDetailsDialog({ deal, isOpen, onClose }: DealDetailsDialogProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{deal.deal_name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Deal Summary */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-sm text-gray-400">Deal Value</div>
                    <div className="text-lg font-bold">{formatCurrency(deal.value)}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-sm text-gray-400">Expected Close</div>
                    <div className="text-lg">{formatDate(deal.expected_close_date)}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-sm text-gray-400">Probability</div>
                    <div className="text-lg">{deal.probability}%</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-sm text-gray-400">Next Action</div>
                    <div className="text-lg">{deal.next_action || 'No action scheduled'}</div>
                    {deal.next_action_date && (
                      <div className="text-sm text-gray-400">{formatDate(deal.next_action_date)}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg">
                  <Tag className="w-5 h-5 text-pink-400" />
                  <div>
                    <div className="text-sm text-gray-400">Tags</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {deal.tags?.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-700 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {deal.description && (
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                <p className="text-gray-200">{deal.description}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Activity</h3>
              <button className="px-4 py-2 bg-blue-500 rounded-lg text-sm">
                Log Activity
              </button>
            </div>

            <div className="space-y-4">
              {/* Activity Timeline Placeholder */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400">No activities logged yet</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Documents</h3>
              <button className="px-4 py-2 bg-blue-500 rounded-lg text-sm">
                Upload Document
              </button>
            </div>

            <div className="space-y-4">
              {/* Documents List Placeholder */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400">No documents attached</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Forecast Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Amount</span>
                    <span className="text-white">{formatCurrency(deal.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Probability</span>
                    <span className="text-white">{deal.probability}%</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-400">Weighted Forecast</span>
                    <span className="text-green-400">
                      {formatCurrency(deal.value * (deal.probability / 100))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Timeline</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white">{formatDate(deal.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-white">{formatDate(deal.updated_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expected Close</span>
                    <span className="text-white">{formatDate(deal.expected_close_date)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 