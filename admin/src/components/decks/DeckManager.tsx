import React, { useState, useEffect } from 'react';
import { useDeckStore, Deck } from '../../stores/deckStore';
import { DeckType, SceneType } from '../../stores/deckStore';
import { performanceManager } from '../../services/PerformanceManager';

// Deck type icons
const DeckTypeIcon: React.FC<{ type: DeckType }> = ({ type }) => {
  const icons = {
    graph: '📊',
    card: '🃏',
    document: '📄',
    dashboard: '📈',
  };
  
  return <span className="text-2xl">{icons[type]}</span>;
};

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

// Deck Manager Component
export const DeckManager: React.FC = () => {
  const {
    decks,
    scenes,
    currentDeck,
    decksLoading,
    scenesLoading,
    decksError,
    scenesError,
    setCurrentDeck,
    createDeck,
    deleteDeck,
    createScene,
    deleteScene,
    setDecksLoading,
    setScenesLoading,
    setDecksError,
    setScenesError,
  } = useDeckStore();

  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showCreateScene, setShowCreateScene] = useState(false);
  // const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  // const [editingScene, setEditingScene] = useState<Scene | null>(null);

  // Form states
  const [deckForm, setDeckForm] = useState({
    name: '',
    description: '',
    type: 'graph' as DeckType,
    keepWarm: true,
    preloadStrategy: 'proximity' as const,
  });

  const [sceneForm, setSceneForm] = useState({
    name: '',
    description: '',
    type: 'graph' as SceneType,
    deckId: '',
  });

  // Initialize performance manager
  useEffect(() => {
    performanceManager.initialize();
    return () => performanceManager.destroy();
  }, []);

  // Handle deck creation
  const handleCreateDeck = async () => {
    try {
      setDecksLoading(true);
      setDecksError(null);

      const newDeck = {
        name: deckForm.name,
        description: deckForm.description,
        type: deckForm.type,
        scenes: [],
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
        description: '',
        type: 'graph',
        keepWarm: true,
        preloadStrategy: 'proximity',
      });
      setShowCreateDeck(false);
      
      console.log('Deck created successfully');
    } catch (error) {
      setDecksError(error instanceof Error ? error.message : 'Failed to create deck');
    } finally {
      setDecksLoading(false);
    }
  };

  // Handle scene creation
  const handleCreateScene = async () => {
    try {
      setScenesLoading(true);
      setScenesError(null);

      const newScene = {
        name: sceneForm.name,
        description: sceneForm.description,
        type: sceneForm.type,
        deckId: sceneForm.deckId || undefined,
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
        description: '',
        type: 'graph',
        deckId: '',
      });
      setShowCreateScene(false);
      
      console.log('Scene created successfully');
    } catch (error) {
      setScenesError(error instanceof Error ? error.message : 'Failed to create scene');
    } finally {
      setScenesLoading(false);
    }
  };

  // Handle deck selection
  const handleDeckSelect = (deck: Deck) => {
    setSelectedDeckId(deck.id);
    setCurrentDeck(deck);
    
    // Preload deck scenes if configured
    if (deck.performance.keepWarm) {
      performanceManager.preloadDeck(deck);
    }
  };

  // Handle deck deletion
  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDeck(deckId);
      if (selectedDeckId === deckId) {
        setSelectedDeckId(null);
        setCurrentDeck(null);
      }
    } catch (error) {
      console.error('Failed to delete deck:', error);
    }
  };

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

  // Get scenes for a specific deck
  const getDeckScenes = (deckId: string) => {
    return scenes.filter(scene => scene.deckId === deckId);
  };

  // Get standalone scenes (not in any deck)
  // const getStandaloneScenes = () => {
  //   return scenes.filter(scene => !scene.deckId);
  // };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Deck Management</h1>
        <p className="text-muted-foreground">
          Create and manage presentation decks with different scene types and performance optimizations
        </p>
      </div>

      {/* Error Display */}
      {(decksError || scenesError) && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          {decksError && <p className="text-destructive">{decksError}</p>}
          {scenesError && <p className="text-destructive">{scenesError}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Deck List */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Decks</h2>
              <button
                onClick={() => setShowCreateDeck(true)}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                + New Deck
              </button>
            </div>

            {decksLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading decks...</div>
            ) : decks.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No decks created yet</div>
            ) : (
              <div className="space-y-2">
                {decks.map((deck) => (
                  <div
                    key={deck.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDeckId === deck.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() => handleDeckSelect(deck)}
                  >
                    <div className="flex items-center space-x-3">
                      <DeckTypeIcon type={deck.type} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{deck.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {deck.scenes.length} scenes
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Deck Details & Scenes */}
        <div className="lg:col-span-2">
          {selectedDeckId ? (
            <div className="space-y-6">
              {/* Deck Details */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <DeckTypeIcon type={currentDeck!.type} />
                    <div>
                      <h2 className="text-xl font-semibold">{currentDeck!.name}</h2>
                      <p className="text-muted-foreground">{currentDeck!.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                                          <button
                        onClick={() => console.log('Edit deck:', currentDeck!.id)}
                        className="px-3 py-1 border border-border rounded-md text-sm hover:bg-muted transition-colors"
                      >
                        Edit
                      </button>
                    <button
                      onClick={() => handleDeleteDeck(currentDeck!.id)}
                      className="px-3 py-1 border border-destructive/20 text-destructive rounded-md text-sm hover:bg-destructive/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium">{currentDeck!.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Scenes:</span>
                    <span className="ml-2 font-medium">{currentDeck!.scenes.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Keep Warm:</span>
                    <span className="ml-2 font-medium">
                      {currentDeck!.performance.keepWarm ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Preload:</span>
                    <span className="ml-2 font-medium">
                      {currentDeck!.performance.preloadStrategy}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scenes List */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Scenes</h3>
                  <button
                    onClick={() => setShowCreateScene(true)}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
                  >
                    + New Scene
                  </button>
                </div>

                {scenesLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading scenes...</div>
                ) : getDeckScenes(selectedDeckId).length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No scenes in this deck</div>
                ) : (
                  <div className="space-y-2">
                    {getDeckScenes(selectedDeckId).map((scene) => (
                      <div
                        key={scene.id}
                        className="p-3 border border-border rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <SceneTypeBadge type={scene.type} />
                          <div>
                            <h4 className="font-medium">{scene.name}</h4>
                            <p className="text-sm text-muted-foreground">{scene.description}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => console.log('Edit scene:', scene.id)}
                            className="px-2 py-1 text-xs border border-border rounded hover:bg-muted transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteScene(scene.id)}
                            className="px-2 py-1 text-xs border border-destructive/20 text-destructive rounded hover:bg-destructive/10 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Select a Deck</h3>
              <p className="text-muted-foreground">
                Choose a deck from the left panel to view its details and manage scenes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Deck Modal */}
      {showCreateDeck && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Deck</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={deckForm.name}
                  onChange={(e) => setDeckForm({ ...deckForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Enter deck name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={deckForm.description}
                  onChange={(e) => setDeckForm({ ...deckForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Enter deck description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={deckForm.type}
                  onChange={(e) => setDeckForm({ ...deckForm, type: e.target.value as DeckType })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="graph">Graph</option>
                  <option value="card">Card</option>
                  <option value="document">Document</option>
                  <option value="dashboard">Dashboard</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="keepWarm"
                  checked={deckForm.keepWarm}
                  onChange={(e) => setDeckForm({ ...deckForm, keepWarm: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="keepWarm" className="text-sm">Keep scenes warm in memory</label>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Preload Strategy</label>
                <select
                  value={deckForm.preloadStrategy}
                  onChange={(e) => setDeckForm({ ...deckForm, preloadStrategy: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="immediate">Immediate</option>
                  <option value="proximity">Proximity</option>
                  <option value="on-demand">On Demand</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateDeck}
                disabled={!deckForm.name || decksLoading}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {decksLoading ? 'Creating...' : 'Create Deck'}
              </button>
              <button
                onClick={() => setShowCreateDeck(false)}
                className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Enter scene name"
                />
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
                <label className="block text-sm font-medium mb-1">Deck (Optional)</label>
                <select
                  value={sceneForm.deckId}
                  onChange={(e) => setSceneForm({ ...sceneForm, deckId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="">Standalone Scene</option>
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}
                    </option>
                  ))}
                </select>
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
    </div>
  );
};
