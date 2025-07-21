'use client';

import React, { useState } from 'react';
import { Contact, CreateContactRequest } from '@/app/types/contact';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ContactFormProps {
  contact?: Contact;
  onSave: (contact: CreateContactRequest) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const ContactForm: React.FC<ContactFormProps> = ({ contact, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState<CreateContactRequest>({
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    job_title: contact?.job_title || '',
    contact_type: contact?.contact_type || 'unknown',
    contact_source: contact?.contact_source || '',
    address_line_1: contact?.address_line_1 || '',
    city: contact?.city || '',
    state: contact?.state || '',
    postal_code: contact?.postal_code || '',
    country: contact?.country || '',
    website: contact?.website || '',
    linkedin_url: contact?.linkedin_url || '',
    notes: contact?.notes || '',
    tags: contact?.tags || []
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-3xl bg-[#0B0F1A] border-gray-700/50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {contact ? 'Edit Contact' : 'New Contact'}
          </h2>
          <p className="text-gray-400 mb-6">
            {contact ? 'Update contact information' : 'Add a new contact to your network'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">First Name *</label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="bg-gray-800/50 border-gray-700/50 text-white"
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Last Name *</label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="bg-gray-800/50 border-gray-700/50 text-white"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-gray-800/50 border-gray-700/50 text-white"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-gray-800/50 border-gray-700/50 text-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Company</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="bg-gray-800/50 border-gray-700/50 text-white"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Job Title</label>
                <Input
                  value={formData.job_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                  className="bg-gray-800/50 border-gray-700/50 text-white"
                  placeholder="Job title"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Contact Type</label>
                <select
                  value={formData.contact_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_type: e.target.value as 'friend' | 'unknown' | 'prospect' | 'client' }))}
                  className="w-full p-2 bg-gray-800/50 border border-gray-700/50 rounded-md text-white"
                >
                  <option value="unknown">Unknown</option>
                  <option value="friend">Friend</option>
                  <option value="prospect">Prospect</option>
                  <option value="client">Client</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Contact Source</label>
                <Input
                  value={formData.contact_source}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_source: e.target.value }))}
                  className="bg-gray-800/50 border-gray-700/50 text-white"
                  placeholder="e.g., website, referral, linkedin"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Tags</label>
              <div className="flex items-center space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="bg-gray-800/50 border-gray-700/50 text-white flex-1"
                  placeholder="Add a tag and press Enter"
                />
                <Button 
                  type="button" 
                  onClick={addTag}
                  className="bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50"
                >
                  Add
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-[#6E86FF]/20 text-[#6E86FF] rounded text-sm flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-xs hover:text-red-400 ml-2"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-gray-800/50 border-gray-700/50 text-white"
                rows={3}
                placeholder="Add any notes about this contact..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                onClick={onCancel}
                className="bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
              >
                {contact ? 'Update Contact' : 'Create Contact'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 