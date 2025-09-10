import React, { useState } from 'react';
import { Settings, Eye, Edit, Trash2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button, Badge } from '@progress/shared';

// Types for scene card
export interface SceneCardData {
  id: string;
  name: string;
  slug?: string;
  type: 'graph' | 'document' | 'card' | 'custom';
  description?: string;
  thumbnail?: string; // base64 preview image
  metadata: {
    title?: string;
    author?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    viewCount: number;
    lastViewed?: string;
  };
  isActive: boolean;
  isPublic: boolean;
  config?: Record<string, any>;
  meta?: Record<string, any>;
  style?: Record<string, any>;
}

export interface SceneCardProps {
  scene: SceneCardData;
  onEdit: (scene: SceneCardData) => void;
  onEditBasicDetails?: (scene: SceneCardData) => void;
  onEditDesign?: (scene: SceneCardData) => void;
  onDelete: (scene: SceneCardData) => void;
  onPreview: (scene: SceneCardData) => void;
  onToggleActive?: (scene: SceneCardData) => void;
  onTogglePublic?: (scene: SceneCardData) => void;
  className?: string;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  onEdit,
  onEditBasicDetails,
  onEditDesign,
  onDelete,
  onPreview,
  onToggleActive,
  onTogglePublic,
  className = ''
}) => {
  const [showOptions, setShowOptions] = useState(false);

  // Generate scene type icon
  const getSceneTypeIcon = (type: string) => {
    switch (type) {
      case 'graph': return '📊';
      case 'document': return '📄';
      case 'card': return '🃏';
      default: return '📋';
    }
  };

  // Generate scene type color
  const getSceneTypeColor = (type: string) => {
    switch (type) {
      case 'graph': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'document': return 'bg-green-100 text-green-800 border-green-200';
      case 'card': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Remove card-wide click functionality

  // Handle options menu
  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  // Handle option selection
  const handleOptionSelect = (action: string) => {
    setShowOptions(false);
    switch (action) {
      case 'edit':
        onEdit(scene);
        break;
      case 'edit-basic':
        onEditBasicDetails?.(scene);
        break;
      case 'edit-design':
        onEditDesign?.(scene);
        break;
      case 'delete':
        onDelete(scene);
        break;
      case 'preview':
        onPreview(scene);
        break;
      case 'toggle-active':
        onToggleActive?.(scene);
        break;
      case 'toggle-public':
        onTogglePublic?.(scene);
        break;
    }
  };

  return (
    <div 
      className={`scene-card relative group transition-all duration-200 hover:shadow-lg ${className}`}
    >
      {/* Main Card */}
      <div className="relative bg-background border border-border rounded-lg overflow-hidden aspect-video">
        {/* Preview Thumbnail */}
        {scene.thumbnail ? (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${scene.thumbnail})` }}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            scene.type === 'graph' ? 'bg-blue-50 dark:bg-blue-950' :
            scene.type === 'document' ? 'bg-green-50 dark:bg-green-950' :
            scene.type === 'card' ? 'bg-purple-50 dark:bg-purple-950' :
            'bg-muted'
          }`}>
            <div className="text-center">
              <div className="text-4xl mb-2">{getSceneTypeIcon(scene.type)}</div>
              <div className="text-sm text-muted-foreground">No Preview</div>
            </div>
          </div>
        )}

        {/* Scene Type Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={`text-xs ${getSceneTypeColor(scene.type)}`}>
            {scene.type}
          </Badge>
        </div>

        {/* Status Indicators */}
        <div className="absolute top-2 right-2 flex space-x-1">
          {!scene.isActive && (
            <div className="w-2 h-2 bg-red-500 rounded-full" title="Inactive" />
          )}
          {scene.isPublic && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Public" />
          )}
        </div>

        {/* Options Button - Always Visible */}
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOptionsClick}
            className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Options Menu */}
        {showOptions && (
          <div className="absolute top-10 right-2 bg-background border border-border rounded-lg shadow-lg z-10 min-w-[160px]">
            <div className="py-1">
              <button
                onClick={() => handleOptionSelect('edit')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Scene</span>
              </button>
              {onEditBasicDetails && (
                <button
                  onClick={() => handleOptionSelect('edit-basic')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Edit Basic Details</span>
                </button>
              )}
              {onEditDesign && (
                <button
                  onClick={() => handleOptionSelect('edit-design')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Edit Design</span>
                </button>
              )}
              <button
                onClick={() => handleOptionSelect('preview')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
              {onToggleActive && (
                <button
                  onClick={() => handleOptionSelect('toggle-active')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
                >
                  {scene.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{scene.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>
              )}
              {onTogglePublic && (
                <button
                  onClick={() => handleOptionSelect('toggle-public')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
                >
                  {scene.isPublic ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span>{scene.isPublic ? 'Make Private' : 'Make Public'}</span>
                </button>
              )}
              <hr className="my-1" />
              <button
                onClick={() => handleOptionSelect('delete')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-destructive hover:text-destructive-foreground flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Card Footer */}
      <div className="mt-2">
        <h4 className="font-medium text-sm truncate">{scene.name}</h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {getSceneTypeIcon(scene.type)} {scene.type}
          </span>
          <span className="text-xs text-muted-foreground">
            {scene.stats.viewCount} views
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-1 mt-2">
          {onEditBasicDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOptionSelect('edit-basic')}
              className="flex-1 text-xs h-7"
            >
              <Edit className="h-3 w-3 mr-1" />
              Details
            </Button>
          )}
          {onEditDesign && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOptionSelect('edit-design')}
              className="flex-1 text-xs h-7"
            >
              <Settings className="h-3 w-3 mr-1" />
              Design
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOptionSelect('preview')}
            className="flex-1 text-xs h-7"
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SceneCard;
