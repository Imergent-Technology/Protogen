import React, { useState, useEffect, useRef } from 'react';
import { Grid, List, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button, Input } from '@progress/shared';
import SceneCard, { SceneCardData } from './SceneCard';

export interface SceneGridProps {
  scenes: SceneCardData[];
  onSceneEdit: (scene: SceneCardData) => void;
  onSceneDelete: (scene: SceneCardData) => void;
  onScenePreview: (scene: SceneCardData) => void;
  onSceneToggleActive?: (scene: SceneCardData) => void;
  onSceneTogglePublic?: (scene: SceneCardData) => void;
  className?: string;
}

const SceneGrid: React.FC<SceneGridProps> = ({
  scenes,
  onSceneEdit,
  onSceneDelete,
  onScenePreview,
  onSceneToggleActive,
  onSceneTogglePublic,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showViewMenu, setShowViewMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowViewMenu(false);
      }
    };

    if (showViewMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showViewMenu]);

  // Get unique scene types for filtering
  const sceneTypes = Array.from(new Set(scenes.map(scene => scene.type)));

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
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Scenes ({filteredScenes.length})</h2>
        
        {/* View options flyout menu */}
        <div className="relative" ref={menuRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowViewMenu(!showViewMenu)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          
          {showViewMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-10">
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">View Options</div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setViewMode('grid');
                      setShowViewMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-muted flex items-center ${
                      viewMode === 'grid' ? 'bg-muted' : ''
                    }`}
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Grid View
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('list');
                      setShowViewMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-muted flex items-center ${
                      viewMode === 'list' ? 'bg-muted' : ''
                    }`}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List View
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
              onDelete={onSceneDelete}
              onPreview={onScenePreview}
              onToggleActive={onSceneToggleActive}
              onTogglePublic={onSceneTogglePublic}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredScenes.map((scene) => (
            <div
              key={scene.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded border border-border overflow-hidden flex-shrink-0">
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
                      <span className="text-lg">
                        {scene.type === 'graph' ? '📊' :
                         scene.type === 'document' ? '📄' :
                         scene.type === 'card' ? '🃏' : '📋'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Scene Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{scene.name}</h3>
                  {scene.metadata.title && (
                    <p className="text-sm text-muted-foreground truncate">{scene.metadata.title}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      scene.type === 'graph' ? 'bg-blue-100 text-blue-800' :
                      scene.type === 'document' ? 'bg-green-100 text-green-800' :
                      scene.type === 'card' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {scene.type}
                    </span>
                    {scene.metadata.tags?.slice(0, 2).map((tag, index) => (
                      <span key={index} className="text-xs text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {scene.stats.viewCount} views
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSceneEdit(scene)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onScenePreview(scene)}
                >
                  Preview
                </Button>
              </div>
            </div>
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

export default SceneGrid;
