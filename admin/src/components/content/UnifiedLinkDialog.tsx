import { useState, useEffect } from 'react';
import { Stage } from '@progress/shared';
import { Button } from '@progress/shared';
import { Modal } from '../common/Modal';
import { Search, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface UnifiedLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkCreate: (linkData: { 
    type: 'external' | 'stage';
    href: string;
    label: string;
    targetStageId?: number;
    isEdit: boolean;
  }) => void;
  stages: Stage[];
  currentStageId?: number;
  selectedText?: string;
  isEditing?: boolean;
  existingLinkData?: any;
  defaultLinkType?: 'external' | 'stage';
}

export function UnifiedLinkDialog({
  isOpen,
  onClose,
  onLinkCreate,
  stages,
  currentStageId,
  selectedText = '',
  isEditing = false,
  existingLinkData,
  defaultLinkType = 'external'
}: UnifiedLinkDialogProps) {
  const [linkType, setLinkType] = useState<'external' | 'stage'>(defaultLinkType);
  const [externalUrl, setExternalUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [linkLabel, setLinkLabel] = useState(selectedText || '');

  // Filter stages based on search query and exclude current stage
  const filteredStages = stages.filter(stage => 
    stage.id !== currentStageId &&
    (stage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     stage.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Initialize form based on existing link data and selected text
  useEffect(() => {
    // Update link label when selectedText changes
    setLinkLabel(selectedText || '');
    
    if (existingLinkData) {
      if (existingLinkData.href && existingLinkData.href.startsWith('stage://')) {
        setLinkType('stage');
        const stageId = existingLinkData.href.replace('stage://', '');
        const stage = stages.find(s => s.id === parseInt(stageId));
        if (stage) {
          setSelectedStage(stage);
        }
      } else {
        setLinkType('external');
        setExternalUrl(existingLinkData.href || '');
      }
    } else {
      // Set default link type when opening for new links
      setLinkType(defaultLinkType);
    }
  }, [existingLinkData, stages, selectedText, defaultLinkType]);

  const handleCreateLink = () => {
    if (linkType === 'external' && externalUrl.trim()) {
      onLinkCreate({
        type: 'external',
        href: externalUrl.trim(),
        label: linkLabel || externalUrl.trim(),
        isEdit: isEditing
      });
      handleClose();
    } else if (linkType === 'stage' && selectedStage) {
      onLinkCreate({
        type: 'stage',
        href: `stage://${selectedStage.id}`,
        label: linkLabel || selectedStage.name,
        targetStageId: selectedStage.id,
        isEdit: isEditing
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setLinkType('external');
    setExternalUrl('');
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

  const isValidExternalUrl = externalUrl.trim() && (
    externalUrl.startsWith('http://') || 
    externalUrl.startsWith('https://') ||
    externalUrl.startsWith('mailto:') ||
    externalUrl.startsWith('tel:')
  );

  const canCreateLink = linkType === 'external' ? isValidExternalUrl : selectedStage;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Link" : "Create Link"}
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Link Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Link Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLinkType('external')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                linkType === 'external'
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <ExternalLink className="h-4 w-4" />
              External
            </button>
            <button
              type="button"
              onClick={() => setLinkType('stage')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                linkType === 'stage'
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <LinkIcon className="h-4 w-4" />
              Internal
            </button>
          </div>
        </div>

        {/* Link Label */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Link Label</label>
          <input
            type="text"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            placeholder="Enter link label..."
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          />
        </div>

        {/* External URL Input */}
        {linkType === 'external' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">URL</label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://example.com or mailto:user@example.com"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
            {externalUrl && !isValidExternalUrl && (
              <p className="text-sm text-red-500">
                Please enter a valid URL starting with http://, https://, mailto:, or tel:
              </p>
            )}
          </div>
        )}

        {/* Stage Selection */}
        {linkType === 'stage' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Target Stage</label>
            
            {/* Selected Stage Display */}
            {selectedStage && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getStageTypeIcon(selectedStage.type)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-primary">{selectedStage.name}</div>
                    {selectedStage.description && (
                      <div className="text-sm text-muted-foreground">{selectedStage.description}</div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedStage(null)}
                    className="text-muted-foreground hover:text-foreground"
                    title="Clear selection"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={selectedStage ? "Search for a different stage..." : "Search stages by name or description..."}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>
            <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
              {filteredStages.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchQuery ? 'No stages found matching your search.' : 'No stages available.'}
                </div>
              ) : (
                filteredStages.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(stage)}
                    className={`w-full p-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 ${
                      selectedStage?.id === stage.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getStageTypeIcon(stage.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{stage.name}</div>
                        {stage.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {stage.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateLink}
            disabled={!canCreateLink}
          >
            {isEditing ? 'Update Link' : 'Create Link'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
