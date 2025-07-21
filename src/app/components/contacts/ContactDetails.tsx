'use client';

import React from 'react';
import { Contact } from '@/app/types/contact';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Building, Mail, Phone, MapPin, Globe, Linkedin, Calendar, Star } from 'lucide-react';

interface ContactDetailsProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactDetails: React.FC<ContactDetailsProps> = ({ contact, isOpen, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#0B0F1A] border-gray-700/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6E86FF]/20 to-[#FF6BBA]/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {contact.first_name[0]}{contact.last_name[0]}
              </span>
            </div>
            <div>
              <div className="text-2xl">{contact.first_name} {contact.last_name}</div>
              <div className="text-sm text-gray-400">{contact.job_title}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Contact Information */}
          <Card className="bg-gray-900/50 border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <Building className="w-5 h-5 text-[#6E86FF]" />
                <div>
                  <div className="font-medium">{contact.company}</div>
                  <div className="text-sm text-gray-400">{contact.job_title}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5 text-[#6E86FF]" />
                <a href={`mailto:${contact.email}`} className="hover:text-white transition-colors">
                  {contact.email}
                </a>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-5 h-5 text-[#6E86FF]" />
                <a href={`tel:${contact.phone}`} className="hover:text-white transition-colors">
                  {contact.phone}
                </a>
              </div>

              {(contact.city || contact.state) && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-[#6E86FF]" />
                  <div>{[contact.city, contact.state].filter(Boolean).join(', ')}</div>
                </div>
              )}

              {contact.website && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <Globe className="w-5 h-5 text-[#6E86FF]" />
                  <a href={contact.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {contact.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              {contact.linkedin_url && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <Linkedin className="w-5 h-5 text-[#6E86FF]" />
                  <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Additional Details */}
          <Card className="bg-gray-900/50 border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Additional Details</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-medium">Lead Score</div>
                  <div className="text-2xl font-bold text-white">{contact.lead_score}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-300">
                <Calendar className="w-5 h-5 text-[#6E86FF]" />
                <div>
                  <div className="font-medium">Last Contact</div>
                  <div className="text-sm text-gray-400">
                    {contact.last_contact_date ? formatDate(contact.last_contact_date) : 'No recent contact'}
                  </div>
                </div>
              </div>

              {contact.tags && contact.tags.length > 0 && (
                <div>
                  <div className="font-medium text-gray-300 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-[#6E86FF]/20 text-[#6E86FF] rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Notes Section */}
          {contact.notes && (
            <Card className="bg-gray-900/50 border-gray-700/50 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{contact.notes}</p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 