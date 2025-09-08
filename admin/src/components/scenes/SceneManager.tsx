import React, { useState, useEffect } from 'react';
import { useDeckStore, Scene } from '../../stores/deckStore';
import { SceneType } from '../../stores/deckStore';
import { performanceManager } from '../../services/PerformanceManager';
import SceneGrid from './SceneGrid';
import { SceneCardData } from './SceneCard';
import { SelectionModal, SelectableItem } from '../common';

// Scene type badges
const SceneTypeBadge: React.FC<{ type: SceneType }> = ({ type }) => {
  const colors = {
    graph: 'bg-blue-100 text-blue-800',
    card: 'bg-green-100 text-green-800',
    document: 'bg-purple-100 text-purple-800',
    dashboard: 'bg-orange-100 text-orange-800',
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type]}`}>
      {type}
    </span>
  );
};

// Remove DeckTypeIcon - no longer needed in pure scene manager

// Scene and Deck Manager Component
export const SceneManager: React.FC = () => {
  const {
    decks,
    scenes,
    scenesLoading,
    scenesError,
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

  // Initialize performance manager
  useEffect(() => {
    performanceManager.initialize();
    return () => performanceManager.destroy();
  }, []);

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
    if (!confirm('Are you sure you want to delete this scene? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteScene(sceneId);
    } catch (error) {
      console.error('Failed to delete scene:', error);
    }
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Scene Management</h1>
        <p className="text-muted-foreground">
          Create and manage scenes as primary content units, then organize them into presentation decks
        </p>
      </div>

      {/* Error Display */}
      {scenesError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive">{scenesError}</p>
        </div>
      )}

      {/* Scenes Management */}
        <div className="space-y-6">
          {/* Scenes Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Scenes</h2>
              <p className="text-muted-foreground">Primary content units that can be organized into decks</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeckSelection(true)}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Select Decks
              </button>
              <button
                onClick={() => setShowCreateScene(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                + New Scene
              </button>
            </div>
          </div>

          {/* Scenes Grid */}
          {scenesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading scenes...</div>
          ) : scenes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-lg font-semibold mb-2">No Scenes Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first scene to get started
              </p>
              <button
                onClick={() => setShowCreateScene(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Create First Scene
              </button>
            </div>
          ) : (
            <SceneGrid
              scenes={scenes.map(convertToSceneCardData)}
              onSceneEdit={handleSceneCardEdit}
              onSceneDelete={handleSceneCardDelete}
              onScenePreview={handleSceneCardPreview}
              onSceneToggleActive={handleSceneCardToggleActive}
              onSceneTogglePublic={handleSceneCardTogglePublic}
            />
          )}
        </div>

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

    </div>
  );
};
