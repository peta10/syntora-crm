import React, { useState } from 'react';
import { Project } from '@/app/types/todo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Archive, Trash2, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProjectSettingsProps {
  project: Project;
  onUpdate: (updatedProject: Partial<Project>) => Promise<Project>;
  onArchive?: () => Promise<void>;
  onDelete?: () => Promise<void>;
}

type BillingType = 'fixed_price' | 'time_and_materials' | 'retainer';

const BILLING_TYPES: { value: BillingType; label: string }[] = [
  { value: 'fixed_price', label: 'Fixed Price' },
  { value: 'time_and_materials', label: 'Time and Materials' },
  { value: 'retainer', label: 'Retainer' },
];

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  project,
  onUpdate,
  onArchive,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    project_code: project.project_code || '',
    project_type: project.project_type || '',
    billing_type: project.billing_type || 'fixed_price',
    payment_terms: project.payment_terms || '',
    currency: project.currency || 'USD',
    tags: project.tags?.join(', ') || '',
    custom_fields: project.custom_fields || {},
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBillingTypeChange = (value: BillingType) => {
    setFormData(prev => ({
      ...prev,
      billing_type: value,
    }));
  };

  const handleCustomFieldChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      custom_fields: {
        ...prev.custom_fields,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };
      await onUpdate(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update project settings:', error);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Project Settings
        </h3>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit Settings
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_code">Project Code</Label>
              <Input
                id="project_code"
                name="project_code"
                value={formData.project_code}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter project code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_type">Project Type</Label>
              <Input
                id="project_type"
                name="project_type"
                value={formData.project_type}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter project type"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_type">Billing Type</Label>
              <Select
                value={formData.billing_type}
                onValueChange={handleBillingTypeChange}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select billing type" />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter payment terms"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter currency code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter tags (comma-separated)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Fields</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.custom_fields).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`custom_${key}`}>{key}</Label>
                  <Input
                    id={`custom_${key}`}
                    value={value as string}
                    onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              ))}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </Card>
      </form>

      <Card className="p-4 space-y-4">
        <h4 className="font-semibold">Danger Zone</h4>
        <div className="space-y-4">
          {onArchive && (
            <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <div>
                <h5 className="font-medium">Archive Project</h5>
                <p className="text-sm text-gray-600">
                  Archive this project to hide it from active views
                </p>
              </div>
              <Button
                variant="outline"
                onClick={onArchive}
                className="border-yellow-500 text-yellow-700"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Project
              </Button>
            </div>
          )}

          {onDelete && (
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h5 className="font-medium">Delete Project</h5>
                <p className="text-sm text-gray-600">
                  Permanently delete this project and all its data
                </p>
              </div>
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={onDelete}
                    className="gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Confirm Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}; 