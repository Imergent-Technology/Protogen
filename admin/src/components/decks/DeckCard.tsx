import React, { useState } from 'react';
import { Settings, Eye, Edit, Trash2, Play, Pause, Volume2, VolumeX, Layers } from 'lucide-react';
import { Button, Badge } from '@progress/shared';

// Types for deck card
export interface DeckCardData {
  id: string;
  name: string;
  type: 'graph' | 'card' | 'document' | 'dashboard';
  description?: string;
  thumbnail?: string; // base64 preview image from top scene
  metadata: {
    title?: string;
    author?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    sceneCount: number;
    viewCount: number;
    lastViewed?: string;
  };
  isActive: boolean;
  isPublic: boolean;
  scenes: Array<{
    id: string;
    name: string;
    thumbnail?: string;
    type: string;
  }>;
}

export interface DeckCardProps {
  deck: DeckCardData;
  onEdit: (deck: DeckCardData) => void;
  onDelete: (deck: DeckCardData) => void;
  onPreview: (deck: DeckCardData) => void;
  onToggleActive?: (deck: DeckCardData) => void;
  onTogglePublic?: (deck: DeckCardData) => void;
  className?: string;
}

const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onEdit,
  onDelete,
  onPreview,
  onToggleActive,
  onTogglePublic,
  className = ''
}) => {
  const [showMetadata, setShowMetadata] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showSceneCount, setShowSceneCount] = useState(false);

  // Generate deck type icon
  const getDeckTypeIcon = (type: string) => {
    switch (type) {
      case 'graph': return '📊';
      case 'card': return '🃏';
      case 'document': return '📄';
      case 'dashboard': return '📈';
      default: return '📋';
    }
  };

  // Generate deck type color
  const getDeckTypeColor = (type: string) => {
    switch (type) {
      case 'graph': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'card': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'document': return 'bg-green-100 text-green-800 border-green-200';
      case 'dashboard': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle card click - enter deck management mode
  const handleCardClick = () => {
    onEdit(deck);
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
        onEdit(deck);
        break;
      case 'delete':
        onDelete(deck);
        break;
      case 'preview':
        onPreview(deck);
        break;
      case 'toggle-active':
        onToggleActive?.(deck);
        break;
      case 'toggle-public':
        onTogglePublic?.(deck);
        break;
    }
  };

  return (
    <div 
      className={`deck-card relative group cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
      onClick={handleCardClick}
      onMouseEnter={() => setShowMetadata(true)}
      onMouseLeave={() => setShowMetadata(false)}
    >
      {/* Main Card */}
      <div className="relative bg-background border border-border rounded-lg overflow-hidden aspect-video">
        {/* Scene Preview Stack */}
        {deck.scenes.length > 0 ? (
          <div className="relative w-full h-full">
            {/* Top Scene Preview */}
            {deck.scenes[0].thumbnail ? (
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${deck.scenes[0].thumbnail})` }}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">{getDeckTypeIcon(deck.type)}</div>
                  <div className="text-sm text-muted-foreground">No Preview</div>
                </div>
              </div>
            )}

            {/* Additional Scene Previews (Stacked Effect) */}
            {deck.scenes.length > 1 && (
              <div className="absolute bottom-2 right-2">
                {deck.scenes.slice(1, 4).map((scene, index) => (
                  <div
                    key={scene.id}
                    className={`absolute w-8 h-8 rounded border-2 border-background shadow-sm ${
                      index === 0 ? 'bottom-0 right-0' :
                      index === 1 ? 'bottom-1 right-1' :
                      'bottom-2 right-2'
                    }`}
                    style={{
                      backgroundImage: scene.thumbnail ? `url(${scene.thumbnail})` : undefined,
                      backgroundColor: scene.thumbnail ? undefined : 'var(--muted)',
                      zIndex: 10 - index
                    }}
                  />
                ))}
                {deck.scenes.length > 4 && (
                  <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-background shadow-sm">
                    +{deck.scenes.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">{getDeckTypeIcon(deck.type)}</div>
              <div className="text-sm text-muted-foreground">Empty Deck</div>
            </div>
          </div>
        )}

        {/* Deck Type Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={`text-xs ${getDeckTypeColor(deck.type)}`}>
            {deck.type}
          </Badge>
        </div>

        {/* Status Indicators */}
        <div className="absolute top-2 right-2 flex space-x-1">
          {!deck.isActive && (
            <div className="w-2 h-2 bg-red-500 rounded-full" title="Inactive" />
          )}
          {deck.isPublic && (
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

        {/* Scene Count Indicator */}
        {deck.scenes.length > 0 && (
          <div 
            className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseEnter={() => setShowSceneCount(true)}
            onMouseLeave={() => setShowSceneCount(false)}
          >
            <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium">
              <Layers className="h-3 w-3 inline mr-1" />
              {deck.stats.sceneCount} scenes
            </div>
          </div>
        )}

        {/* Scene Count Holograph */}
        {showSceneCount && deck.scenes.length > 0 && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <h4 className="font-semibold mb-2">Scenes in Deck</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {deck.scenes.map((scene, index) => (
                  <div key={scene.id} className="flex items-center space-x-2 text-sm">
                    <span className="text-muted-foreground">#{index + 1}</span>
                    <span>{scene.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {scene.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Options Menu */}
        {showOptions && (
          <div className="absolute top-10 right-2 bg-background border border-border rounded-lg shadow-lg z-10 min-w-[160px]">
            <div className="py-1">
              <button
                onClick={() => handleOptionSelect('edit')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Deck</span>
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
                  {deck.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{deck.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>
              )}
              {onTogglePublic && (
                <button
                  onClick={() => handleOptionSelect('toggle-public')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2"
                >
                  {deck.isPublic ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span>{deck.isPublic ? 'Make Private' : 'Make Public'}</span>
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
              <h3 className="font-semibold text-lg mb-2">{deck.name}</h3>
              {deck.metadata.title && (
                <p className="text-sm text-muted-foreground mb-2">{deck.metadata.title}</p>
              )}
              {deck.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{deck.description}</p>
              )}
              <div className="flex flex-wrap gap-1 justify-center mb-3">
                {deck.metadata.tags?.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {deck.metadata.tags && deck.metadata.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{deck.metadata.tags.length - 3}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <div>Scenes: {deck.stats.sceneCount} | Views: {deck.stats.viewCount}</div>
                <div>Updated: {new Date(deck.metadata.updatedAt).toLocaleDateString()}</div>
                {deck.metadata.author && (
                  <div>By: {deck.metadata.author}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-2">
        <h4 className="font-medium text-sm truncate">{deck.name}</h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {getDeckTypeIcon(deck.type)} {deck.type}
          </span>
          <span className="text-xs text-muted-foreground">
            {deck.stats.sceneCount} scenes
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeckCard;
