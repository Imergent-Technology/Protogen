import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input, Button, Badge } from '@progress/shared';
import SceneCard, { SceneCardData } from './SceneCard';
import { ContextMenu, useContextMenu, getSceneContextMenuItems, SceneContextMenuActions, getListSelectionClasses } from '../common/ContextMenu';

export interface SceneGridProps {
  scenes: SceneCardData[];
  onSceneEdit: (scene: SceneCardData) => void;
  onSceneEditBasicDetails?: (scene: SceneCardData) => void;
  onSceneEditDesign?: (scene: SceneCardData) => void;
  onSceneDelete: (scene: SceneCardData) => void;
  onScenePreview: (scene: SceneCardData) => void;
  onSceneToggleActive?: (scene: SceneCardData) => void;
  onSceneTogglePublic?: (scene: SceneCardData) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const SceneGrid: React.FC<SceneGridProps> = ({
  scenes,
  onSceneEdit,
  onSceneEditBasicDetails,
  onSceneEditDesign,
  onSceneDelete,
  onScenePreview,
  onSceneToggleActive,
  onSceneTogglePublic,
  viewMode = 'grid',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Get unique scene types for filtering
  const sceneTypes = Array.from(new Set(scenes.map(scene => scene.type).filter(type => type !== undefined && type !== null)));

  // Filter scenes based on search and type
  const filteredScenes = scenes.filter(scene => {
    const matchesSearch = !searchQuery || 
      scene.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.metadata.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.metadata.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || scene.type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className={`scene-grid ${className}`}>

      {/* Search and filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scenes by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {sceneTypes.length > 0 && (
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all">All Types</option>
              {sceneTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredScenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              onEdit={onSceneEdit}
              onEditBasicDetails={onSceneEditBasicDetails}
              onEditDesign={onSceneEditDesign}
              onDelete={onSceneDelete}
              onPreview={onScenePreview}
              onToggleActive={onSceneToggleActive}
              onTogglePublic={onSceneTogglePublic}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredScenes.map((scene) => (
            <SceneListItem
              key={scene.id}
              scene={scene}
              onEdit={onSceneEdit}
              onEditBasicDetails={onSceneEditBasicDetails}
              onEditDesign={onSceneEditDesign}
              onDelete={onSceneDelete}
              onPreview={onScenePreview}
              onToggleActive={onSceneToggleActive}
              onTogglePublic={onSceneTogglePublic}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredScenes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">📋</div>
          <h3 className="text-lg font-semibold mb-2">No scenes found</h3>
          <p className="text-muted-foreground">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No scenes available'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Scene List Item Component for streamlined list view
interface SceneListItemProps {
  scene: SceneCardData;
  onEdit: (scene: SceneCardData) => void;
  onEditBasicDetails?: (scene: SceneCardData) => void;
  onEditDesign?: (scene: SceneCardData) => void;
  onDelete: (scene: SceneCardData) => void;
  onPreview: (scene: SceneCardData) => void;
  onToggleActive?: (scene: SceneCardData) => void;
  onTogglePublic?: (scene: SceneCardData) => void;
}

const SceneListItem: React.FC<SceneListItemProps> = ({
  scene,
  onEdit,
  onEditBasicDetails,
  onEditDesign,
  onDelete,
  onPreview,
  onToggleActive,
  onTogglePublic,
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
    showContextMenu(e, menuItems, scene.id);
  };

  const isSelected = contextMenu.isOpen && contextMenu.selectedEntityId === scene.id;

  return (
    <div className="relative group" onContextMenu={handleContextMenu}>
      <div className={getListSelectionClasses(isSelected, 'flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors')}>
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Thumbnail */}
          <div className="w-12 h-8 rounded border border-border overflow-hidden flex-shrink-0">
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
                'bg-gray-50 dark:bg-gray-950'
              }`}>
                <span className="text-sm">
                  {getSceneTypeIcon(scene.type)}
                </span>
              </div>
            )}
          </div>

          {/* Scene Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium truncate text-sm">{scene.name}</h3>
              <Badge className={`text-xs ${getSceneTypeColor(scene.type)}`}>
                {scene.type}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {scene.stats.viewCount} views
              </span>
              {scene.metadata.tags?.slice(0, 2).map((tag, index) => (
                <span key={index} className="text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-2">
          {!scene.isActive && (
            <div className="w-2 h-2 bg-red-500 rounded-full" title="Inactive" />
          )}
          {scene.isPublic && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Public" />
          )}
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

export default SceneGrid;
