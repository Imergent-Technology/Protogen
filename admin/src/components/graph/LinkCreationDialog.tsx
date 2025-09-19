import { useState } from 'react';
import { Scene } from '@protogen/shared';
import { Button } from '@protogen/shared';
import { Modal } from '../common/Modal';
import { Search, Link as LinkIcon } from 'lucide-react';

interface LinkCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkCreate: (linkData: { targetStageId: number; label: string; url: string; isEdit: boolean }) => void;
  scenes: Stage[];
  currentStageId?: number;
  selectedText?: string;
  isEditing?: boolean;
  existingLinkData?: any;
}

export function LinkCreationDialog({
  isOpen,
  onClose,
  onLinkCreate,
  scenes,
  currentStageId,
  selectedText = '',
  isEditing = false,

}: LinkCreationDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [linkLabel, setLinkLabel] = useState(selectedText || '');

  // Filter scenes based on search query and exclude current scene
  const filteredStages = scenes.filter(scene => 
    scene.id !== currentStageId &&
    (scene.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     scene.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateLink = () => {
    if (selectedStage) {
      onLinkCreate({
        targetStageId: selectedStage.id!,
        label: linkLabel || selectedStage.name,
        url: `/scene/${selectedStage.slug}`,
        isEdit: isEditing
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedStage(null);
    setLinkLabel(selectedText || '');
    onClose();
  };

  const getStageTypeIcon = (type: string) => {
    switch (type) {
      case 'basic': return '📝';
      case 'document': return '📄';
      case 'graph': return '🔗';
      case 'table': return '📊';
      case 'custom': return '⚙️';
      default: return '📄';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Stage Link" : "Create Stage Link"}
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search Stages</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scenes by name or description..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Stage Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Target Stage</label>
          <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
            {filteredStages.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? 'No scenes found matching your search.' : 'No scenes available.'}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredStages.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedStage(scene)}
                    className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                      selectedStage?.id === scene.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getStageTypeIcon(scene.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium">{scene.name}</div>
                        {scene.description && (
                          <div className="text-sm text-muted-foreground">{scene.description}</div>
                        )}
                        <div className="text-xs text-muted-foreground capitalize">{scene.type} scene</div>
                      </div>
                      {selectedStage?.id === scene.id && (
                        <LinkIcon className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Link Label */}
        {selectedStage && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Link Label (Optional)</label>
            <input
              type="text"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder={`Default: ${selectedStage.name}`}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {/* Preview */}
        {selectedStage && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">Link Preview:</div>
            <div className="flex items-center space-x-2 text-sm">
              <LinkIcon className="h-4 w-4 text-primary" />
              <span className="text-primary underline">
                {linkLabel || selectedStage.name}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="text-muted-foreground">{selectedStage.name}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateLink}
            disabled={!selectedStage}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Link' : 'Create Link'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
