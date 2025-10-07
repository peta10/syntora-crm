'use client';

import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Contact } from '@/app/types/contact';

interface ContactRowProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onView: (contact: Contact) => void;
}

export const ContactRow: React.FC<ContactRowProps> = ({ contact, onEdit, onDelete, onView }) => {
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

  // Get the primary tag (first one or none)
  const primaryTag = contact.tags && contact.tags.length > 0 ? contact.tags[0] : null;

  return (
    <tr 
      className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer"
      onClick={() => onView(contact)}
    >
      <td className="px-4 py-3">
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
      <td className="px-4 py-3">
        <div className="text-white">{contact.company}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-gray-300">{contact.email}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-gray-300">{contact.phone}</div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getContactTypeColor(contact.contact_type)}`}>
          {contact.contact_type}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-sm font-medium ${getLeadScoreColor(contact.lead_score || 0)}`}>
          {contact.lead_score || 0}
        </span>
      </td>
      <td className="px-4 py-3">
        {primaryTag && (
          <span className="px-2 py-1 bg-gray-800/50 text-xs text-gray-300 rounded">
            {primaryTag}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onView(contact);
            }}
            className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(contact);
            }}
            className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(contact.id);
            }}
            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
}; 