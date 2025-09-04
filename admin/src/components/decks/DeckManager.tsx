import React, { useState, useEffect } from 'react';
import { useDeckStore, Deck } from '../../stores/deckStore';
import { DeckType, SceneType } from '../../stores/deckStore';
import { performanceManager } from '../../services/PerformanceManager';

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

// Scene and Deck Manager Component
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
  const [showCreateScene, setShowCreateScene] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showCreateContext, setShowCreateContext] = useState(false);
  const [activeTab, setActiveTab] = useState<'scenes' | 'decks' | 'contexts'>('scenes');

  // Form states
  const [sceneForm, setSceneForm] = useState({
    name: '',
    description: '',
    type: 'graph' as SceneType,
    deckIds: [] as string[],
  });

  const [deckForm, setDeckForm] = useState({
    name: '',
    description: '',
    type: 'graph' as DeckType,
    keepWarm: true,
    preloadStrategy: 'proximity' as const,
  });

  // Initialize performance manager
  useEffect(() => {
    performanceManager.initialize();
    return () => performanceManager.destroy();
  }, []);

  // Handle scene creation
  const handleCreateScene = async () => {
    try {
      setScenesLoading(true);
      setScenesError(null);

      const newScene = {
        name: sceneForm.name,
        slug: sceneForm.name.toLowerCase().replace(/\s+/g, '-'),
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

  // Handle deck creation
  const handleCreateDeck = async () => {
    try {
      setDecksLoading(true);
      setDecksError(null);

      const newDeck = {
        name: deckForm.name,
        slug: deckForm.name.toLowerCase().replace(/\s+/g, '-'),
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
        description: '',
        type: 'graph',
        keepWarm: true,
        preloadStrategy: 'proximity',
      });
      setShowCreateDeck(false);
      
      // Deck created successfully
    } catch (error) {
      setDecksError(error instanceof Error ? error.message : 'Failed to create deck');
    } finally {
      setDecksLoading(false);
    }
  };

  // Handle deck selection
  const handleDeckSelect = (deck: Deck) => {
    setSelectedDeckId(deck.id);
    setCurrentDeck(deck);
    
    // Preload deck scenes if configured
    if (deck.performance.keepWarm) {
      performanceManager.preloadDeck(deck, scenes);
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
    return scenes.filter(scene => scene.deckIds.includes(deckId));
  };

  // Get standalone scenes (not in any deck)
  const getStandaloneScenes = () => {
    return scenes.filter(scene => scene.deckIds.length === 0);
  };

  // Get all decks that contain a specific scene
  const getSceneDecks = (sceneId: string) => {
    return decks.filter(deck => deck.sceneIds.includes(sceneId));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Scene & Deck Management</h1>
        <p className="text-muted-foreground">
          Create and manage scenes as primary content units, then organize them into presentation decks
        </p>
      </div>

      {/* Error Display */}
      {(decksError || scenesError) && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          {decksError && <p className="text-destructive">{decksError}</p>}
          {scenesError && <p className="text-destructive">{scenesError}</p>}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('scenes')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'scenes'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Scenes ({scenes.length})
        </button>
        <button
          onClick={() => setActiveTab('decks')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'decks'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Decks ({decks.length})
        </button>
        <button
          onClick={() => setActiveTab('contexts')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'contexts'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Contexts
        </button>
      </div>

      {/* Scenes Tab */}
      {activeTab === 'scenes' && (
        <div className="space-y-6">
          {/* Scenes Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Scenes</h2>
              <p className="text-muted-foreground">Primary content units that can be organized into decks</p>
            </div>
            <button
              onClick={() => setShowCreateScene(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              + New Scene
            </button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenes.map((scene) => {
                const sceneDecks = getSceneDecks(scene.id);
                return (
                  <div
                    key={scene.id}
                    className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <SceneTypeBadge type={scene.type} />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {/* TODO: Implement scene editing */}}
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
                    
                    <h3 className="font-semibold mb-2">{scene.name}</h3>
                    {scene.description && (
                      <p className="text-sm text-muted-foreground mb-4">{scene.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Type:</span> {scene.type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Status:</span> {scene.is_active ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">In Decks:</span> {sceneDecks.length}
                      </div>
                    </div>
                    
                    {sceneDecks.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-2">Part of:</div>
                        <div className="flex flex-wrap gap-1">
                          {sceneDecks.map(deck => (
                            <span
                              key={deck.id}
                              className="px-2 py-1 text-xs bg-muted rounded border"
                            >
                              {deck.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Decks Tab */}
      {activeTab === 'decks' && (
        <div className="space-y-6">
          {/* Decks Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Decks</h2>
              <p className="text-muted-foreground">Organize scenes into presentation groups</p>
            </div>
            <button
              onClick={() => setShowCreateDeck(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              + New Deck
            </button>
          </div>

          {/* Decks Grid */}
          {decksLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading decks...</div>
          ) : decks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">No Decks Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a deck to organize your scenes
              </p>
              <button
                onClick={() => setShowCreateDeck(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Create First Deck
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => {
                const deckScenes = getDeckScenes(deck.id);
                return (
                  <div
                    key={deck.id}
                    className={`p-6 border rounded-lg cursor-pointer transition-colors ${
                      selectedDeckId === deck.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() => handleDeckSelect(deck)}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <DeckTypeIcon type={deck.type} />
                      <div className="flex-1">
                        <h3 className="font-semibold">{deck.name}</h3>
                        <p className="text-sm text-muted-foreground">{deck.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium">{deck.type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Scenes:</span>
                        <span className="ml-2 font-medium">{deckScenes.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Keep Warm:</span>
                        <span className="ml-2 font-medium">
                          {deck.performance.keepWarm ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {deck.performance.preloadStrategy} preload
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDeck(deck.id);
                          }}
                          className="px-2 py-1 text-xs border border-destructive/20 text-destructive rounded hover:bg-destructive/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Deck Details */}
          {selectedDeckId && currentDeck && (
            <div className="mt-8 p-6 border border-border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <DeckTypeIcon type={currentDeck.type} />
                  <div>
                    <h3 className="text-lg font-semibold">{currentDeck.name}</h3>
                    <p className="text-muted-foreground">{currentDeck.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium">{currentDeck.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Scenes:</span>
                  <span className="ml-2 font-medium">{getDeckScenes(selectedDeckId).length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Keep Warm:</span>
                  <span className="ml-2 font-medium">
                    {currentDeck.performance.keepWarm ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Preload:</span>
                  <span className="ml-2 font-medium">
                    {currentDeck.performance.preloadStrategy}
                  </span>
                </div>
              </div>

              {/* Deck Scenes */}
              <div>
                <h4 className="font-medium mb-3">Scenes in this Deck</h4>
                {getDeckScenes(selectedDeckId).length === 0 ? (
                  <p className="text-muted-foreground text-sm">No scenes in this deck yet</p>
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
                            <h5 className="font-medium">{scene.name}</h5>
                            <p className="text-sm text-muted-foreground">{scene.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteScene(scene.id)}
                          className="px-2 py-1 text-xs border border-destructive/20 text-destructive rounded hover:bg-destructive/10 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contexts Tab */}
      {activeTab === 'contexts' && (
        <div className="space-y-6">
          {/* Contexts Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Contexts</h2>
              <p className="text-muted-foreground">Anchors and coordinates within scenes, documents, and other content</p>
            </div>
            <button
              onClick={() => setShowCreateContext(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              + New Context
            </button>
          </div>

          {/* Contexts Content */}
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Contexts Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              The Context system will allow you to create anchors and coordinates within your content
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Scene coordinates for graph navigation</p>
              <p>• Document anchors for text references</p>
              <p>• Deck positions for presentation flow</p>
              <p>• Custom coordinate systems</p>
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
    </div>
  );
};
