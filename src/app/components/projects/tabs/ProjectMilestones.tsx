'use client';

import React, { useState, useEffect } from 'react';
import { Project, ProjectMilestone } from '@/app/types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Flag, Plus, Calendar, CheckCircle2, Clock, Edit2, Trash2,
  AlertTriangle, ArrowUpRight, AlertCircle, Target, X
} from 'lucide-react';
import { projectsService } from '@/app/lib/supabase/projects';

interface ProjectMilestonesProps {
  project: Project;
}

const MILESTONE_COLORS = [
  '#6E86FF', '#FF6BBA', '#B279DB', '#34D399', '#F59E0B', '#EF4444',
  '#8B5CF6', '#3B82F6', '#EC4899', '#10B981', '#F97316', '#6366F1'
];

const MILESTONE_ICONS = [
  'flag', 'target', 'star', 'award', 'trophy', 'medal',
  'rocket', 'zap', 'check', 'heart', 'gem', 'crown'
];

export const ProjectMilestones: React.FC<ProjectMilestonesProps> = ({
  project
}) => {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<ProjectMilestone['status']>('pending');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [weight, setWeight] = useState(1);
  const [color, setColor] = useState(MILESTONE_COLORS[0]);
  const [icon, setIcon] = useState('flag');

  useEffect(() => {
    loadMilestones();
  }, [project.id]);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getMilestones(project.id);
      setMilestones(data);
    } catch (err) {
      setError('Failed to load milestones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    try {
      setLoading(true);
      const milestone = {
        project_id: project.id,
        title,
        description,
        due_date: dueDate,
        status,
        priority,
        weight,
        color,
        icon
      };
      await projectsService.createMilestone(milestone);
      await loadMilestones();
      setShowAddMilestone(false);
      resetForm();
    } catch (err) {
      setError('Failed to create milestone');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMilestone = async () => {
    if (!editingMilestone) return;
    try {
      setLoading(true);
      const updates = {
        title,
        description,
        due_date: dueDate,
        status,
        priority,
        weight,
        color,
        icon
      };
      await projectsService.updateMilestone(editingMilestone.id, updates);
      await loadMilestones();
      setEditingMilestone(null);
      resetForm();
    } catch (err) {
      setError('Failed to update milestone');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      setLoading(true);
      await projectsService.deleteMilestone(id);
      await loadMilestones();
    } catch (err) {
      setError('Failed to delete milestone');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setStatus('pending');
    setPriority('medium');
    setWeight(1);
    setColor(MILESTONE_COLORS[0]);
    setIcon('flag');
  };

  const startEdit = (milestone: ProjectMilestone) => {
    setEditingMilestone(milestone);
    setTitle(milestone.title);
    setDescription(milestone.description || '');
    setDueDate(milestone.due_date || '');
    setStatus(milestone.status);
    setPriority(milestone.priority || 'medium');
    setWeight(milestone.weight || 1);
    setColor(milestone.color || MILESTONE_COLORS[0]);
    setIcon(milestone.icon || 'flag');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: ProjectMilestone['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'delayed': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: ProjectMilestone['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <ArrowUpRight className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'delayed': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getMilestoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'flag': return <Flag className="w-4 h-4" />;
      case 'target': return <Target className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  const pendingMilestones = milestones.filter(m => m.status === 'pending');
  const inProgressMilestones = milestones.filter(m => m.status === 'in_progress');
  const completedMilestones = milestones.filter(m => m.status === 'completed');
  const delayedMilestones = milestones.filter(m => m.status === 'delayed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Milestones</h2>
          <p className="text-gray-400">Track and manage project milestones</p>
        </div>
        <Button
          onClick={() => setShowAddMilestone(true)}
          className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {/* Milestone Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Flag className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{milestones.length}</div>
              <div className="text-sm text-gray-400">Total Milestones</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{completedMilestones.length}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{inProgressMilestones.length}</div>
              <div className="text-sm text-gray-400">In Progress</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{delayedMilestones.length}</div>
              <div className="text-sm text-gray-400">Delayed</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Milestone List */}
      <div className="grid gap-4">
        {milestones.map((milestone) => (
          <Card
            key={milestone.id}
            className="bg-gray-900/50 border-gray-700/50 p-4 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${milestone.color}20` }}>
                  {getMilestoneIcon(milestone.icon || 'flag')}
                </div>
                <div>
                  <h3 className="font-medium text-white">{milestone.title}</h3>
                  {milestone.description && (
                    <p className="text-sm text-gray-400 mt-1">{milestone.description}</p>
                  )}
                  <div className="flex items-center flex-wrap gap-4 mt-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(milestone.status)}`}>
                      {milestone.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {milestone.priority && (
                      <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(milestone.priority)}`}>
                        {milestone.priority.toUpperCase()} PRIORITY
                      </span>
                    )}
                    {milestone.due_date && (
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Due {formatDate(milestone.due_date)}</span>
                      </div>
                    )}
                    {milestone.weight && (
                      <div className="flex items-center text-gray-400">
                        <Target className="w-4 h-4 mr-1" />
                        <span>Weight: {milestone.weight}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(milestone)}
                  className="text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMilestone(milestone.id)}
                  className="text-red-400 hover:text-red-300"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {milestones.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No milestones yet</h3>
            <p className="text-gray-400 mb-4">
              Start by adding project milestones
            </p>
            <Button
              onClick={() => setShowAddMilestone(true)}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Milestone
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddMilestone || editingMilestone) && (
        <Dialog open={true} onOpenChange={() => {
          setShowAddMilestone(false);
          setEditingMilestone(null);
          resetForm();
        }}>
          <DialogContent className="bg-[#0B0F1A] border-gray-700/50">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter milestone title"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter milestone description"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Due Date</label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProjectMilestone['status'])}
                      className="mt-1 w-full bg-gray-800 border-gray-700 text-gray-300 rounded-lg"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="mt-1 w-full bg-gray-800 border-gray-700 text-gray-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Weight</label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={weight}
                      onChange={(e) => setWeight(parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Color</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {MILESTONE_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={`w-6 h-6 rounded-full ${color === c ? 'ring-2 ring-white' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300">Icon</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {MILESTONE_ICONS.map((i) => (
                        <button
                          key={i}
                          onClick={() => setIcon(i)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            icon === i ? 'bg-gray-700' : 'bg-gray-800'
                          }`}
                        >
                          {getMilestoneIcon(i)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddMilestone(false);
                      setEditingMilestone(null);
                      resetForm();
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => editingMilestone ? handleEditMilestone() : handleAddMilestone()}
                    className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
                    disabled={loading}
                  >
                    {editingMilestone ? 'Update Milestone' : 'Add Milestone'}
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