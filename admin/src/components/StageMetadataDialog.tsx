import { useState, useEffect } from 'react';
import { Stage } from '@progress/shared';
import { Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '@progress/shared';
import { Modal } from './Modal';

interface StageMetadataDialogProps {
  stage: Stage | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (stage: Stage) => void;
  onPublish?: (stage: Stage) => void;
  onUnpublish?: (stage: Stage) => void;
}

const ICON_OPTIONS = [
  '📝', '📄', '📊', '🎯', '💡', '🔗', '📈', '📉', '🎨', '⚙️',
  '🏠', '📚', '🔍', '⭐', '💎', '🚀', '🎪', '🎭', '🎨', '🎵',
  '📱', '💻', '🌐', '🔧', '📋', '📌', '📍', '🎯', '🎪', '🎭'
];

export function StageMetadataDialog({
  stage,
  isOpen,
  onClose,
  onSave,
  onPublish,
  onUnpublish
}: StageMetadataDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    is_active: true
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (stage) {
      setFormData({
        name: stage.name,
        slug: stage.slug,
        description: stage.description || '',
        icon: stage.config.icon || '',
        is_active: stage.is_active
      });
    }
  }, [stage]);

  if (!isOpen || !stage) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedStage = {
        ...stage,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        config: {
          ...stage.config,
          icon: formData.icon
        },
        is_active: formData.is_active
      };
      await onSave(updatedStage);
      onClose();
    } catch (error) {
      console.error('Failed to save stage metadata:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = () => {
    if (formData.is_active && onUnpublish) {
      onUnpublish(stage);
    } else if (!formData.is_active && onPublish) {
      onPublish(stage);
    }
    setFormData(prev => ({ ...prev, is_active: !prev.is_active }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stage Settings"
      size="lg"
    >
      <div className="p-6">
        <p className="text-sm text-muted-foreground mb-6">
          Configure stage properties and metadata
        </p>

        {/* Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      name: e.target.value,
                      slug: generateSlug(e.target.value)
                    }));
                  }}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter stage name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="stage-slug"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL-friendly identifier for this stage
                </p>
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

          {/* Icon Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Icon</h3>
            <div className="grid grid-cols-10 gap-2">
              {ICON_OPTIONS.map((icon, index) => (
                <button
                  key={index}
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`p-2 text-xl rounded-lg border-2 transition-colors ${
                    formData.icon === icon
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Selected:</span>
              <span className="text-2xl">{formData.icon || 'No icon'}</span>
            </div>
          </div>

          {/* Publishing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Publishing</h3>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium">Stage Visibility</h4>
                <p className="text-sm text-muted-foreground">
                  {formData.is_active 
                    ? 'This stage is published and visible to users'
                    : 'This stage is unpublished and only visible to admins'
                  }
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handlePublishToggle}
              >
                {formData.is_active ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
