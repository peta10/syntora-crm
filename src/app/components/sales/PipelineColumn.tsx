'use client';

import React, { useState, useRef } from 'react';
import { DollarSign, Calendar, Tag, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Deal } from '@/app/types/sales';
import { PipelineStage } from '@/app/types/sales';
import { motion, AnimatePresence } from 'framer-motion';

interface PipelineColumnProps {
  stage: PipelineStage;
  deals: Deal[];
  onDealMove: (dealId: string, newStage: string) => void;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onView: (deal: Deal) => void;
}

export function PipelineColumn({
  stage,
  deals,
  onDealMove,
  onEdit,
  onDelete,
  onView
}: PipelineColumnProps) {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);
  const columnRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
    setDraggedDeal(dealId);
    
    // Set the drag image to be the card itself
    if (e.target instanceof HTMLElement) {
      const card = e.target.closest('.deal-card');
      if (card instanceof HTMLElement) {
        e.dataTransfer.setDragImage(card, card.offsetWidth / 2, card.offsetHeight / 2);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(true);

    // Calculate drag position for visual feedback
    if (columnRef.current) {
      const rect = columnRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      columnRef.current.style.setProperty('--drag-x', `${mouseX}px`);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(false);
    const dealId = e.dataTransfer.getData('dealId');
    if (dealId) {
      onDealMove(dealId, stage.stage_name);
    }
    setDraggedDeal(null);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const weightedValue = deals.reduce((sum, deal) => sum + (deal.value * (deal.probability / 100)), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-w-[320px] flex flex-col" ref={columnRef}>
      {/* Column Header */}
      <div 
        className="p-4 rounded-t-xl border-2 border-dashed"
        style={{ 
          borderColor: `${stage.color_hex}40`,
          background: `linear-gradient(to bottom, ${stage.color_hex}10, transparent)`
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color_hex }}
            />
            <h3 className="font-medium text-white">{stage.stage_name}</h3>
            <span className="text-sm text-gray-400">({deals.length})</span>
          </div>
          <button className="p-1 rounded hover:bg-gray-700/50">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-400">Total Value</div>
            <div className="font-medium text-white">{formatCurrency(totalValue)}</div>
          </div>
          <div>
            <div className="text-gray-400">Weighted</div>
            <div className="font-medium text-green-400">{formatCurrency(weightedValue)}</div>
          </div>
        </div>
      </div>

      {/* Deals Container */}
      <div 
        className={`flex-1 p-2 space-y-2 min-h-[400px] rounded-b-xl transition-all relative ${
          isDraggedOver 
            ? 'bg-gray-800/50 border-2 border-dashed border-blue-500/50' 
            : 'bg-gray-900/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {deals.map((deal) => (
            <motion.div
              key={deal.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`deal-card ${draggedDeal === deal.id ? 'opacity-50' : ''}`}
              style={{
                transformOrigin: 'center'
              }}
            >
              <Card
                className="bg-gray-800 border-gray-700 hover:border-blue-500/50 transition-all duration-300 cursor-move group"
                draggable
                onDragStart={(e) => handleDragStart(e, deal.id)}
                onDragEnd={handleDragEnd}
                onClick={() => onView(deal)}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-white mb-1">{deal.title}</h4>
                      {deal.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">{deal.description}</p>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-1 rounded hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(deal);
                        }}
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="font-medium text-white">{formatCurrency(deal.value)}</span>
                    </div>
                    <span className="text-sm font-medium text-blue-400">{deal.probability}%</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(deal.close_date)}</span>
                  </div>

                  {deal.tags && deal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {deal.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {deals.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-sm">Drop deals here</p>
            </div>
          </div>
        )}

        {/* Drop Indicator */}
        {isDraggedOver && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at var(--drag-x) center, ${stage.color_hex}20 0%, transparent 70%)`
            }}
          />
        )}
      </div>
    </div>
  );
} 