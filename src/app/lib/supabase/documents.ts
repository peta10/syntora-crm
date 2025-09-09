import { supabase } from './client';
import { ProjectDocument } from '@/app/types/todo';

export interface CreateDocumentData {
  project_id: string;
  name: string;
  file_type?: string;
  file_size?: number;
  storage_path?: string;
  uploaded_by?: string;
}

export interface UpdateDocumentData {
  name?: string;
  file_type?: string;
  file_size?: number;
  storage_path?: string;
}

export const documentsService = {
  getDocuments: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getDocumentById: async (id: string) => {
    const { data, error } = await supabase
      .from('project_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createDocument: async (document: CreateDocumentData) => {
    const { data, error } = await supabase
      .from('project_documents')
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateDocument: async (id: string, updates: UpdateDocumentData) => {
    const { data, error } = await supabase
      .from('project_documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteDocument: async (id: string) => {
    // First get the document to get the storage path
    const { data: document, error: fetchError } = await supabase
      .from('project_documents')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!document) throw new Error('Document not found');

    // Delete the file from storage if it exists
    if (document.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('project-documents')
        .remove([document.storage_path]);

      if (storageError) throw storageError;
    }

    // Delete the document record
    const { error } = await supabase
      .from('project_documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Upload a file to storage and create a document record
  uploadDocument: async (projectId: string, file: File, uploadedBy: string) => {
    // Upload file to storage
    const fileName = `${projectId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create document record
    const document: CreateDocumentData = {
      project_id: projectId,
      name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: uploadData.path,
      uploaded_by: uploadedBy
    };

    const { data, error } = await supabase
      .from('project_documents')
      .insert(document)
      .select()
      .single();

    if (error) {
      // If document record creation fails, delete the uploaded file
      await supabase.storage
        .from('project-documents')
        .remove([uploadData.path]);
      throw error;
    }

    return data;
  },

  // Get a download URL for a document
  getDownloadUrl: async (storagePath: string) => {
    const { data, error } = await supabase.storage
      .from('project-documents')
      .createSignedUrl(storagePath, 3600); // URL valid for 1 hour

    if (error) throw error;
    return data.signedUrl;
  },

  // Get document statistics
  getDocumentStats: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_documents')
      .select('file_type, file_size')
      .eq('project_id', projectId);

    if (error) throw error;

    const fileTypes = [...new Set(data.map((doc: any) => doc.file_type))];
    return {
      total_count: data.length,
      total_size: data.reduce((sum: number, doc: any) => sum + (doc.file_size || 0), 0),
      by_type: fileTypes.map(type => ({
        type,
        count: data.filter((doc: any) => doc.file_type === type).length,
        total_size: data
          .filter((doc: any) => doc.file_type === type)
          .reduce((sum: number, doc: any) => sum + (doc.file_size || 0), 0)
      }))
    };
  }
}; 