'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Users, 
  UserPlus,
  Target,
  Star,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Contact, ContactFilters, CreateContactRequest } from '@/app/types/contact';
import { ContactRow } from '@/app/components/contacts/ContactRow';
import { ContactForm } from '@/app/components/contacts/ContactForm';
import { ContactDetails } from '@/app/components/contacts/ContactDetails';

// Mock data for demonstration
const mockContacts: Contact[] = [
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
    city: 'New York',
    state: 'NY',
    tags: ['enterprise', 'hot-lead'],
    lead_score: 85,
    notes: 'Met at TechConf 2024. Interested in enterprise solutions. Follow up in Q2.',
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
    city: 'Los Angeles',
    state: 'CA',
    tags: ['client', 'recurring'],
    lead_score: 95,
    notes: 'Long-term client. Monthly retainer. Very satisfied with our services.',
    last_contact_date: '2024-01-14T14:15:00Z',
    created_at: '2023-12-15T00:00:00Z',
    updated_at: '2024-01-14T14:15:00Z'
  }
];

type TabType = 'overview' | 'leads' | 'clients';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>(mockContacts);
  const [filters, setFilters] = useState<ContactFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showContactDetails, setShowContactDetails] = useState(false);

  // Filter and search logic
  useEffect(() => {
    let filtered = contacts;

    // Apply tab filters
    if (activeTab === 'leads') {
      filtered = filtered.filter(contact => contact.contact_type === 'prospect');
    } else if (activeTab === 'clients') {
      filtered = filtered.filter(contact => contact.contact_type === 'client');
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(contact =>
        contact.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply additional filters
    if (filters.contact_type) {
      filtered = filtered.filter(contact => contact.contact_type === filters.contact_type);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, filters, activeTab]);

  const handleCreateContact = (contactData: CreateContactRequest) => {
    const newContact: Contact = {
      ...contactData,
      contact_type: contactData.contact_type || 'unknown',
      id: Date.now().toString(),
      lead_score: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setContacts(prev => [newContact, ...prev]);
    setShowForm(false);
  };

  const handleEditContact = (contactData: CreateContactRequest) => {
    if (editingContact) {
      const updatedContact: Contact = {
        ...editingContact,
        ...contactData,
        updated_at: new Date().toISOString()
      };
      setContacts(prev => prev.map(c => c.id === editingContact.id ? updatedContact : c));
      setEditingContact(null);
      setShowForm(false);
    }
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactDetails(true);
  };

  const getTabStats = () => {
    const totalContacts = contacts.length;
    const prospects = contacts.filter(c => c.contact_type === 'prospect').length;
    const clients = contacts.filter(c => c.contact_type === 'client').length;
    const avgScore = Math.round(contacts.reduce((sum, c) => sum + c.lead_score, 0) / totalContacts);

    return { totalContacts, prospects, clients, avgScore };
  };

  const stats = getTabStats();

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
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
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'leads'
                ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Leads</span>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'clients'
                ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
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
                <div className="text-2xl font-bold text-white">{stats.totalContacts}</div>
                <div className="text-sm text-blue-300">Total Contacts</div>
                <div className="text-xs text-gray-400">All contacts</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.prospects}</div>
                <div className="text-sm text-green-300">Prospects</div>
                <div className="text-xs text-gray-400">Potential clients</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.clients}</div>
                <div className="text-sm text-purple-300">Active Clients</div>
                <div className="text-xs text-gray-400">Current clients</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
            <div className="flex items-center space-x-3">
              <Star className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.avgScore}</div>
                <div className="text-sm text-orange-300">Avg Lead Score</div>
                <div className="text-xs text-gray-400">Overall quality</div>
              </div>
            </div>
          </div>
        </div>

        {/* Replace the showForm conditional rendering with this */}
        <ContactForm
          contact={editingContact || undefined}
          onSave={editingContact ? handleEditContact : handleCreateContact}
          onCancel={() => {
            setShowForm(false);
            setEditingContact(null);
          }}
          isOpen={showForm}
        />

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
            className="px-3 py-2 bg-gray-800/50 border-gray-700/50 rounded-lg text-white"
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tag
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredContacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    onEdit={(contact: Contact) => {
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

        {/* Contact Details Dialog */}
        {selectedContact && (
          <ContactDetails
            contact={selectedContact}
            isOpen={showContactDetails}
            onClose={() => {
              setShowContactDetails(false);
              setSelectedContact(null);
            }}
          />
        )}
      </div>
    </div>
  );
} 