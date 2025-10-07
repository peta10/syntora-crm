'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Users, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  CheckCircle2,
  Target,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CrmContact, ContactFilters, CreateContactRequest } from '@/app/types/crm';
import { ContactDetails } from '@/app/components/crm/ContactDetails';
import { ContactsAPI } from '@/app/lib/api/crm-contacts';

// Removed mock data - all contacts now loaded from Supabase
const _oldMockContacts: CrmContact[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Corp',
    job_title: 'CEO',
    contact_type: 'prospect',
    contact_source: 'website',
    address: {
      city: 'New York',
      state: 'NY'
    },
    tags: ['enterprise', 'hot-lead'],
    lead_score: 85,
    last_contact_date: '2024-01-15T10:30:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.j@marketingplus.com',
    phone: '+1 (555) 987-6543',
    company: 'Marketing Plus',
    job_title: 'Marketing Director',
    contact_type: 'client',
    contact_source: 'referral',
    address: {
      city: 'Los Angeles',
      state: 'CA'
    },
    tags: ['client', 'recurring'],
    lead_score: 95,
    last_contact_date: '2024-01-14T14:15:00Z',
    created_at: '2023-12-15T00:00:00Z',
    updated_at: '2024-01-14T14:15:00Z'
  },
  {
    id: '3',
    first_name: 'Mike',
    last_name: 'Davis',
    email: 'mike@designstudio.com',
    phone: '+1 (555) 456-7890',
    company: 'Design Studio',
    job_title: 'Creative Director',
    contact_type: 'prospect',
    contact_source: 'linkedin',
    address: {
      city: 'Austin',
      state: 'TX'
    },
    tags: ['creative', 'medium-lead'],
    lead_score: 60,
    last_contact_date: '2024-01-10T09:00:00Z',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  }
];

interface ContactCardProps {
  contact: CrmContact;
  onEdit: (contact: CrmContact) => void;
  onDelete: (id: string) => void;
  onView: (contact: CrmContact) => void;
}

const ContactRow: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete, onView }) => {
  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'client': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'prospect': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'friend': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <tr 
      className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 group cursor-pointer"
      onClick={() => onView(contact)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6E86FF]/20 to-[#FF6BBA]/20 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {contact.first_name[0]}{contact.last_name[0]}
            </span>
          </div>
          <div>
            <div className="text-white font-medium">
              {contact.first_name} {contact.last_name}
            </div>
            <div className="text-gray-400 text-sm">{contact.job_title}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-white">{contact.company}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-300">{contact.email}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-300">{contact.phone}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getContactTypeColor(contact.contact_type)}`}>
          {contact.contact_type}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`text-sm font-medium ${getLeadScoreColor(contact.lead_score)}`}>
          {contact.lead_score}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-1">
          {contact.tags && contact.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-800/50 text-xs text-gray-300 rounded">
              {tag}
            </span>
          ))}
          {contact.tags && contact.tags.length > 2 && (
            <span className="text-xs text-gray-400">+{contact.tags.length - 2}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(contact);
            }}
            className="p-1 rounded hover:bg-gray-700/50"
          >
            <Edit className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(contact.id);
            }}
            className="p-1 rounded hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface ContactFormProps {
  contact?: CrmContact;
  onSave: (contact: CreateContactRequest) => void;
  onCancel: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ contact, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CreateContactRequest>({
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    job_title: contact?.job_title || '',
    contact_type: contact?.contact_type || 'unknown',
    contact_source: contact?.contact_source || '',
    address_line_1: contact?.address?.address_line_1 || '',
    city: contact?.address?.city || '',
    state: contact?.address?.state || '',
    postal_code: contact?.address?.postal_code || '',
    country: contact?.address?.country || '',
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
    <Card className="bg-gray-900/50 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white">
          {contact ? 'Edit Contact' : 'New Contact'}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {contact ? 'Update contact information' : 'Add a new contact to your CRM'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="text-gray-300">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className="bg-gray-800/50 border-gray-600/50 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-gray-300">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="bg-gray-800/50 border-gray-600/50 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-gray-800/50 border-gray-600/50 text-white"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-300">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-gray-800/50 border-gray-600/50 text-white"
              />
            </div>
          </div>

          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company" className="text-gray-300">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="bg-gray-800/50 border-gray-600/50 text-white"
              />
            </div>
            <div>
              <Label htmlFor="job_title" className="text-gray-300">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                className="bg-gray-800/50 border-gray-600/50 text-white"
              />
            </div>
          </div>

          {/* Contact Type and Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_type" className="text-gray-300">Contact Type</Label>
              <select
                id="contact_type"
                value={formData.contact_type}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_type: e.target.value as 'friend' | 'unknown' | 'prospect' | 'client' }))}
                className="w-full p-2 bg-gray-800/50 border border-gray-600/50 rounded-md text-white"
              >
                <option value="unknown">Unknown</option>
                <option value="friend">Friend</option>
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div>
              <Label htmlFor="contact_source" className="text-gray-300">Contact Source</Label>
              <Input
                id="contact_source"
                value={formData.contact_source}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_source: e.target.value }))}
                className="bg-gray-800/50 border-gray-600/50 text-white"
                placeholder="e.g., website, referral, linkedin"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address_line_1" className="text-gray-300">Address</Label>
            <Input
              id="address_line_1"
              value={formData.address_line_1}
              onChange={(e) => setFormData(prev => ({ ...prev, address_line_1: e.target.value }))}
              className="bg-gray-800/50 border-gray-600/50 text-white mb-2"
              placeholder="Street address"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="bg-gray-800/50 border-gray-600/50 text-white"
                placeholder="City"
              />
              <Input
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="bg-gray-800/50 border-gray-600/50 text-white"
                placeholder="State"
              />
              <Input
                value={formData.postal_code}
                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                className="bg-gray-800/50 border-gray-600/50 text-white"
                placeholder="ZIP Code"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-gray-300">Tags</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="bg-gray-800/50 border-gray-600/50 text-white"
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-[#6E86FF]/20 text-[#6E86FF] rounded text-sm flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-xs hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-gray-300">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-gray-800/50 border-gray-600/50 text-white"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA]">
              {contact ? 'Update Contact' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<CrmContact[]>([]);
  const [filters, setFilters] = useState<ContactFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<CrmContact | null>(null);
  const [selectedContact, setSelectedContact] = useState<CrmContact | null>(null);

  // Load contacts from Supabase on mount
  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ContactsAPI.getAll({ limit: 1000 });
      const mappedContacts: CrmContact[] = response.data;
      setContacts(mappedContacts);
      setFilteredContacts(mappedContacts);
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError('Failed to load contacts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Filter and search logic
  useEffect(() => {
    let filtered = contacts;

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(contact =>
        contact.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.contact_type) {
      filtered = filtered.filter(contact => contact.contact_type === filters.contact_type);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, filters]);

  async function handleCreateContact(contactData: CreateContactRequest) {
    try {
      await ContactsAPI.create(contactData);
      await loadContacts(); // Reload from database
      setShowForm(false);
    } catch (err) {
      console.error('Error creating contact:', err);
      setError('Failed to create contact.');
    }
  }

  async function handleEditContact(contactData: CreateContactRequest) {
    if (editingContact) {
      try {
        await ContactsAPI.update(editingContact.id, contactData);
        await loadContacts(); // Reload from database
        setEditingContact(null);
        setShowForm(false);
      } catch (err) {
        console.error('Error updating contact:', err);
        setError('Failed to update contact.');
      }
    }
  }

  async function handleDeleteContact(id: string) {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    
    try {
      await ContactsAPI.delete(id);
      await loadContacts(); // Reload from database
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact.');
    }
  }

  const handleViewContact = (contact: CrmContact) => {
    setSelectedContact(contact);
  };

  return (
    <div className="min-h-screen bg-gray-900/95 backdrop-blur-sm text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Contacts Dashboard
            </h1>
            <p className="text-gray-400">
              Deep insights into your network and relationships
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
            <Users className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <Target className="w-4 h-4" />
            <span>Leads</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <Star className="w-4 h-4" />
            <span>Clients</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{contacts.length}</div>
                <div className="text-sm text-blue-300">Total Contacts</div>
                <div className="text-xs text-gray-400">All contacts</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {contacts.filter(c => c.contact_type === 'prospect').length}
                </div>
                <div className="text-sm text-green-300">Prospects</div>
                <div className="text-xs text-gray-400">Potential clients</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {contacts.filter(c => c.contact_type === 'client').length}
                </div>
                <div className="text-sm text-purple-300">Active Clients</div>
                <div className="text-xs text-gray-400">Current clients</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
            <div className="flex items-center space-x-3">
              <Star className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(contacts.reduce((sum, c) => sum + c.lead_score, 0) / contacts.length)}
                </div>
                <div className="text-sm text-orange-300">Avg Lead Score</div>
                <div className="text-xs text-gray-400">Overall quality</div>
              </div>
            </div>
          </div>
        </div>

        {showForm ? (
          <ContactForm
            contact={editingContact || undefined}
            onSave={editingContact ? handleEditContact : handleCreateContact}
            onCancel={() => {
              setShowForm(false);
              setEditingContact(null);
            }}
          />
        ) : (
          <>
            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search contacts by name, email, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-700/50 text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" className="border-gray-700/50 text-gray-300 hover:text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" className="border-gray-700/50 text-gray-300 hover:text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <select
                value={filters.contact_type || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  contact_type: e.target.value ? e.target.value as 'friend' | 'unknown' | 'prospect' | 'client' : undefined 
                }))}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white"
              >
                <option value="">All Types</option>
                <option value="prospect">Prospects</option>
                <option value="client">Clients</option>
                <option value="friend">Friends</option>
                <option value="unknown">Unknown</option>
              </select>
              
              <Button variant="outline" size="sm" className="border-gray-700/50">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>

            {/* Contacts Table */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-700/50">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Score
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
                    {filteredContacts.map((contact) => (
                      <ContactRow
                        key={contact.id}
                        contact={contact}
                        onEdit={(contact: CrmContact) => {
                          setEditingContact(contact);
                          setShowForm(true);
                        }}
                        onDelete={handleDeleteContact}
                        onView={handleViewContact}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-[#6E86FF]/20 to-[#FF6BBA]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No contacts found</h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery || filters.contact_type 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first contact'
                  }
                </p>
                {!searchQuery && !filters.contact_type && (
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA]"
                  >
                    Add Your First Contact
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <ContactDetails
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onEdit={(contact: CrmContact) => {
            setEditingContact(contact);
            setShowForm(true);
            setSelectedContact(null);
          }}
        />
      )}
    </div>
  );
} 