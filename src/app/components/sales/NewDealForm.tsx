'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CrmContact, CreateDealRequest } from '@/app/types/crm';
import { PipelineStage } from '@/app/types/sales';

interface NewDealFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dealData: CreateDealRequest) => void;
  stages: PipelineStage[];
}

export function NewDealForm({ isOpen, onClose, onSubmit, stages }: NewDealFormProps) {
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [formData, setFormData] = useState<Partial<CreateDealRequest>>({
    deal_name: '',
    contact_id: '',
    value: 0,
    stage: stages[0]?.stage_name || '',
    probability: stages[0]?.probability || 0,
    expected_close_date: '',
    description: '',
    tags: []
  });

  // Fetch contacts when the form opens
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts');
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deal_name || !formData.contact_id || !formData.stage) {
      return; // Form validation failed
    }
    onSubmit(formData as CreateDealRequest);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) || 0 : value
    }));

    // Update probability when stage changes
    if (name === 'stage') {
      const selectedStage = stages.find(s => s.stage_name === value);
      if (selectedStage) {
        setFormData(prev => ({
          ...prev,
          probability: selectedStage.probability
        }));
      }
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="deal_name">Deal Name</Label>
            <Input
              id="deal_name"
              name="deal_name"
              value={formData.deal_name}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="contact_id">Contact</Label>
            <select
              id="contact_id"
              name="contact_id"
              value={formData.contact_id}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              required
            >
              <option value="">Select a contact</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name} - {contact.company || 'No company'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="value">Deal Value</Label>
            <Input
              id="value"
              name="value"
              type="number"
              value={formData.value}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700 text-white"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="stage">Stage</Label>
            <select
              id="stage"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              required
            >
              {stages.map(stage => (
                <option key={stage.id} value={stage.stage_name}>
                  {stage.stage_name} ({stage.probability}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="expected_close_date">Expected Close Date</Label>
            <Input
              id="expected_close_date"
              name="expected_close_date"
              type="date"
              value={formData.expected_close_date}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700 text-white"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags?.join(', ') || ''}
              onChange={handleTagsChange}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="enterprise, software, recurring"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-700 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create Deal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 