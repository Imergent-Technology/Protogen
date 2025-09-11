import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckStore, Deck } from '../../stores/deckStore';
import { DeckType } from '../../stores/deckStore';
import { performanceManager } from '../../services/PerformanceManager';
import { Plus, SlidersHorizontal, Grid, List, Loader2 } from 'lucide-react';
import DeckGrid from './DeckGrid';
import { DeckCardData } from './DeckCard';
import ConfirmationDialog from '../common/ConfirmationDialog';
import { SceneDeckLinkDialog } from '../common';

// Function to determine deck type based on scene types
const determineDeckType = (sceneTypes: string[]): DeckType => {
  const uniqueTypes = [...new Set(sceneTypes)];
  
  if (uniqueTypes.length === 0) {
    return 'graph'; // Default type for empty decks
  }
  
  if (uniqueTypes.length === 1) {
    return uniqueTypes[0] as DeckType;
  }
  
  return 'hybrid' as DeckType; // Multiple scene types = hybrid
};

// Deck Manager Component
export const DeckManager: React.FC = () => {
  const navigate = useNavigate();
  const {
    decks,
    scenes,
    decksLoading,
    decksError,
    loadDecks,
    updateDeck,
    deleteDeck,
    setDecksLoading,
    setDecksError,
  } = useDeckStore();

  const [showListOptions, setShowListOptions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const listOptionsRef = useRef<HTMLDivElement>(null);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    deckId: string | null;
    deckName: string;
  }>({
    isOpen: false,
    deckId: null,
    deckName: ''
  });

  // Deck-Scene linking state
  const [linkDialog, setLinkDialog] = useState<{
    isOpen: boolean;
    currentDeck: Deck | null;
  }>({
    isOpen: false,
    currentDeck: null
  });

  // Initialize performance manager
  useEffect(() => {
    performanceManager.initialize();
    return () => performanceManager.destroy();
  }, []);

  // Close list options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listOptionsRef.current && !listOptionsRef.current.contains(event.target as Node)) {
        setShowListOptions(false);
      }
    };

    if (showListOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showListOptions]);

  // Load decks on component mount
  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  // Convert Deck to DeckCardData format
  const convertToDeckCardData = (deck: Deck): DeckCardData => {
    const deckSceneIds = deck.sceneIds || [];
    const deckScenes = scenes.filter(scene => deckSceneIds.includes(scene.id));
    const sceneTypes = deckScenes.map(scene => scene.type);
    const determinedType = determineDeckType(sceneTypes);

    return {
      id: deck.guid, // Use GUID for API calls
      name: deck.name,
      type: determinedType,
      description: deck.description,
      thumbnail: deckScenes[0]?.thumbnail,
      metadata: {
        title: deck.name,
        author: deck.creator_id?.toString(),
        tags: deck.tags || [],
        createdAt: deck.created_at,
        updatedAt: deck.updated_at,
      },
      stats: {
        sceneCount: deckSceneIds.length,
        viewCount: deck.view_count || 0,
        lastViewed: deck.last_viewed_at,
      },
      isActive: deck.is_active,
      isPublic: deck.is_public,
      scenes: deckScenes.map(scene => ({
        id: scene.id,
        name: scene.name,
        thumbnail: scene.thumbnail,
        type: scene.type,
      })),
    };
  };

  // Handle deck creation navigation
  const handleCreateDeck = () => {
    navigate('/decks/new');
  };

  // Handle deck editing navigation
  const handleEditDeck = (deck: DeckCardData) => {
    const originalDeck = decks.find(d => d.guid === deck.id);
    if (originalDeck) {
      navigate(`/decks/edit/${deck.id}`);
    }
  };

  // Handle deck deletion
  const handleDeckDelete = async (deck: DeckCardData) => {
    setDeleteConfirmation({
      isOpen: true,
      deckId: deck.id,
      deckName: deck.name
    });
  };

  // Confirm deck deletion
  const confirmDeleteDeck = async () => {
    if (!deleteConfirmation.deckId) return;

    try {
      setDecksLoading(true);
      await deleteDeck(deleteConfirmation.deckId);
      setDeleteConfirmation({
        isOpen: false,
        deckId: null,
        deckName: ''
      });
    } catch (error) {
      console.error('Failed to delete deck:', error);
      setDecksError(error instanceof Error ? error.message : 'Failed to delete deck');
    } finally {
      setDecksLoading(false);
    }
  };

  // Cancel deck deletion
  const cancelDeleteDeck = () => {
    setDeleteConfirmation({
      isOpen: false,
      deckId: null,
      deckName: ''
    });
  };

  // Deck-Scene linking handlers
  const handleDeckLinkToScene = (deckData: DeckCardData) => {
    const deck = decks.find(d => d.guid === deckData.id);
    if (deck) {
      setLinkDialog({
        isOpen: true,
        currentDeck: deck
      });
    }
  };

  const handleDeckSceneLink = async (linkData: {
    sceneId: string;
    deckId: string;
    action: 'add' | 'remove';
  }) => {
    try {
      setDecksLoading(true);
      
      // Find the scene and deck
      const scene = scenes.find(s => s.id === linkData.sceneId);
      const deck = decks.find(d => d.id === linkData.deckId);
      
      if (!scene || !deck) {
        throw new Error('Scene or deck not found');
      }

      if (linkData.action === 'add') {
        // Add scene to deck
        const updatedDeck = {
          ...deck,
          sceneIds: [...deck.sceneIds, scene.id]
        };
        await updateDeck(deck.guid, updatedDeck);
      } else {
        // Remove scene from deck
        const updatedDeck = {
          ...deck,
          sceneIds: deck.sceneIds.filter(id => id !== scene.id)
        };
        await updateDeck(deck.guid, updatedDeck);
      }
      
      // Close dialog
      setLinkDialog({
        isOpen: false,
        currentDeck: null
      });
      
    } catch (error) {
      console.error('Failed to link deck to scene:', error);
      setDecksError(error instanceof Error ? error.message : 'Failed to link deck to scene');
    } finally {
      setDecksLoading(false);
    }
  };

  const closeLinkDialog = () => {
    setLinkDialog({
      isOpen: false,
      currentDeck: null
    });
  };



  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Deck Management</h1>
        <p className="text-muted-foreground">
            Create and manage presentation decks to organize your scenes
        </p>
      </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
        {/* List Options Button */}
        <div className="relative" ref={listOptionsRef}>
        <button
            onClick={() => setShowListOptions(!showListOptions)}
            className="p-2 border border-border rounded-md hover:bg-muted transition-colors"
            title="List Options"
          >
            <SlidersHorizontal className="h-4 w-4" />
        </button>
          {showListOptions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-10">
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">View Options</div>
                <div className="space-y-1">
        <button
                    onClick={() => { setViewMode('grid'); setShowListOptions(false); }}
                    className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-muted flex items-center ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                  >
                    <Grid className="h-4 w-4 mr-2" /> Grid View
                        </button>
                        <button
                    onClick={() => { setViewMode('list'); setShowListOptions(false); }}
                    className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-muted flex items-center ${viewMode === 'list' ? 'bg-muted' : ''}`}
                  >
                    <List className="h-4 w-4 mr-2" /> List View
                        </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Deck Button */}
            <button
          onClick={handleCreateDeck}
          className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          title="Create Deck"
            >
          <Plus className="h-4 w-4" />
            </button>
          </div>
            </div>

      {/* Error Display */}
      {decksError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive">{decksError}</p>
        </div>
      )}

      {/* Decks Content */}
      {decksLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading decks...
        </div>
      ) : (
        <DeckGrid
          decks={decks.map(convertToDeckCardData)}
          onDeckEdit={handleEditDeck}
          onDeckDelete={handleDeckDelete}
          onDeckPreview={(deck) => {
            // TODO: Implement deck preview
          }}
          onDeckToggleActive={(deck) => {
            // TODO: Implement toggle active
          }}
          onDeckTogglePublic={(deck) => {
            // TODO: Implement toggle public
          }}
          onDeckLinkToScene={handleDeckLinkToScene}
        />
      )}



      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={cancelDeleteDeck}
        onConfirm={confirmDeleteDeck}
        title="Delete Deck"
        message={`Are you sure you want to delete "${deleteConfirmation.deckName}"? This action cannot be undone.`}
        confirmText="Delete Deck"
        cancelText="Cancel"
        variant="destructive"
        isLoading={decksLoading}
      />

      {/* Deck-Scene Link Dialog */}
      <SceneDeckLinkDialog
        isOpen={linkDialog.isOpen}
        onClose={closeLinkDialog}
        onLink={handleDeckSceneLink}
        scenes={scenes}
        decks={decks}
        currentDeck={linkDialog.currentDeck}
        mode="deck-to-scene"
      />
    </div>
  );
};

export default DeckManager;