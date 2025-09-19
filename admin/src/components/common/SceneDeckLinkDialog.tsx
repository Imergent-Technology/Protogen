import { useState, useEffect } from 'react';
import { Button } from '@protogen/shared';
import { Modal } from './Modal';
import { Search, Link as LinkIcon, Layers } from 'lucide-react';
import { Scene, Deck } from '../../stores/deckStore';

interface SceneDeckLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (linkData: {
    sceneId: string;
    deckId: string;
    action: 'add' | 'remove';
  }) => void;
  scenes: Scene[];
  decks: Deck[];
  currentScene?: Scene | null;
  currentDeck?: Deck | null;
  mode: 'scene-to-deck' | 'deck-to-scene';
}

export function SceneDeckLinkDialog({
  isOpen,
  onClose,
  onLink,
  scenes,
  decks,
  currentScene,
  currentDeck,
  mode
}: SceneDeckLinkDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  // Filter scenes based on search query
  const filteredScenes = scenes.filter(scene => 
    scene.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scene.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter decks based on search query
  const filteredDecks = decks.filter(deck => 
    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initialize selection based on mode and current entities
  useEffect(() => {
    if (mode === 'scene-to-deck' && currentScene) {
      setSelectedScene(currentScene);
      setSelectedDeck(null);
    } else if (mode === 'deck-to-scene' && currentDeck) {
      setSelectedDeck(currentDeck);
      setSelectedScene(null);
    }
    setSearchQuery('');
  }, [mode, currentScene, currentDeck, isOpen]);

  const handleLink = () => {
    if (mode === 'scene-to-deck' && selectedScene && selectedDeck) {
      // Check if scene is already linked to this deck
      const isAlreadyLinked = selectedDeck.sceneIds && selectedDeck.sceneIds.includes(selectedScene.id);
      onLink({
        sceneId: selectedScene.id,
        deckId: selectedDeck.id,
        action: isAlreadyLinked ? 'remove' : 'add'
      });
    } else if (mode === 'deck-to-scene' && selectedDeck && selectedScene) {
      // Check if scene is already linked to this deck
      const isAlreadyLinked = selectedDeck.sceneIds && selectedDeck.sceneIds.includes(selectedScene.id);
      onLink({
        sceneId: selectedScene.id,
        deckId: selectedDeck.id,
        action: isAlreadyLinked ? 'remove' : 'add'
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedScene(null);
    setSelectedDeck(null);
    onClose();
  };

  const getSceneTypeIcon = (type: string) => {
    switch (type) {
      case 'basic': return '📝';
      case 'document': return '📄';
      case 'graph': return '🔗';
      case 'table': return '📊';
      case 'custom': return '⚙️';
      default: return '📄';
    }
  };

  const getDeckTypeIcon = (type: string) => {
    switch (type) {
      case 'basic': return '📝';
      case 'document': return '📄';
      case 'graph': return '🔗';
      case 'table': return '📊';
      case 'hybrid': return '🔀';
      default: return '🃏';
    }
  };

  // Determine if we can create a link
  const canCreateLink = mode === 'scene-to-deck' 
    ? selectedScene && selectedDeck
    : selectedDeck && selectedScene;

  // Determine the action text
  const getActionText = () => {
    if (mode === 'scene-to-deck' && selectedScene && selectedDeck) {
      const isAlreadyLinked = selectedDeck.sceneIds && selectedDeck.sceneIds.includes(selectedScene.id);
      return isAlreadyLinked ? 'Remove from Deck' : 'Add to Deck';
    } else if (mode === 'deck-to-scene' && selectedDeck && selectedScene) {
      const isAlreadyLinked = selectedDeck.sceneIds && selectedDeck.sceneIds.includes(selectedScene.id);
      return isAlreadyLinked ? 'Remove from Deck' : 'Add to Deck';
    }
    return 'Link';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'scene-to-deck' ? 'Link Scene to Deck' : 'Link Deck to Scene'}
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Current Selection Display */}
        {mode === 'scene-to-deck' && selectedScene && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">{getSceneTypeIcon(selectedScene.type)}</span>
              <div className="flex-1">
                <div className="font-medium text-primary">{selectedScene.name}</div>
                {selectedScene.description && (
                  <div className="text-sm text-muted-foreground">{selectedScene.description}</div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">Scene</span>
            </div>
          </div>
        )}

        {mode === 'deck-to-scene' && selectedDeck && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">{getDeckTypeIcon(selectedDeck.type)}</span>
              <div className="flex-1">
                <div className="font-medium text-primary">{selectedDeck.name}</div>
                {selectedDeck.description && (
                  <div className="text-sm text-muted-foreground">{selectedDeck.description}</div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">Deck</span>
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {mode === 'scene-to-deck' ? 'Select Target Deck' : 'Select Target Scene'}
          </label>
          
          {/* Selected Target Display */}
          {mode === 'scene-to-deck' && selectedDeck && (
            <div className="p-3 bg-muted/50 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getDeckTypeIcon(selectedDeck.type)}</span>
                <div className="flex-1">
                  <div className="font-medium">{selectedDeck.name}</div>
                  {selectedDeck.description && (
                    <div className="text-sm text-muted-foreground">{selectedDeck.description}</div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDeck(null)}
                  className="text-muted-foreground hover:text-foreground"
                  title="Clear selection"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {mode === 'deck-to-scene' && selectedScene && (
            <div className="p-3 bg-muted/50 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getSceneTypeIcon(selectedScene.type)}</span>
                <div className="flex-1">
                  <div className="font-medium">{selectedScene.name}</div>
                  {selectedScene.description && (
                    <div className="text-sm text-muted-foreground">{selectedScene.description}</div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedScene(null)}
                  className="text-muted-foreground hover:text-foreground"
                  title="Clear selection"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                mode === 'scene-to-deck' 
                  ? (selectedDeck ? "Search for a different deck..." : "Search decks by name or description...")
                  : (selectedScene ? "Search for a different scene..." : "Search scenes by name or description...")
              }
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
          {mode === 'scene-to-deck' ? (
            filteredDecks.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? 'No decks found matching your search.' : 'No decks available.'}
              </div>
            ) : (
              filteredDecks.map((deck) => {
                const isAlreadyLinked = selectedScene && deck.sceneIds && deck.sceneIds.includes(selectedScene.id);
                return (
                  <button
                    key={deck.id}
                    onClick={() => setSelectedDeck(deck)}
                    className={`w-full p-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 ${
                      selectedDeck?.id === deck.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    } ${isAlreadyLinked ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getDeckTypeIcon(deck.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate flex items-center gap-2">
                          {deck.name}
                          {isAlreadyLinked && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                              Already Linked
                            </span>
                          )}
                        </div>
                        {deck.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {deck.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )
          ) : (
            filteredScenes.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? 'No scenes found matching your search.' : 'No scenes available.'}
              </div>
            ) : (
              filteredScenes.map((scene) => {
                const isAlreadyLinked = selectedDeck && selectedDeck.sceneIds && selectedDeck.sceneIds.includes(scene.id);
                return (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedScene(scene)}
                    className={`w-full p-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 ${
                      selectedScene?.id === scene.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    } ${isAlreadyLinked ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getSceneTypeIcon(scene.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate flex items-center gap-2">
                          {scene.name}
                          {isAlreadyLinked && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                              Already Linked
                            </span>
                          )}
                        </div>
                        {scene.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {scene.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleLink}
            disabled={!canCreateLink}
            className="flex items-center gap-2"
          >
            <LinkIcon className="h-4 w-4" />
            {getActionText()}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
