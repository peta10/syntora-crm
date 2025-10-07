'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
  CheckCircle,
  List
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Contact, ContactFilters, CreateContactRequest } from '@/app/types/contact';
import { ContactRow } from '@/app/components/contacts/ContactRow';
import { ContactForm } from '@/app/components/contacts/ContactForm';
import { ContactDetails } from '@/app/components/contacts/ContactDetails';
import { ContactsAPI } from '@/app/lib/api/crm-contacts';
import { CrmContact } from '@/app/types/crm';

type TabType = 'all' | 'clients' | 'leads' | 'prospects';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContactFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showContactDetails, setShowContactDetails] = useState(false);

  // Load contacts from Supabase on mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ContactsAPI.getAll({ limit: 1000 }); // Get all contacts
      
      // Map CrmContact to Contact type - the API already handles field mapping
      const mappedContacts: Contact[] = response.data.map((c: any) => ({
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        business_id: c.business_id,
        job_title: c.job_title, // API maps title -> job_title
        contact_type: c.contact_type,
        contact_source: c.contact_source, // API maps lead_source -> contact_source
        address: c.address,
        website: c.website,
        linkedin_url: c.linkedin_url,
        tags: c.tags || [],
        lead_score: c.lead_score || 0,
        notes: c.notes,
        last_contact_date: c.last_contact_date,
        created_at: c.created_at,
        updated_at: c.updated_at
      }));
      
      setContacts(mappedContacts);
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError('Failed to load contacts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = contacts;

    // Apply tab filters
    if (activeTab === 'clients') {
      filtered = filtered.filter(contact => contact.contact_type === 'client');
    } else if (activeTab === 'leads') {
      filtered = filtered.filter(contact => 
        contact.contact_type === 'prospect' && (contact.lead_score || 0) >= 70
      );
    } else if (activeTab === 'prospects') {
      filtered = filtered.filter(contact => contact.contact_type === 'prospect');
    }
    // 'all' tab shows all contacts - no filtering needed

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

  const handleCreateContact = async (contactData: CreateContactRequest) => {
    try {
      setIsLoading(true);
      await ContactsAPI.create(contactData);
      await loadContacts(); // Reload all contacts
      setShowForm(false);
    } catch (err) {
      console.error('Error creating contact:', err);
      setError('Failed to create contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditContact = async (contactData: CreateContactRequest) => {
    if (editingContact) {
      try {
        setIsLoading(true);
        await ContactsAPI.update(editingContact.id, contactData);
        await loadContacts(); // Reload all contacts
        setEditingContact(null);
        setShowForm(false);
      } catch (err) {
        console.error('Error updating contact:', err);
        setError('Failed to update contact. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      setIsLoading(true);
      await ContactsAPI.delete(id);
      await loadContacts(); // Reload all contacts
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactDetails(true);
  };

  const getTabStats = () => {
    const totalContacts = contacts.length;
    const clients = contacts.filter(c => c.contact_type === 'client').length;
    const leads = contacts.filter(c => c.contact_type === 'prospect' && (c.lead_score || 0) >= 70).length;
    const prospects = contacts.filter(c => c.contact_type === 'prospect').length;
    const avgScore = Math.round(contacts.reduce((sum, c) => sum + (c.lead_score || 0), 0) / totalContacts) || 0;

    return { totalContacts, clients, leads, prospects, avgScore };
  };

  const stats = getTabStats();

  return (
    <div className="min-h-screen bg-gray-900/95 backdrop-blur-sm text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
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
                Contact Management
              </h1>
              <p className="text-gray-400">Manage all client relationships and prospects</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-1">
            {[
              { id: 'all' as const, label: 'All Contacts', icon: List, color: '#10B981' },
              { id: 'clients' as const, label: 'Clients', icon: CheckCircle, color: '#6E86FF' },
              { id: 'leads' as const, label: 'Leads', icon: Target, color: '#FF6BBA' },
              { id: 'prospects' as const, label: 'Prospects', icon: Users, color: '#B279DB' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-5 h-5" style={{ color: activeTab === tab.id ? '#fff' : tab.color }} />
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg border-2 border-white/20"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#6E86FF]/20 to-[#6E86FF]/10 border border-[#6E86FF]/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-[#6E86FF]" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalContacts}</div>
                <div className="text-sm text-[#6E86FF]">Total Contacts</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#6E86FF]/20 to-[#6E86FF]/10 border border-[#6E86FF]/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-[#6E86FF]" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.clients}</div>
                <div className="text-sm text-[#6E86FF]">Active Clients</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#FF6BBA]/20 to-[#FF6BBA]/10 border border-[#FF6BBA]/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-[#FF6BBA]" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.leads}</div>
                <div className="text-sm text-[#FF6BBA]">Hot Leads</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#B279DB]/20 to-[#B279DB]/10 border border-[#B279DB]/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-[#B279DB]" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.avgScore}</div>
                <div className="text-sm text-[#B279DB]">Avg Lead Score</div>
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => { setError(null); loadContacts(); }}
              className="mt-2 text-sm text-red-300 hover:text-red-100 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6E86FF]"></div>
              <p className="text-gray-400">Loading contacts...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Contacts Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
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

            {/* Empty State */}
            {filteredContacts.length === 0 && !isLoading && (
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