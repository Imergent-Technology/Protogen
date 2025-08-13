import React from 'react';
import { StagePreview } from '@progress/shared';
import { Stage } from '@progress/shared';
import { X, Edit, Share, BarChart3 } from 'lucide-react';
import { Button } from '@progress/shared';

interface StagePreviewModalProps {
  stage: Stage | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  onViewAnalytics?: () => void;
}

export function StagePreviewModal({
  stage,
  isOpen,
  onClose,
  onEdit,
  onShare,
  onViewAnalytics
}: StagePreviewModalProps) {
  if (!isOpen || !stage) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Stage Preview</h2>
            <p className="text-sm text-muted-foreground">
              Preview how this stage will appear to users
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {onViewAnalytics && (
              <Button variant="outline" size="sm" onClick={onViewAnalytics}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            )}
            
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="space-y-6">
          <StagePreview
            stage={stage}
            mode="admin"
            onEdit={onEdit}
            onShare={onShare}
            onViewAnalytics={onViewAnalytics}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Stage
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
