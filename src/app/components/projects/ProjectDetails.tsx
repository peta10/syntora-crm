'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/app/types/todo';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, Calendar, Clock, Target, Tag, Users,
  Edit2, Trash2, Link, Briefcase, CheckCircle2,
  AlertTriangle, ArrowUpRight, Flag, DollarSign,
  Users2, Timer, AlertOctagon, Box, BarChart2,
  UserPlus, FileText, MessageSquare, Settings,
  GitBranch, Milestone, Shield, Activity, X, User
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { ProjectComment } from '@/app/types/todo';
import { commentsService } from '@/app/lib/supabase/comments';
import { useUser } from '../../hooks/useUser';

// Import tab components
import { ProjectOverview } from '@/app/components/projects/tabs/ProjectOverview';
import { ProjectMilestones } from '@/app/components/projects/tabs/ProjectMilestones';
import { ProjectTeam } from '@/app/components/projects/tabs/ProjectTeam';
import { ProjectTimeTracking } from '@/app/components/projects/tabs/ProjectTimeTracking';
import { ProjectRisks } from '@/app/components/projects/tabs/ProjectRisks';
import { ProjectResources } from '@/app/components/projects/tabs/ProjectResources';
import { ProjectBudget } from '@/app/components/projects/tabs/ProjectBudget';
import { ProjectKPIs } from '@/app/components/projects/tabs/ProjectKPIs';
import { ProjectStakeholders } from '@/app/components/projects/tabs/ProjectStakeholders';
import { ProjectDocuments } from '@/app/components/projects/tabs/ProjectDocuments';
import { ProjectDependencies } from '@/app/components/projects/tabs/ProjectDependencies';
import { ProjectSettings } from '@/app/components/projects/tabs/ProjectSettings';

interface ProjectDetailsProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
}

type TabType = 
  | 'overview' 
  | 'milestones' 
  | 'team' 
  | 'tasks'
  | 'time'
  | 'risks'
  | 'resources'
  | 'budget'
  | 'kpis'
  | 'stakeholders'
  | 'documents'
  | 'discussions'
  | 'dependencies'
  | 'settings'
  | 'comments';

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateProject
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<ProjectComment | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    loadComments();
  }, [project.id]);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const data = await commentsService.getComments(project.id);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentContent.trim() || !user) return;

    try {
      const comment = {
        project_id: project.id,
        user_id: user.id,
        content: commentContent.trim(),
        parent_id: replyingTo?.id
      };

      await commentsService.createComment(comment);
      await loadComments();
      setCommentContent('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsService.deleteComment(commentId);
      await loadComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'completed': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'on_hold': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'archived': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-400';
      case 'at_risk': return 'text-yellow-400';
      case 'off_track': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'milestones', label: 'Milestones', icon: Flag },
    { id: 'team', label: 'Team', icon: Users2 },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { id: 'time', label: 'Time', icon: Timer },
    { id: 'risks', label: 'Risks', icon: AlertOctagon },
    { id: 'resources', label: 'Resources', icon: Box },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'kpis', label: 'KPIs', icon: BarChart2 },
    { id: 'stakeholders', label: 'Stakeholders', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
    { id: 'dependencies', label: 'Dependencies', icon: GitBranch },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'comments', label: 'Comments', icon: MessageSquare }
  ];

  // Fix date handling
  const formatCreatedDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  const getProjectIdentifier = (project: Project) => {
    return project.id;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden bg-[#0B0F1A] border-gray-700/50">
        <DialogTitle className="sr-only">{project.title}</DialogTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${project.color}20`, color: project.color }}
              >
                {project.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <span>{project.title}</span>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {project.health_status && (
                    <span className={`flex items-center space-x-1 text-sm ${getHealthStatusColor(project.health_status)}`}>
                      <Activity className="w-4 h-4" />
                      <span>{project.health_status.replace('_', ' ').toUpperCase()}</span>
                    </span>
                  )}
                </h2>
                <p className="text-gray-400 text-sm">
                  Created {formatCreatedDate(project.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-gray-400 hover:text-white"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(project.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabType)}
            className="flex-1 overflow-hidden"
          >
            <TabsList className="flex space-x-1 p-1 bg-gray-800/50 border-b border-gray-700/50">
              {tabs.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === id
                      ? 'bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="overview" className="mt-0">
                <ProjectOverview project={project} onUpdateProject={onUpdateProject} />
              </TabsContent>

              <TabsContent value="milestones" className="mt-0">
                <ProjectMilestones project={project} />
              </TabsContent>

              <TabsContent value="team" className="mt-0">
                <ProjectTeam project={project} />
              </TabsContent>

              <TabsContent value="tasks" className="mt-0">
                {/* ProjectTasks component was removed, so this content is now empty */}
              </TabsContent>

              <TabsContent value="time" className="mt-0">
                <ProjectTimeTracking project={project} />
              </TabsContent>

              <TabsContent value="risks" className="mt-0">
                <ProjectRisks project={project} />
              </TabsContent>

              <TabsContent value="resources" className="mt-0">
                <ProjectResources project={project} />
              </TabsContent>

              <TabsContent value="budget" className="mt-0">
                <ProjectBudget project={project} />
              </TabsContent>

              <TabsContent value="kpis" className="mt-0">
                <ProjectKPIs project={project} />
              </TabsContent>

              <TabsContent value="stakeholders" className="mt-0">
                <ProjectStakeholders project={project} />
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <ProjectDocuments project={project} />
              </TabsContent>

              <TabsContent value="discussions" className="mt-0">
                {/* ProjectDiscussions component was removed, so this content is now empty */}
              </TabsContent>

              <TabsContent value="dependencies" className="mt-0">
                <ProjectDependencies project={project} />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <ProjectSettings 
                  project={project} 
                  onUpdate={async updates => {
                    const updatedProject = await onUpdateProject(project.id, updates);
                    return updatedProject;
                  }}
                />
              </TabsContent>

              <TabsContent value="comments" className="mt-0">
                <div className="space-y-6">
                  {/* Add Comment */}
                  <div className="space-y-4">
                    {replyingTo && (
                      <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded-lg">
                        <span className="text-sm text-gray-400">
                          Replying to {replyingTo.user?.first_name} {replyingTo.user?.last_name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(null)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <Textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddComment}
                        className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
                        disabled={!commentContent.trim() || !user}
                      >
                        Post
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-6">
                    {loadingComments ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No comments yet</h3>
                        <p className="text-gray-400">
                          Start the discussion by adding a comment
                        </p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="space-y-4">
                          {/* Main Comment */}
                          <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                {comment.user?.avatar_url ? (
                                  <Image
                                    src={comment.user.avatar_url}
                                    alt={`${comment.user.first_name} ${comment.user.last_name}`}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-white">
                                      {comment.user?.first_name} {comment.user?.last_name}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                      {formatCreatedDate(comment.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 mt-1">{comment.content}</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReplyingTo(comment)}
                                    className="text-gray-400 hover:text-white mt-2"
                                  >
                                    Reply
                                  </Button>
                                </div>
                              </div>
                              {user?.id === comment.user_id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-12 space-y-4">
                              {comment.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-4"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                      {reply.user?.avatar_url ? (
                                        <Image
                                          src={reply.user.avatar_url}
                                          alt={`${reply.user.first_name} ${reply.user.last_name}`}
                                          width={32}
                                          height={32}
                                          className="rounded-full"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                          <User className="w-4 h-4 text-gray-400" />
                                        </div>
                                      )}
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium text-white">
                                            {reply.user?.first_name} {reply.user?.last_name}
                                          </span>
                                          <span className="text-sm text-gray-400">
                                            {formatCreatedDate(reply.created_at)}
                                          </span>
                                        </div>
                                        <p className="text-gray-300 mt-1">{reply.content}</p>
                                      </div>
                                    </div>
                                    {user?.id === reply.user_id && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 