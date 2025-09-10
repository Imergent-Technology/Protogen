import React from 'react';
import { Badge } from '@progress/shared';
import { ContextMenu, useContextMenu, getSceneContextMenuItems, SceneContextMenuActions } from '../common/ContextMenu';

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
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

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

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    const actions: SceneContextMenuActions = {
      onEditBasicDetails: onEditBasicDetails ? () => onEditBasicDetails(scene) : undefined,
      onEditDesign: onEditDesign ? () => onEditDesign(scene) : undefined,
      onPreview: onPreview ? () => onPreview(scene) : undefined,
      onToggleActive: onToggleActive ? () => onToggleActive(scene) : undefined,
      onTogglePublic: onTogglePublic ? () => onTogglePublic(scene) : undefined,
      onDelete: onDelete ? () => onDelete(scene) : undefined,
    };

    const menuItems = getSceneContextMenuItems(scene, actions);
    showContextMenu(e, menuItems);
  };

  return (
    <div 
      className={`scene-card relative group transition-all duration-200 hover:shadow-lg ${className}`}
      onContextMenu={handleContextMenu}
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

        {/* Status Indicators */}
        <div className="absolute top-2 right-2 flex space-x-1">
          {!scene.isActive && (
            <div className="w-2 h-2 bg-red-500 rounded-full" title="Inactive" />
          )}
          {scene.isPublic && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Public" />
          )}
        </div>

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

      {/* Context Menu */}
      <ContextMenu
        items={contextMenu.items}
        isOpen={contextMenu.isOpen}
        onClose={hideContextMenu}
        position={contextMenu.position}
      />
    </div>
  );
};

export default SceneCard;
