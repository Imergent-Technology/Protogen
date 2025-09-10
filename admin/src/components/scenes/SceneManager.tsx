import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckStore, Scene } from '../../stores/deckStore';
import { SceneType } from '../../stores/deckStore';
import { performanceManager } from '../../services/PerformanceManager';
import SceneGrid from './SceneGrid';
import { SceneCardData } from './SceneCard';
import { SelectionModal, SelectableItem } from '../common';
import { Plus, SlidersHorizontal, Grid, List, Loader2 } from 'lucide-react';
import ConfirmationDialog from '../common/ConfirmationDialog';

// Scene type badges
const SceneTypeBadge: React.FC<{ type: SceneType }> = ({ type }) => {
  return (
    <Badge variant="secondary" className="text-xs">
      {type}
    </Badge>
  );
};

// Remove DeckTypeIcon - no longer needed in pure scene manager

// Scene and Deck Manager Component
export const SceneManager: React.FC = () => {
  const navigate = useNavigate();
  const {
    decks,
    scenes,
    scenesLoading,
    scenesError,
    loadScenes,
    createScene,
    updateScene,
    deleteScene,
    setScenesLoading,
    setScenesError,
  } = useDeckStore();

  // Remove deck-related state - this is now a pure scene manager
  const [showCreateScene, setShowCreateScene] = useState(false);
  const [showEditScene, setShowEditScene] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [showDeckSelection, setShowDeckSelection] = useState(false);
  const [showListOptions, setShowListOptions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const listOptionsRef = useRef<HTMLDivElement>(null);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    sceneId: string | null;
    sceneName: string;
  }>({
    isOpen: false,
    sceneId: null,
    sceneName: ''
  });
  // Remove activeTab state - this is now a pure scene manager

  // Form states
  const [sceneForm, setSceneForm] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'graph' as SceneType,
    deckIds: [] as string[],
  });

  // Remove deck form state - this is now a pure scene manager

  // Initialize performance manager and load scenes
  useEffect(() => {
    performanceManager.initialize();
    loadScenes(); // Load scenes when component mounts
    return () => performanceManager.destroy();
  }, [loadScenes]);

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

  // Auto-generate slug when name field loses focus (on blur)
  const handleNameBlur = () => {
    if (sceneForm.name && !sceneForm.slug) {
      const slug = sceneForm.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSceneForm(prev => ({ ...prev, slug }));
    }
  };

  // Remove deck-related handlers - this is now a pure scene manager

  // Handle scene creation
  const handleCreateScene = async () => {
    try {
      setScenesLoading(true);
      setScenesError(null);

      const newScene = {
        name: sceneForm.name,
        slug: sceneForm.slug || sceneForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: sceneForm.description,
        type: sceneForm.type,
        deckIds: sceneForm.deckIds,
        content: {
          data: {},
          metadata: {},
        },
        toolset: {
          libraries: [],
          preload: false,
          keepWarm: false,
        },
        is_active: true,
        is_public: false,
      };

      await createScene(newScene);
      
      // Reset form
      setSceneForm({
        name: '',
        slug: '',
        description: '',
        type: 'graph',
        deckIds: [],
      });
      setShowCreateScene(false);
      
      // Scene created successfully
    } catch (error) {
      setScenesError(error instanceof Error ? error.message : 'Failed to create scene');
    } finally {
      setScenesLoading(false);
    }
  };

  // Handle scene editing
  const handleEditScene = (scene: Scene) => {
    setEditingScene(scene);
    setSceneForm({
      name: scene.name,
      slug: scene.slug,
      description: scene.description || '',
      type: scene.type,
      deckIds: scene.deckIds,
    });
    setShowEditScene(true);
  };

  // Handle scene update
  const handleUpdateScene = async () => {
    if (!editingScene) return;
    
    try {
      setScenesLoading(true);
      setScenesError(null);

      await updateScene(editingScene.id, {
        name: sceneForm.name,
        slug: sceneForm.slug,
        description: sceneForm.description,
        type: sceneForm.type,
        deckIds: sceneForm.deckIds,
      });
      
      // Reset form and close modal
      setSceneForm({
        name: '',
        slug: '',
        description: '',
        type: 'graph',
        deckIds: [],
      });
      setEditingScene(null);
      setShowEditScene(false);
      
      // Scene updated successfully
    } catch (error) {
      setScenesError(error instanceof Error ? error.message : 'Failed to update scene');
    } finally {
      setScenesLoading(false);
    }
  };

  // Remove all deck-related handlers - this is now a pure scene manager

  // Handle scene deletion
  const handleDeleteScene = async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    setDeleteConfirmation({
      isOpen: true,
      sceneId,
      sceneName: scene.name
    });
  };

  // Confirm scene deletion
  const confirmDeleteScene = async () => {
    if (!deleteConfirmation.sceneId) return;

    try {
      setScenesLoading(true);
      await deleteScene(deleteConfirmation.sceneId);
      setDeleteConfirmation({
        isOpen: false,
        sceneId: null,
        sceneName: ''
      });
    } catch (error) {
      console.error('Failed to delete scene:', error);
      setScenesError(error instanceof Error ? error.message : 'Failed to delete scene');
    } finally {
      setScenesLoading(false);
    }
  };

  // Cancel scene deletion
  const cancelDeleteScene = () => {
    setDeleteConfirmation({
      isOpen: false,
      sceneId: null,
      sceneName: ''
    });
  };

  // Get all decks that contain a specific scene
  const getSceneDecks = (sceneId: string) => {
    return decks.filter(deck => deck.sceneIds.includes(sceneId));
  };

  // Convert decks to SelectableItem format
  const convertDecksToSelectableItems = (): SelectableItem[] => {
    return decks.map(deck => ({
      id: deck.id,
      name: deck.name,
      type: deck.type,
      description: deck.description,
      metadata: {
        title: deck.name,
        createdAt: deck.created_at,
        updatedAt: deck.updated_at,
      },
      stats: {
        viewCount: 0, // TODO: Add view tracking
      },
      isActive: true, // TODO: Add active status to deck model
      isPublic: false, // TODO: Add public status to deck model
    }));
  };

  // Handle deck selection
  const handleDeckSelection = (selectedDecks: SelectableItem[]) => {
    console.log('Selected decks:', selectedDecks);
    // TODO: Implement deck selection logic
    setShowDeckSelection(false);
  };

  // Convert Scene to SceneCardData
  const convertToSceneCardData = (scene: Scene): SceneCardData => {
    return {
      id: scene.id,
      name: scene.name,
      type: scene.type === 'dashboard' ? 'custom' : scene.type,
      description: scene.description,
      thumbnail: undefined, // Will be generated when needed
      metadata: {
        title: scene.name,
        author: scene.creator_id?.toString(),
        tags: [],
        createdAt: scene.created_at,
        updatedAt: scene.updated_at
      },
      stats: {
        viewCount: 0, // TODO: Add view tracking
        lastViewed: undefined
      },
      isActive: scene.is_active,
      isPublic: scene.is_public
    };
  };

  // Scene card handlers
  const handleSceneCardEdit = (sceneData: SceneCardData) => {
    const scene = scenes.find(s => s.id === sceneData.id);
    if (scene) {
      handleEditScene(scene);
    }
  };

  const handleSceneCardDelete = (sceneData: SceneCardData) => {
    handleDeleteScene(sceneData.id);
  };

  const handleSceneCardPreview = (sceneData: SceneCardData) => {
    // TODO: Implement scene preview
    console.log('Preview scene:', sceneData);
  };

  const handleSceneCardToggleActive = (sceneData: SceneCardData) => {
    // TODO: Implement toggle active
    console.log('Toggle active:', sceneData);
  };

  const handleSceneCardTogglePublic = (sceneData: SceneCardData) => {
    // TODO: Implement toggle public
    console.log('Toggle public:', sceneData);
  };

  // New handlers for edit buttons
  const handleSceneCardEditBasicDetails = (sceneData: SceneCardData) => {
    navigate(`/scenes/${sceneData.id}/edit`);
  };

  const handleSceneCardEditDesign = (sceneData: SceneCardData) => {
    navigate(`/scenes/${sceneData.id}/design`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Scene Management</h1>
          <p className="text-muted-foreground">
            Create and manage scenes as primary content units, then organize them into presentation decks
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
                <div className="border-t border-border my-2"></div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Filters</div>
                <div className="space-y-1">
                  <button
                    onClick={() => { setShowDeckSelection(true); setShowListOptions(false); }}
                    className="w-full text-left px-2 py-1 text-sm rounded hover:bg-muted"
                  >
                    Filter by Deck
                  </button>
      </div>
            </div>
            </div>
          )}
        </div>

        {/* Create Scene Button */}
            <button
              onClick={() => navigate('/scenes/new')}
          className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          title="Create Scene"
            >
          <Plus className="h-4 w-4" />
            </button>
        </div>
      </div>

      {/* Error Display */}
      {scenesError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive">{scenesError}</p>
        </div>
      )}

      {/* Scenes Content */}
          {scenesLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading scenes...</p>
            </div>
          ) : scenes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-lg font-semibold mb-2">No Scenes Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first scene to get started
              </p>
              <button
                onClick={() => navigate('/scenes/new')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Create First Scene
              </button>
            </div>
          ) : (
            <SceneGrid
              scenes={scenes.map(convertToSceneCardData)}
              onSceneEdit={handleSceneCardEdit}
              onSceneEditBasicDetails={handleSceneCardEditBasicDetails}
              onSceneEditDesign={handleSceneCardEditDesign}
              onSceneDelete={handleSceneCardDelete}
              onScenePreview={handleSceneCardPreview}
              onSceneToggleActive={handleSceneCardToggleActive}
              onSceneTogglePublic={handleSceneCardTogglePublic}
          viewMode={viewMode}
        />
      )}

      {/* Create Scene Modal */}
      {showCreateScene && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Scene</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={sceneForm.name}
                  onChange={(e) => setSceneForm({ ...sceneForm, name: e.target.value })}
                  onBlur={handleNameBlur}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Enter scene name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={sceneForm.slug}
                  onChange={(e) => setSceneForm({ ...sceneForm, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Auto-generated from name"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL-friendly identifier (auto-generated from name)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={sceneForm.description}
                  onChange={(e) => setSceneForm({ ...sceneForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Enter scene description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={sceneForm.type}
                  onChange={(e) => setSceneForm({ ...sceneForm, type: e.target.value as SceneType })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="graph">Graph</option>
                  <option value="card">Card</option>
                  <option value="document">Document</option>
                  <option value="dashboard">Dashboard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Add to Decks (Optional)</label>
                <select
                  multiple
                  value={sceneForm.deckIds}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setSceneForm({ ...sceneForm, deckIds: selectedOptions });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name} ({deck.type})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Hold Ctrl/Cmd to select multiple decks
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateScene}
                disabled={!sceneForm.name || scenesLoading}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {scenesLoading ? 'Creating...' : 'Create Scene'}
              </button>
              <button
                onClick={() => setShowCreateScene(false)}
                className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Scene Modal */}
      {showEditScene && editingScene && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Scene: {editingScene.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={sceneForm.name}
                  onChange={(e) => setSceneForm({ ...sceneForm, name: e.target.value })}
                  onBlur={handleNameBlur}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Enter scene name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={sceneForm.slug}
                  onChange={(e) => setSceneForm({ ...sceneForm, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="URL-friendly identifier"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL-friendly identifier (auto-generated from name)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={sceneForm.description}
                  onChange={(e) => setSceneForm({ ...sceneForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Enter scene description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={sceneForm.type}
                  onChange={(e) => setSceneForm({ ...sceneForm, type: e.target.value as SceneType })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="graph">Graph</option>
                  <option value="card">Card</option>
                  <option value="document">Document</option>
                  <option value="dashboard">Dashboard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Add to Decks (Optional)</label>
                <select
                  multiple
                  value={sceneForm.deckIds}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setSceneForm({ ...sceneForm, deckIds: selectedOptions });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name} ({deck.type})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Hold Ctrl/Cmd to select multiple decks
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateScene}
                disabled={!sceneForm.name || scenesLoading}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {scenesLoading ? 'Updating...' : 'Update Scene'}
              </button>
              <button
                onClick={() => {
                  setShowEditScene(false);
                  setEditingScene(null);
                  setSceneForm({
                    name: '',
                    slug: '',
                    description: '',
                    type: 'graph',
                    deckIds: [],
                  });
                }}
                className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deck Selection Modal */}
      <SelectionModal
        isOpen={showDeckSelection}
        onClose={() => setShowDeckSelection(false)}
        onConfirm={handleDeckSelection}
        title="Select Decks"
        items={convertDecksToSelectableItems()}
        selectedItems={[]}
        multiSelect={true}
        searchPlaceholder="Search decks..."
        emptyMessage="No decks available"
        confirmText="Select Decks"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={cancelDeleteScene}
        onConfirm={confirmDeleteScene}
        title="Delete Scene"
        message={`Are you sure you want to delete "${deleteConfirmation.sceneName}"? This action cannot be undone.`}
        confirmText="Delete Scene"
        cancelText="Cancel"
        variant="destructive"
        isLoading={scenesLoading}
      />

    </div>
  );
};
