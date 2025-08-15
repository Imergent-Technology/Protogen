import { useState, useEffect } from 'react';
import { Stage } from '@progress/shared';
import { X, Edit, Save, Eye, EyeOff, Settings } from 'lucide-react';
import { Button } from '@progress/shared';
import { DocumentStageViewer } from './DocumentStageViewer';

interface FullScreenStageViewerProps {
  stage: Stage | null;
  isAdmin?: boolean;
  onClose?: () => void;
  onEdit?: () => void;
  onSave?: (stage: Stage) => void;
  onPublish?: (stage: Stage) => void;
  onUnpublish?: (stage: Stage) => void;
}

export function FullScreenStageViewer({
  stage,
  isAdmin = false,
  onClose,
  onEdit,
  onSave,
  onPublish,
  onUnpublish
}: FullScreenStageViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (stage) {
      setContent(stage.config.content || '');
    }
  }, [stage]);

  if (!stage) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-4">No Stage Selected</h1>
          <p className="text-muted-foreground">Please select a stage to view</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      const updatedStage = {
        ...stage,
        config: {
          ...stage.config,
          content
        }
      };
      await onSave(updatedStage);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save stage:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = () => {
    if (stage.is_active && onUnpublish) {
      onUnpublish(stage);
    } else if (!stage.is_active && onPublish) {
      onPublish(stage);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {stage.config.icon && (
              <span className="text-2xl">{stage.config.icon}</span>
            )}
            <div>
              <h1 className="text-lg font-semibold">{stage.name}</h1>
              {stage.description && (
                <p className="text-sm text-muted-foreground">{stage.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isAdmin && (
            <>
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePublishToggle}
                  >
                    {stage.is_active ? (
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </>
              )}
            </>
          )}
          
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Stage Content */}
      <div className="flex-1 overflow-hidden">
        {stage.type === 'basic' && (
          <div className="h-full flex items-center justify-center p-8">
            {isEditing ? (
              <div className="w-full max-w-4xl">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-64 p-4 text-lg border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your content here..."
                />
              </div>
            ) : (
              <div className="text-center max-w-4xl">
                <div 
                  className="text-4xl font-light leading-relaxed text-foreground"
                  style={{ 
                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                    lineHeight: '1.4'
                  }}
                >
                  {content || 'Welcome to your stage'}
                </div>
              </div>
            )}
          </div>
        )}
        
        {stage.type === 'document' && (
          <DocumentStageViewer
            stage={stage}
            isEditing={isEditing}
            onContentChange={(newContent) => setContent(newContent)}
            className="h-full"
          />
        )}
        
        {/* Placeholder for other stage types */}
        {stage.type !== 'basic' && stage.type !== 'document' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-muted-foreground mb-4">
                {stage.type.charAt(0).toUpperCase() + stage.type.slice(1)} Stage
              </h2>
              <p className="text-muted-foreground">
                {stage.type} stage type is not yet implemented
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
