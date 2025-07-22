import { supabase } from './client';
import { ProjectComment } from '@/app/types/todo';

export interface CreateCommentData {
  project_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
}

export interface UpdateCommentData {
  content: string;
}

export const commentsService = {
  getComments: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_comments')
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get replies for each comment
    const comments = await Promise.all(data.map(async (comment) => {
      const { data: replies } = await supabase
        .from('project_comments')
        .select(`
          *,
          user:users (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true });

      return {
        ...comment,
        replies: replies || []
      };
    }));

    return comments;
  },

  getCommentById: async (id: string) => {
    const { data, error } = await supabase
      .from('project_comments')
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createComment: async (comment: CreateCommentData) => {
    const { data, error } = await supabase
      .from('project_comments')
      .insert(comment)
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  updateComment: async (id: string, updates: UpdateCommentData) => {
    const { data, error } = await supabase
      .from('project_comments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  deleteComment: async (id: string) => {
    // First delete all replies
    const { error: repliesError } = await supabase
      .from('project_comments')
      .delete()
      .eq('parent_id', id);

    if (repliesError) throw repliesError;

    // Then delete the comment
    const { error } = await supabase
      .from('project_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get comment thread (parent comment and all replies)
  getCommentThread: async (commentId: string) => {
    // Get the parent comment
    const { data: parentComment, error: parentError } = await supabase
      .from('project_comments')
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('id', commentId)
      .single();

    if (parentError) throw parentError;

    // Get all replies
    const { data: replies, error: repliesError } = await supabase
      .from('project_comments')
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true });

    if (repliesError) throw repliesError;

    return {
      ...parentComment,
      replies: replies || []
    };
  },

  // Get recent comments for a project
  getRecentComments: async (projectId: string, limit = 5) => {
    const { data, error } = await supabase
      .from('project_comments')
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}; 