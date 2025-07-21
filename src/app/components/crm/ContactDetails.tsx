import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Phone,
  Building,
  MapPin,
  Globe,
  Linkedin,
  Calendar,
  Star,
  Edit,
  Tag,
  Clock,
  MessageSquare
} from 'lucide-react';
import { CrmContact } from '@/app/types/crm';
import { Button } from '@/components/ui/button';

interface ContactDetailsProps {
  contact: CrmContact;
  onClose: () => void;
  onEdit: (contact: CrmContact) => void;
}

export const ContactDetails: React.FC<ContactDetailsProps> = ({
  contact,
  onClose,
  onEdit
}) => {
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900/90 rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/90 border-b border-gray-700/50 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6E86FF]/20 to-[#FF6BBA]/20 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl font-medium">
                {contact.first_name[0]}{contact.last_name[0]}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {contact.first_name} {contact.last_name}
              </h2>
              <div className="flex items-center space-x-3 text-gray-400">
                <span>{contact.job_title}</span>
                {contact.company && (
                  <>
                    <span>•</span>
                    <span>{contact.company}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onEdit(contact)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Contact Type</div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getContactTypeColor(contact.contact_type)}`}>
                {contact.contact_type}
              </span>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Lead Score</div>
              <div className={`text-2xl font-bold ${getLeadScoreColor(contact.lead_score)}`}>
                {contact.lead_score}
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Source</div>
              <div className="text-white">{contact.contact_source || 'Not specified'}</div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {contact.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <a href={`mailto:${contact.email}`} className="text-blue-400 hover:underline">
                      {contact.email}
                    </a>
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-400" />
                    <a href={`tel:${contact.phone}`} className="text-green-400 hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                )}
                
                {contact.company && (
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">{contact.company}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {contact.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                      {contact.website}
                    </a>
                  </div>
                )}
                
                {contact.linkedin_url && (
                  <div className="flex items-center space-x-3">
                    <Linkedin className="w-5 h-5 text-blue-400" />
                    <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                
                {contact.created_at && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300">
                      Added on {new Date(contact.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          {(contact.address_line_1 || contact.city || contact.state) && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-red-400 mt-1" />
                <div className="text-gray-300">
                  {contact.address_line_1 && <div>{contact.address_line_1}</div>}
                  <div>
                    {[contact.city, contact.state, contact.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                  {contact.country && <div>{contact.country}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#6E86FF]/20 text-[#6E86FF] rounded-full text-sm flex items-center space-x-2"
                  >
                    <Tag className="w-4 h-4" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
              <div className="bg-gray-900/50 rounded-xl p-4 text-gray-300">
                <MessageSquare className="w-5 h-5 text-gray-400 mb-2" />
                {contact.notes}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="flex items-center space-x-3 text-gray-400">
              <Clock className="w-5 h-5" />
              <span>Last contacted: {contact.last_contact_date ? new Date(contact.last_contact_date).toLocaleDateString() : 'Never'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 