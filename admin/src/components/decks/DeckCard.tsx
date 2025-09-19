import React from 'react';
import { Layers } from 'lucide-react';
import { Badge } from '@protogen/shared';
import { ContextMenu, useContextMenu, getDeckContextMenuItems, DeckContextMenuActions } from '../common/ContextMenu';

// Types for deck card
export interface DeckCardData {
  id: string;
  name: string;
  type: 'graph' | 'card' | 'document' | 'dashboard' | 'hybrid';
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
  onLinkToScene?: (deck: DeckCardData) => void;
  className?: string;
}

const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onEdit,
  onDelete,
  onPreview,
  onToggleActive,
  onTogglePublic,
  onLinkToScene,
  className = ''
}) => {
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  // Generate deck type icon
  const getDeckTypeIcon = (type: string) => {
    switch (type) {
      case 'graph': return '📊';
      case 'card': return '🃏';
      case 'document': return '📄';
      case 'dashboard': return '📈';
      case 'hybrid': return '🔀';
      default: return '📋';
    }
  };

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    const actions: DeckContextMenuActions = {
      onEdit: onEdit ? () => onEdit(deck) : undefined,
      onPreview: onPreview ? () => onPreview(deck) : undefined,
      onLinkToScene: onLinkToScene ? () => onLinkToScene(deck) : undefined,
      onToggleActive: onToggleActive ? () => onToggleActive(deck) : undefined,
      onTogglePublic: onTogglePublic ? () => onTogglePublic(deck) : undefined,
      onDelete: onDelete ? () => onDelete(deck) : undefined,
    };

    const menuItems = getDeckContextMenuItems(deck, actions);
    showContextMenu(e, menuItems, deck.id);
  };

  const isSelected = contextMenu.isOpen && contextMenu.selectedEntityId === deck.id;

  return (
    <div 
      className={`deck-card relative group cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
      onClick={() => onEdit(deck)}
      onContextMenu={handleContextMenu}
    >
      {/* Main Card */}
      <div className={`relative border border-border rounded-lg overflow-hidden aspect-video transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
      }`}>
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
                    key={`${deck.id}-scene-${index + 1}`}
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

        {/* Status Indicators */}
        <div className="absolute top-2 right-2 flex space-x-1">
          {!deck.isActive && (
            <div className="w-2 h-2 bg-destructive rounded-full" title="Inactive" />
          )}
          {deck.isPublic && (
            <div className="w-2 h-2 bg-primary rounded-full" title="Public" />
          )}
        </div>

        {/* Scene Count Indicator */}
        {deck.scenes.length > 0 && (
          <div className="absolute bottom-2 left-2">
            <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium">
              <Layers className="h-3 w-3 inline mr-1" />
              {deck.stats.sceneCount} scenes
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-2">
        <h4 className="font-medium text-sm truncate">{deck.name}</h4>
        <div className="flex items-center justify-between mt-1">
          <Badge variant="secondary" className="text-xs">
            {deck.type}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {deck.stats.sceneCount} scenes
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

export default DeckCard;
