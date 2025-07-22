import React, { useState } from 'react';
import { Project, ProjectTeamMember } from '@/app/types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users2,
  UserPlus,
  Settings,
  Shield,
  Clock,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Trash2,
  MoreVertical,
  Star
} from 'lucide-react';

interface ProjectTeamProps {
  project: Project;
}

export const ProjectTeam: React.FC<ProjectTeamProps> = ({
  project
}) => {
  const [teamMembers, setTeamMembers] = useState<ProjectTeamMember[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<ProjectTeamMember | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: ProjectTeamMember['role']) => {
    switch (role) {
      case 'owner': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'manager': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'member': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'viewer': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const handleAddMember = () => {
    // TODO: Implement member addition
    setShowAddMember(false);
  };

  const handleEditMember = (member: ProjectTeamMember) => {
    // TODO: Implement member editing
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    // TODO: Implement member deletion
  };

  const handleUpdateRole = (id: string, role: ProjectTeamMember['role']) => {
    // TODO: Implement role update
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Team</h2>
          <p className="text-gray-400">Manage team members and their roles</p>
        </div>
        <Button
          onClick={() => setShowAddMember(true)}
          className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{teamMembers.length}</div>
              <div className="text-sm text-gray-400">Total Members</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Star className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {teamMembers.filter(m => m.role === 'owner' || m.role === 'manager').length}
              </div>
              <div className="text-sm text-gray-400">Core Team</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {teamMembers.filter(m => {
                  const joinedDate = new Date(m.joined_at);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - joinedDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 30;
                }).length}
              </div>
              <div className="text-sm text-gray-400">New Members</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {teamMembers.filter(m => Object.values(m.permissions).every(p => p)).length}
              </div>
              <div className="text-sm text-gray-400">Full Access</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Members List */}
      <div className="grid gap-4">
        {teamMembers.map((member) => (
          <Card
            key={member.id}
            className="bg-gray-900/50 border-gray-700/50 p-4 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <Users2 className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">User Name</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getRoleColor(member.role)}`}>
                      {member.role.toUpperCase()}
                    </span>
                    <span className="text-gray-400">
                      Joined {formatDate(member.joined_at)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingMember(member)}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMember(member.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {teamMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No team members yet</h3>
            <p className="text-gray-400 mb-4">
              Add team members to collaborate on this project
            </p>
            <Button
              onClick={() => setShowAddMember(true)}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add First Team Member
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddMember || editingMember) && (
        <Card className="bg-gray-900/50 border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingMember ? 'Edit Team Member' : 'Add Team Member'}
          </h3>
          
          {/* Form fields will go here */}
          <div className="space-y-4">
            {/* TODO: Add form fields */}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddMember(false);
                setEditingMember(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingMember ? handleEditMember(editingMember) : handleAddMember()}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              {editingMember ? 'Update Team Member' : 'Add Team Member'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}; 