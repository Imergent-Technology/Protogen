import { useState } from 'react';
import { Stage, StageType } from '@progress/shared';
import { Save } from 'lucide-react';
import { Button } from '@progress/shared';
import { Modal } from './Modal';

interface CreateStageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (stage: Partial<Stage>) => void;
}

const STAGE_TYPES: { value: StageType; label: string; description: string; icon: string }[] = [
  {
    value: 'basic',
    label: 'Basic Stage',
    description: 'Simple text display with large, beautiful typography',
    icon: '📝'
  },
  {
    value: 'document',
    label: 'Document Stage',
    description: 'Rich text editor with formatting, links, and images',
    icon: '📄'
  },
  {
    value: 'graph',
    label: 'Graph Explorer',
    description: 'Interactive graph visualization and exploration',
    icon: '🔗'
  },
  {
    value: 'table',
    label: 'Table Stage',
    description: 'Data tables and structured information display',
    icon: '📊'
  }
];

export function CreateStageDialog({ isOpen, onClose, onCreate }: CreateStageDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'basic' as StageType,
    icon: '📝'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newStage: Partial<Stage> = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      config: {
        title: formData.name,
        content: '',
        icon: formData.icon
      },
      is_active: false,
      sort_order: 0
    };

    onCreate(newStage);
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      type: 'basic',
      icon: '📝'
    });
  };

  const handleTypeChange = (type: StageType) => {
    const stageType = STAGE_TYPES.find(t => t.value === type);
    setFormData(prev => ({
      ...prev,
      type,
      icon: stageType?.icon || '📝'
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Stage"
      size="lg"
    >
      <div className="p-6">
        <p className="text-sm text-muted-foreground mb-6">
          Choose a stage type and configure its basic properties
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stage Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Stage Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STAGE_TYPES.map((type) => (
                <div
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.type === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h4 className="font-medium">{type.label}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter stage name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="Brief description of this stage"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preview</h3>
            <div className="p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{formData.icon}</span>
                <div>
                  <h4 className="font-medium">{formData.name || 'Untitled Stage'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.description || 'No description provided'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Type: {STAGE_TYPES.find(t => t.value === formData.type)?.label}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Create Stage
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
