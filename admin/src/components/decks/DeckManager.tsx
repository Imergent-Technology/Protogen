import React, { useState, useEffect, useRef } from 'react';
import { useDeckStore, Deck } from '../../stores/deckStore';
import { DeckType } from '../../stores/deckStore';
import { performanceManager } from '../../services/PerformanceManager';
import { Plus, SlidersHorizontal, Grid, List, Loader2 } from 'lucide-react';
import DeckGrid from './DeckGrid';
import { DeckCardData } from './DeckCard';
import DeckWorkflow, { DeckWorkflowData } from '../workflows/deck/DeckWorkflow';
import ConfirmationDialog from '../common/ConfirmationDialog';

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
  const {
    decks,
    scenes,
    decksLoading,
    decksError,
    createDeck,
    updateDeck,
    deleteDeck,
    setDecksLoading,
    setDecksError,
  } = useDeckStore();

  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showEditDeck, setShowEditDeck] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
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

  // Convert Deck to DeckCardData format
  const convertToDeckCardData = (deck: Deck): DeckCardData => {
    const deckScenes = scenes.filter(scene => deck.sceneIds.includes(scene.id));
    const sceneTypes = deckScenes.map(scene => scene.type);
    const determinedType = determineDeckType(sceneTypes);

    return {
      id: deck.id,
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
        sceneCount: deck.sceneIds.length,
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

  // Handle deck creation/editing
  const handleDeckWorkflowComplete = async (data: DeckWorkflowData) => {
    try {
      setDecksLoading(true);
      
      if (showEditDeck && editingDeck) {
        // Update existing deck
        await updateDeck(editingDeck.id, {
          name: data.basicDetails.name,
          slug: data.basicDetails.slug,
          description: data.basicDetails.description,
          type: data.basicDetails.type as DeckType,
          keep_warm: data.basicDetails.keepWarm,
          preload_strategy: data.basicDetails.preloadStrategy,
        });
      } else {
        // Create new deck
        await createDeck({
          name: data.basicDetails.name,
          slug: data.basicDetails.slug,
          description: data.basicDetails.description,
          type: data.basicDetails.type as DeckType,
          keep_warm: data.basicDetails.keepWarm,
          preload_strategy: data.basicDetails.preloadStrategy,
          scene_ids: [],
          tags: [],
          is_active: true,
          is_public: false,
        });
      }
      
      setShowCreateDeck(false);
      setShowEditDeck(false);
      setEditingDeck(null);
    } catch (error) {
      console.error('Failed to save deck:', error);
      setDecksError(error instanceof Error ? error.message : 'Failed to save deck');
    } finally {
      setDecksLoading(false);
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

  // Handle deck creation
  const handleCreateDeck = async () => {
    try {
      setDecksLoading(true);
      setDecksError(null);

      const newDeck = {
        name: deckForm.name,
        slug: deckForm.slug || deckForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: deckForm.description,
        type: deckForm.type,
        sceneIds: [],
        navigation: {
          type: 'sequential' as const,
          transitions: {
            type: 'slide' as const,
            duration: 300,
          },
          controls: {
            showProgress: true,
            allowRandomAccess: false,
            keyboardNavigation: true,
          },
        },
        performance: {
          keepWarm: deckForm.keepWarm,
          preloadStrategy: deckForm.preloadStrategy,
        },
      };

      await createDeck(newDeck);
      
      // Reset form
      setDeckForm({
        name: '',
        slug: '',
        description: '',
        type: 'graph',
        keepWarm: true,
        preloadStrategy: 'proximity',
      });
      setShowCreateDeck(false);
      
    } catch (error) {
      setDecksError(error instanceof Error ? error.message : 'Failed to create deck');
    } finally {
      setDecksLoading(false);
    }
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
          onClick={() => setShowCreateDeck(true)}
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
          onDeckEdit={(deck) => {
            const originalDeck = decks.find(d => d.id === deck.id);
            if (originalDeck) {
              setEditingDeck(originalDeck);
              setShowEditDeck(true);
            }
          }}
          onDeckDelete={handleDeckDelete}
          onDeckPreview={(deck) => {
            // TODO: Implement deck preview
            console.log('Preview deck:', deck);
          }}
          onDeckToggleActive={(deck) => {
            // TODO: Implement toggle active
            console.log('Toggle active:', deck);
          }}
          onDeckTogglePublic={(deck) => {
            // TODO: Implement toggle public
            console.log('Toggle public:', deck);
          }}
        />
      )}


      {/* Create Deck Workflow */}
      {showCreateDeck && (
        <DeckWorkflow
          mode="create"
          onComplete={handleDeckWorkflowComplete}
          onCancel={() => setShowCreateDeck(false)}
        />
      )}

      {/* Edit Deck Workflow */}
      {showEditDeck && editingDeck && (
        <DeckWorkflow
          mode="edit"
          initialData={{
            basicDetails: {
              name: editingDeck.name,
              slug: editingDeck.slug,
              description: editingDeck.description || '',
              type: editingDeck.type,
              keepWarm: editingDeck.performance?.keepWarm || true,
              preloadStrategy: editingDeck.performance?.preloadStrategy || 'proximity',
            }
          }}
          onComplete={handleDeckWorkflowComplete}
          onCancel={() => {
            setShowEditDeck(false);
            setEditingDeck(null);
          }}
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
    </div>
  );
};

export default DeckManager;