import React, { useState, useEffect } from 'react';
import { useStages } from '@progress/shared';
import { Stage, StageType } from '@progress/shared';
import { X, Save, Loader2 } from 'lucide-react';

interface StageFormProps {
  stage?: Stage | null;
  onSave?: (stage: Stage) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

export function StageForm({ stage, onSave, onCancel, isOpen }: StageFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'basic' as StageType,
    config: {
      title: '',
      content: '',
      icon: '📄'
    },
    is_active: true,
    sort_order: 0
  });

  const { createStage, updateStage, loading } = useStages();

  useEffect(() => {
    if (stage) {
      setFormData({
        name: stage.name || '',
        description: stage.description || '',
        type: stage.type || 'basic',
        config: {
          title: stage.config?.title || '',
          content: stage.config?.content || '',
          icon: stage.config?.icon || '📄'
        },
        is_active: stage.is_active ?? true,
        sort_order: stage.sort_order || 0
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'basic',
        config: {
          title: '',
          content: '',
          icon: '📄'
        },
        is_active: true,
        sort_order: 0
      });
    }
  }, [stage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (stage?.id) {
        // Update existing stage
        const updatedStage = await updateStage(stage.id, formData);
        onSave?.(updatedStage);
      } else {
        // Create new stage
        const newStage = await createStage(formData);
        onSave?.(newStage);
      }
    } catch (error) {
      console.error('Failed to save stage:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {stage ? 'Edit Stage' : 'Create New Stage'}
          </h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Basic Information</h4>
            
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="basic">Basic</option>
                <option value="graph">Graph</option>
                <option value="document">Document</option>
                <option value="table">Table</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Stage Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium">Stage Configuration</h4>
            
            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <input
                type="text"
                value={formData.config.icon}
                onChange={(e) => handleInputChange('config.icon', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="📄"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.config.title}
                onChange={(e) => handleInputChange('config.title', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={formData.config.content}
                onChange={(e) => handleInputChange('config.content', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Settings</h4>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Active
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-muted-foreground hover:bg-muted rounded transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              <span>{stage ? 'Update' : 'Create'} Stage</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 