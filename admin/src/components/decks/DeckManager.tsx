import React, { useState, useEffect, useRef } from 'react';
import { useDeckStore, Deck } from '../../stores/deckStore';
import { DeckType } from '../../stores/deckStore';
import { performanceManager } from '../../services/PerformanceManager';
import { Plus, SlidersHorizontal, Grid, List } from 'lucide-react';

// Simple scene type badge for deck manager
const SceneTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const colors = {
    graph: 'bg-blue-100 text-blue-800',
    card: 'bg-green-100 text-green-800',
    document: 'bg-purple-100 text-purple-800',
    dashboard: 'bg-orange-100 text-orange-800',
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
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

// Deck Manager Component
export const DeckManager: React.FC = () => {
  const {
    decks,
    scenes,
    currentDeck,
    decksLoading,
    decksError,
    setCurrentDeck,
    createDeck,
    deleteDeck,
    setDecksLoading,
    setDecksError,
  } = useDeckStore();

  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showListOptions, setShowListOptions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const listOptionsRef = useRef<HTMLDivElement>(null);

  const [deckForm, setDeckForm] = useState({
    name: '',
    slug: '',
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

  // Auto-generate slug when deck name field loses focus (on blur)
  const handleDeckNameBlur = () => {
    if (deckForm.name && !deckForm.slug) {
      const slug = deckForm.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setDeckForm(prev => ({ ...prev, slug }));
    }
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

  // Get scenes for a specific deck
  const getDeckScenes = (deckId: string) => {
    return scenes.filter(scene => scene.deckIds.includes(deckId));
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
          {decks.map((deck) => (
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
                  <span className="ml-2 font-medium">{getDeckScenes(deck.id).length}</span>
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
                  <div className="flex space-x-2">
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
            </div>
          ))}
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
                    <span className="text-xs text-muted-foreground">
                      View in Scene Manager
                    </span>
                  </div>
                ))}
              </div>
            )}
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
                  onBlur={handleDeckNameBlur}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Enter deck name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={deckForm.slug}
                  onChange={(e) => setDeckForm({ ...deckForm, slug: e.target.value })}
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

export default DeckManager;