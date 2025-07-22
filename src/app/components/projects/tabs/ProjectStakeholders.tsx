'use client';

import React, { useState, useEffect } from 'react';
import { Project, ProjectStakeholder } from '@/app/types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Users, Plus, UserPlus, Mail, Phone, Building,
  Briefcase, Star, Target, MessageSquare, Clock,
  Edit2, Trash2, Link, ExternalLink
} from 'lucide-react';
import { stakeholdersService } from '@/app/lib/supabase/stakeholders';

interface ProjectStakeholdersProps {
  project: Project;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  position: string;
}

interface Deal {
  id: string;
  title: string;
  value: number;
  status: string;
  created_at: string;
}

export const ProjectStakeholders: React.FC<ProjectStakeholdersProps> = ({
  project
}) => {
  const [stakeholders, setStakeholders] = useState<ProjectStakeholder[]>([]);
  const [showAddStakeholder, setShowAddStakeholder] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<ProjectStakeholder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactDeals, setContactDeals] = useState<Deal[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [influenceLevel, setInfluenceLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [interestLevel, setInterestLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [engagementStrategy, setEngagementStrategy] = useState('');
  const [communicationPreference, setCommunicationPreference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadStakeholders();
    loadAvailableContacts();
  }, [project.id]);

  const loadStakeholders = async () => {
    try {
      setLoading(true);
      const data = await stakeholdersService.getStakeholders(project.id);
      setStakeholders(data);
    } catch (err) {
      setError('Failed to load stakeholders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableContacts = async () => {
    try {
      const data = await stakeholdersService.getAvailableContacts();
      setAvailableContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  };

  const loadContactDeals = async (contactId: string) => {
    try {
      const data = await stakeholdersService.getContactDeals(contactId);
      setContactDeals(data);
    } catch (err) {
      console.error('Failed to load deals:', err);
    }
  };

  const handleContactSelect = async (contact: Contact) => {
    setSelectedContact(contact);
    setName(`${contact.first_name} ${contact.last_name}`);
    setRole(contact.position || '');
    await loadContactDeals(contact.id);
  };

  const handleAddStakeholder = async () => {
    try {
      setLoading(true);
      const stakeholder = {
        project_id: project.id,
        contact_id: selectedContact?.id,
        name,
        role,
        influence_level: influenceLevel,
        interest_level: interestLevel,
        engagement_strategy: engagementStrategy,
        communication_preference: communicationPreference,
        notes
      };
      await stakeholdersService.createStakeholder(stakeholder);
      await loadStakeholders();
      setShowAddStakeholder(false);
      resetForm();
    } catch (err) {
      setError('Failed to create stakeholder');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStakeholder = async () => {
    if (!editingStakeholder) return;
    try {
      setLoading(true);
      const updates = {
        name,
        role,
        influence_level: influenceLevel,
        interest_level: interestLevel,
        engagement_strategy: engagementStrategy,
        communication_preference: communicationPreference,
        notes
      };
      await stakeholdersService.updateStakeholder(editingStakeholder.id, updates);
      await loadStakeholders();
      setEditingStakeholder(null);
      resetForm();
    } catch (err) {
      setError('Failed to update stakeholder');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStakeholder = async (id: string) => {
    try {
      setLoading(true);
      await stakeholdersService.deleteStakeholder(id);
      await loadStakeholders();
    } catch (err) {
      setError('Failed to delete stakeholder');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLastContacted = async (id: string) => {
    try {
      await stakeholdersService.updateLastContacted(id);
      await loadStakeholders();
    } catch (err) {
      console.error('Failed to update last contacted:', err);
    }
  };

  const resetForm = () => {
    setName('');
    setRole('');
    setInfluenceLevel('medium');
    setInterestLevel('medium');
    setEngagementStrategy('');
    setCommunicationPreference('');
    setNotes('');
    setSelectedContact(null);
    setContactDeals([]);
  };

  const startEdit = (stakeholder: ProjectStakeholder) => {
    setEditingStakeholder(stakeholder);
    setName(stakeholder.name);
    setRole(stakeholder.role);
    setInfluenceLevel(stakeholder.influence_level);
    setInterestLevel(stakeholder.interest_level);
    setEngagementStrategy(stakeholder.engagement_strategy || '');
    setCommunicationPreference(stakeholder.communication_preference || '');
    setNotes(stakeholder.notes || '');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLevelColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Stakeholders</h2>
          <p className="text-gray-400">Manage project stakeholders and their engagement</p>
        </div>
        <Button
          onClick={() => setShowAddStakeholder(true)}
          className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Stakeholder
        </Button>
      </div>

      {/* Stakeholder Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stakeholders.length}</div>
              <div className="text-sm text-gray-400">Total Stakeholders</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Star className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stakeholders.filter(s => s.influence_level === 'high').length}
              </div>
              <div className="text-sm text-gray-400">High Influence</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stakeholders.filter(s => s.interest_level === 'high').length}
              </div>
              <div className="text-sm text-gray-400">High Interest</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <MessageSquare className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stakeholders.filter(s => s.last_contacted_at).length}
              </div>
              <div className="text-sm text-gray-400">Contacted</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stakeholder List */}
      <div className="grid gap-4">
        {stakeholders.map((stakeholder) => (
          <Card
            key={stakeholder.id}
            className="bg-gray-900/50 border-gray-700/50 p-4 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{stakeholder.name}</h3>
                  <p className="text-sm text-gray-400">{stakeholder.role}</p>
                  
                  <div className="flex items-center flex-wrap gap-4 mt-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getLevelColor(stakeholder.influence_level)}`}>
                      {stakeholder.influence_level.toUpperCase()} INFLUENCE
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getLevelColor(stakeholder.interest_level)}`}>
                      {stakeholder.interest_level.toUpperCase()} INTEREST
                    </span>
                    {stakeholder.last_contacted_at && (
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Last contacted {formatDate(stakeholder.last_contacted_at)}</span>
                      </div>
                    )}
                  </div>

                  {stakeholder.contact_id && (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center text-gray-400">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{stakeholder.contacts?.email}</span>
                      </div>
                      {stakeholder.contacts?.phone && (
                        <div className="flex items-center text-gray-400">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{stakeholder.contacts.phone}</span>
                        </div>
                      )}
                      {stakeholder.contacts?.company && (
                        <div className="flex items-center text-gray-400">
                          <Building className="w-4 h-4 mr-2" />
                          <span>{stakeholder.contacts.company}</span>
                      </div>
                    )}
                  </div>
                  )}

                  {stakeholder.engagement_strategy && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-300">Engagement Strategy</h4>
                      <p className="text-sm text-gray-400 mt-1">{stakeholder.engagement_strategy}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateLastContacted(stakeholder.id)}
                  className="text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  <Clock className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(stakeholder)}
                  className="text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteStakeholder(stakeholder.id)}
                  className="text-red-400 hover:text-red-300"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {stakeholders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No stakeholders yet</h3>
            <p className="text-gray-400 mb-4">
              Start by adding project stakeholders
            </p>
            <Button
              onClick={() => setShowAddStakeholder(true)}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Stakeholder
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddStakeholder || editingStakeholder) && (
        <Dialog open={true} onOpenChange={() => {
          setShowAddStakeholder(false);
          setEditingStakeholder(null);
          resetForm();
        }}>
          <DialogContent className="bg-[#0B0F1A] border-gray-700/50">
            <div className="space-y-6">
              <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingStakeholder ? 'Edit Stakeholder' : 'Add Stakeholder'}
          </h3>
          
          <div className="space-y-4">
                  {!editingStakeholder && (
                    <div>
                      <label className="text-sm font-medium text-gray-300">Link to Contact (Optional)</label>
                      <div className="mt-1 space-y-2">
                        {availableContacts.map((contact) => (
                          <button
                            key={contact.id}
                            onClick={() => handleContactSelect(contact)}
                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                              selectedContact?.id === contact.id
                                ? 'bg-gray-800 border-blue-500'
                                : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-white">
                                  {contact.first_name} {contact.last_name}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {contact.company} • {contact.position}
                                </div>
                              </div>
                              <Link className="w-4 h-4 text-gray-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedContact && contactDeals.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-300">Associated Deals</label>
                      <div className="mt-1 space-y-2">
                        {contactDeals.map((deal) => (
                          <div
                            key={deal.id}
                            className="p-3 rounded-lg border border-gray-700 bg-gray-900"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-white">{deal.title}</div>
                                <div className="text-sm text-gray-400">
                                  ${deal.value.toLocaleString()} • {deal.status}
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-300">Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter stakeholder name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Role</label>
                    <Input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Enter stakeholder role"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Influence Level</label>
                    <select
                      value={influenceLevel}
                      onChange={(e) => setInfluenceLevel(e.target.value as 'low' | 'medium' | 'high')}
                      className="mt-1 w-full bg-gray-800 border-gray-700 text-gray-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Interest Level</label>
                    <select
                      value={interestLevel}
                      onChange={(e) => setInterestLevel(e.target.value as 'low' | 'medium' | 'high')}
                      className="mt-1 w-full bg-gray-800 border-gray-700 text-gray-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Engagement Strategy</label>
                    <Textarea
                      value={engagementStrategy}
                      onChange={(e) => setEngagementStrategy(e.target.value)}
                      placeholder="Enter engagement strategy"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Communication Preference</label>
                    <Input
                      value={communicationPreference}
                      onChange={(e) => setCommunicationPreference(e.target.value)}
                      placeholder="Enter communication preference"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Notes</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter additional notes"
                      className="mt-1"
                    />
                  </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddStakeholder(false);
                setEditingStakeholder(null);
                      resetForm();
              }}
                    disabled={loading}
            >
              Cancel
            </Button>
            <Button
                    onClick={() => editingStakeholder ? handleEditStakeholder() : handleAddStakeholder()}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
                    disabled={loading}
            >
              {editingStakeholder ? 'Update Stakeholder' : 'Add Stakeholder'}
            </Button>
          </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}; 