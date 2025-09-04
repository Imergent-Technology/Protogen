import React, { useState } from 'react';
import { Settings, Eye, Edit, Trash2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button, Badge } from '@progress/shared';

// Types for scene card
export interface SceneCardData {
  id: string;
  name: string;
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
}

export interface SceneCardProps {
  scene: SceneCardData;
  onEdit: (scene: SceneCardData) => void;
  onDelete: (scene: SceneCardData) => void;
  onPreview: (scene: SceneCardData) => void;
  onToggleActive?: (scene: SceneCardData) => void;
  onTogglePublic?: (scene: SceneCardData) => void;
  className?: string;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  onEdit,
  onDelete,
  onPreview,
  onToggleActive,
  onTogglePublic,
  className = ''
}) => {
  const [showMetadata, setShowMetadata] = useState(false);
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

  // Handle card click - enter authoring mode
  const handleCardClick = () => {
    onEdit(scene);
  };

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
      className={`scene-card relative group cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setShowMetadata(true)}
      onMouseLeave={() => setShowMetadata(false)}
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

        {/* Options Button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

        {/* Hover Metadata Overlay */}
        {showMetadata && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center p-4">
              <h3 className="font-semibold text-lg mb-2">{scene.name}</h3>
              {scene.metadata.title && (
                <p className="text-sm text-muted-foreground mb-2">{scene.metadata.title}</p>
              )}
              {scene.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{scene.description}</p>
              )}
              <div className="flex flex-wrap gap-1 justify-center mb-3">
                {scene.metadata.tags?.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {scene.metadata.tags && scene.metadata.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{scene.metadata.tags.length - 3}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <div>Views: {scene.stats.viewCount}</div>
                <div>Updated: {new Date(scene.metadata.updatedAt).toLocaleDateString()}</div>
                {scene.metadata.author && (
                  <div>By: {scene.metadata.author}</div>
                )}
              </div>
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
      </div>
    </div>
  );
};

export default SceneCard;
