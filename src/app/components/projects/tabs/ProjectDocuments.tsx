import React, { useState } from 'react';
import { Project, ProjectDocument } from '@/app/types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Plus,
  Calendar,
  Users,
  Download,
  Edit2,
  Trash2,
  Filter,
  Search,
  ArrowUpDown,
  Upload,
  File,
  FileImage,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  FileVideo,
  FileAudio,
  MoreVertical
} from 'lucide-react';

interface ProjectDocumentsProps {
  project: Project;
}

export const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({
  project
}) => {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ProjectDocument | null>(null);
  const [filterType, setFilterType] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return <FileImage className="w-4 h-4" />;
      case 'application/pdf':
        return <FileText className="w-4 h-4" />;
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FileText className="w-4 h-4" />;
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'text/javascript':
      case 'text/typescript':
      case 'text/html':
      case 'text/css':
        return <FileCode className="w-4 h-4" />;
      case 'application/zip':
      case 'application/x-rar-compressed':
        return <FileArchive className="w-4 h-4" />;
      case 'video/mp4':
      case 'video/quicktime':
        return <FileVideo className="w-4 h-4" />;
      case 'audio/mpeg':
      case 'audio/wav':
        return <FileAudio className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    const type = fileType.split('/')[0];
    switch (type) {
      case 'image': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'application': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'text': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'video': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'audio': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const handleAddDocument = () => {
    // TODO: Implement document addition
    setShowAddDocument(false);
  };

  const handleEditDocument = (document: ProjectDocument) => {
    // TODO: Implement document editing
    setEditingDocument(null);
  };

  const handleDeleteDocument = (id: string) => {
    // TODO: Implement document deletion
  };

  const handleDownload = (document: ProjectDocument) => {
    // TODO: Implement document download
  };

  const filteredDocuments = documents
    .filter(doc => {
      if (filterType === 'all') return true;
      return doc.file_type?.startsWith(filterType) || false;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.title || a.name || '').localeCompare(b.title || b.name || '');
        case 'date':
          const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bDate - aDate;
        case 'size':
          return (b.file_size || 0) - (a.file_size || 0);
        default:
          return 0;
      }
    });

  const totalSize = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0);
  const fileTypes = Array.from(new Set(documents.map(doc => doc.file_type?.split('/')[0] || 'unknown')));
  const recentDocuments = documents
    .filter(doc => {
      if (!doc.created_at) return false;
      const uploadDate = new Date(doc.created_at);
      const now = new Date();
      const diffDays = Math.ceil((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Documents</h2>
          <p className="text-gray-400">Manage project files and documents</p>
        </div>
        <Button
          onClick={() => setShowAddDocument(true)}
          className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{documents.length}</div>
              <div className="text-sm text-gray-400">Total Documents</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <File className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{fileTypes.length}</div>
              <div className="text-sm text-gray-400">File Types</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Upload className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{recentDocuments.length}</div>
              <div className="text-sm text-gray-400">Recent Uploads</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <FileArchive className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{formatFileSize(totalSize)}</div>
              <div className="text-sm text-gray-400">Total Size</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="application">Documents</option>
              <option value="text">Code</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="size">Size</option>
            </select>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:ring-[#6E86FF] focus:border-[#6E86FF]"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="grid gap-4">
        {filteredDocuments.map((document) => (
          <Card
            key={document.id}
            className="bg-gray-900/50 border-gray-700/50 p-4 hover:border-gray-600/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`mt-1 p-2 rounded-lg ${getFileTypeColor(document.file_type || 'application/octet-stream')}`}>
                  {getFileIcon(document.file_type || 'application/octet-stream')}
                </div>
                <div>
                  <h3 className="font-medium text-white">{document.title || document.name}</h3>
                  {document.description && (
                    <p className="text-sm text-gray-400 mt-1">{document.description}</p>
                  )}
                  <div className="flex items-center flex-wrap gap-4 mt-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getFileTypeColor(document.file_type || 'application/octet-stream')}`}>
                      {(document.file_type || 'application/octet-stream').split('/')[1].toUpperCase()}
                    </span>
                    <div className="flex items-center text-gray-400">
                      <File className="w-4 h-4 mr-1" />
                      <span>{formatFileSize(document.file_size || 0)}</span>
                    </div>
                    {document.created_at && (
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Uploaded {formatDate(document.created_at)}</span>
                      </div>
                    )}
                    {document.uploaded_by && (
                      <div className="flex items-center text-gray-400">
                        <Users className="w-4 h-4 mr-1" />
                        <span>By {document.uploaded_by}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(document)}
                  className="text-gray-400 hover:text-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingDocument(document)}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDocument(document.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No documents found</h3>
            <p className="text-gray-400 mb-4">
              {filterType === 'all'
                ? 'Start by uploading project documents'
                : `No ${filterType} files found`}
            </p>
            <Button
              onClick={() => setShowAddDocument(true)}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload First Document
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddDocument || editingDocument) && (
        <Card className="bg-gray-900/50 border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingDocument ? 'Edit Document' : 'Upload Document'}
          </h3>
          
          {/* Form fields will go here */}
          <div className="space-y-4">
            {/* TODO: Add form fields */}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDocument(false);
                setEditingDocument(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingDocument ? handleEditDocument(editingDocument) : handleAddDocument()}
              className="bg-gradient-to-r from-[#6E86FF] to-[#FF6BBA] text-white"
            >
              {editingDocument ? 'Update Document' : 'Upload Document'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};