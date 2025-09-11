import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input, Button, Badge } from '@progress/shared';
import DeckCard, { DeckCardData } from './DeckCard';
import { ContextMenu, useContextMenu, getDeckContextMenuItems, DeckContextMenuActions } from '../common/ContextMenu';

export interface DeckGridProps {
  decks: DeckCardData[];
  onDeckEdit: (deck: DeckCardData) => void;
  onDeckDelete: (deck: DeckCardData) => void;
  onDeckPreview: (deck: DeckCardData) => void;
  onDeckToggleActive?: (deck: DeckCardData) => void;
  onDeckTogglePublic?: (deck: DeckCardData) => void;
  onDeckLinkToScene?: (deck: DeckCardData) => void;
  className?: string;
}

const DeckGrid: React.FC<DeckGridProps> = ({
  decks,
  onDeckEdit,
  onDeckDelete,
  onDeckPreview,
  onDeckToggleActive,
  onDeckTogglePublic,
  onDeckLinkToScene,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter decks based on search term
  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deck.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deck.metadata.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search decks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Decks Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={`deck-${deck.id}`}
              deck={deck}
              onEdit={onDeckEdit}
              onDelete={onDeckDelete}
              onPreview={onDeckPreview}
              onToggleActive={onDeckToggleActive}
              onTogglePublic={onDeckTogglePublic}
              onLinkToScene={onDeckLinkToScene}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredDecks.map((deck) => (
            <DeckListItem
              key={`deck-list-${deck.id}`}
              deck={deck}
              onEdit={onDeckEdit}
              onDelete={onDeckDelete}
              onPreview={onDeckPreview}
              onToggleActive={onDeckToggleActive}
              onTogglePublic={onDeckTogglePublic}
              onLinkToScene={onDeckLinkToScene}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredDecks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">📚</div>
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'No decks found' : 'No decks yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? `No decks match "${searchTerm}"`
              : 'Create your first deck to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Deck List Item Component for streamlined list view
interface DeckListItemProps {
  deck: DeckCardData;
  onEdit: (deck: DeckCardData) => void;
  onDelete: (deck: DeckCardData) => void;
  onPreview: (deck: DeckCardData) => void;
  onToggleActive?: (deck: DeckCardData) => void;
  onTogglePublic?: (deck: DeckCardData) => void;
  onLinkToScene?: (deck: DeckCardData) => void;
}

const DeckListItem: React.FC<DeckListItemProps> = ({
  deck,
  onEdit,
  onDelete,
  onPreview,
  onToggleActive,
  onTogglePublic,
  onLinkToScene,
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
    <div className="relative group" onContextMenu={handleContextMenu}>
      <div className={`flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5' : ''
      }`}>
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Thumbnail */}
          <div className="w-12 h-8 rounded border border-border overflow-hidden flex-shrink-0">
            {deck.scenes.length > 0 && deck.scenes[0].thumbnail ? (
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${deck.scenes[0].thumbnail})` }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-sm">
                  {getDeckTypeIcon(deck.type)}
                </span>
              </div>
            )}
          </div>

          {/* Deck Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium truncate text-sm">{deck.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {deck.type}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {deck.stats.sceneCount} scenes
              </span>
              <span className="text-xs text-muted-foreground">
                {deck.stats.viewCount} views
              </span>
              {deck.metadata.tags?.slice(0, 2).map((tag, index) => (
                <span key={`${deck.id}-tag-${index}`} className="text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-2">
          {!deck.isActive && (
            <div className="w-2 h-2 bg-destructive rounded-full" title="Inactive" />
          )}
          {deck.isPublic && (
            <div className="w-2 h-2 bg-primary rounded-full" title="Public" />
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

export default DeckGrid;
