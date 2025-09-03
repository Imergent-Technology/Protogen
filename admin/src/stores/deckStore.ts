import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Deck types based on presentation requirements
export type DeckType = 'graph' | 'card' | 'document' | 'dashboard';

// Scene types that can exist within decks or independently
export type SceneType = 'graph' | 'card' | 'document' | 'dashboard';

// Toolset requirements for each deck type
export interface ToolsetRequirements {
  libraries: string[];
  preload: boolean;
  keepWarm: boolean;
}

// Scene content structure
export interface SceneContent {
  data: any;
  metadata: Record<string, any>;
  layout?: any;
}

// Scene interface - Primary content unit
export interface Scene {
  id: string;
  guid: string;
  name: string;
  slug: string; // URL-friendly identifier
  description?: string;
  type: SceneType;
  deckIds: string[]; // Can belong to multiple decks (optional)
  content: SceneContent;
  toolset: ToolsetRequirements;
  is_active: boolean;
  is_public: boolean;
  creator_id?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// Deck interface for grouping related scenes
export interface Deck {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier
  description?: string;
  type: DeckType;
  sceneIds: string[]; // References to scene IDs
  navigation: DeckNavigation;
  performance: {
    keepWarm: boolean;
    preloadStrategy: 'immediate' | 'proximity' | 'on-demand';
  };
  created_at: string;
  updated_at: string;
}

// Navigation patterns for different deck types
export interface DeckNavigation {
  type: 'sequential' | 'hierarchical' | 'network' | 'freeform';
  transitions?: {
    type: 'slide' | 'fade' | 'morph' | 'instant';
    duration: number;
  };
  controls?: {
    showProgress: boolean;
    allowRandomAccess: boolean;
    keyboardNavigation: boolean;
  };
}

// Deck store state
interface DeckState {
  // Data
  decks: Deck[];
  scenes: Scene[];
  currentDeck: Deck | null;
  currentScene: Scene | null;
  
  // Loading states
  decksLoading: boolean;
  scenesLoading: boolean;
  
  // Error states
  decksError: string | null;
  scenesError: string | null;
  
  // Performance management
  warmScenes: Set<string>; // Scene IDs that are kept warm in memory
  loadedToolsets: Set<DeckType>; // Which toolsets are currently loaded
  
  // Actions
  setDecks: (decks: Deck[]) => void;
  setScenes: (scenes: Scene[]) => void;
  setCurrentDeck: (deck: Deck | null) => void;
  setCurrentScene: (scene: Scene | null) => void;
  
  // Deck management
  createDeck: (deck: Omit<Deck, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDeck: (id: string, updates: Partial<Deck>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  
  // Scene management
  createScene: (scene: Omit<Scene, 'id' | 'guid' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateScene: (id: string, updates: Partial<Scene>) => Promise<void>;
  deleteScene: (id: string) => Promise<void>;
  
  // Performance management
  warmScene: (sceneId: string) => void;
  unwarmScene: (sceneId: string) => void;
  loadToolset: (deckType: DeckType) => Promise<void>;
  unloadToolset: (deckType: DeckType) => Promise<void>;
  
  // Loading states
  setDecksLoading: (loading: boolean) => void;
  setScenesLoading: (loading: boolean) => void;
  
  // Error handling
  setDecksError: (error: string | null) => void;
  setScenesError: (error: string | null) => void;
}

// Helper function to convert name to kebab-case slug
const toKebabCase = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Helper function to generate unique slug
const generateUniqueSlug = (name: string, existingSlugs: string[], baseSlug?: string): string => {
  const base = baseSlug || toKebabCase(name);
  let slug = base;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  
  return slug;
};

// Create the deck store
export const useDeckStore = create<DeckState>()(
  devtools(
    (set, _get) => ({
      // Initial state
      decks: [],
      scenes: [],
      currentDeck: null,
      currentScene: null,
      decksLoading: false,
      scenesLoading: false,
      decksError: null,
      scenesError: null,
      warmScenes: new Set(),
      loadedToolsets: new Set(),
      
      // Basic setters
      setDecks: (decks) => set({ decks }),
      setScenes: (scenes) => set({ scenes }),
      setCurrentDeck: (deck) => set({ currentDeck: deck }),
      setCurrentScene: (scene) => set({ currentScene: scene }),
      
      // Deck management actions
      createDeck: async (deckData) => {
        // TODO: Implement API call
        const existingSlugs = _get().decks.map(deck => deck.slug);
        const slug = generateUniqueSlug(deckData.name, existingSlugs);
        
        const newDeck: Deck = {
          ...deckData,
          slug,
          id: self.crypto.randomUUID ? self.crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        set((state) => ({
          decks: [...state.decks, newDeck]
        }));
      },
      
      updateDeck: async (id, updates) => {
        // TODO: Implement API call
        set((state) => {
          const deck = state.decks.find(d => d.id === id);
          if (!deck) return state;
          
          // Handle slug updates when name changes
          let newSlug = deck.slug;
          if (updates.name && updates.name !== deck.name) {
            const existingSlugs = state.decks.filter(d => d.id !== id).map(d => d.slug);
            newSlug = generateUniqueSlug(updates.name, existingSlugs);
          }
          
          return {
            decks: state.decks.map(deck =>
              deck.id === id
                ? { ...deck, ...updates, slug: newSlug, updated_at: new Date().toISOString() }
                : deck
            )
          };
        });
      },
      
      deleteDeck: async (id) => {
        // TODO: Implement API call
        set((state) => ({
          decks: state.decks.filter(deck => deck.id !== id)
        }));
      },
      
      // Scene management actions
      createScene: async (sceneData) => {
        // TODO: Implement API call
        const existingSlugs = _get().scenes.map(scene => scene.slug);
        const slug = generateUniqueSlug(sceneData.name, existingSlugs);
        
        const newScene: Scene = {
          ...sceneData,
          slug,
          id: self.crypto.randomUUID ? self.crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2),
          guid: self.crypto.randomUUID ? self.crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        set((state) => ({
          scenes: [...state.scenes, newScene]
        }));
      },
      
      updateScene: async (id, updates) => {
        // TODO: Implement API call
        set((state) => {
          const scene = state.scenes.find(s => s.id === id);
          if (!scene) return state;
          
          // Handle slug updates when name changes
          let newSlug = scene.slug;
          if (updates.name && updates.name !== scene.name) {
            const existingSlugs = state.scenes.filter(s => s.id !== id).map(s => s.slug);
            newSlug = generateUniqueSlug(updates.name, existingSlugs);
          }
          
          return {
            scenes: state.scenes.map(scene =>
              scene.id === id
                ? { ...scene, ...updates, slug: newSlug, updated_at: new Date().toISOString() }
                : scene
            )
          };
        });
      },
      
      deleteScene: async (id) => {
        // TODO: Implement API call
        set((state) => ({
          scenes: state.scenes.filter(scene => scene.id !== id)
        }));
      },
      
      // Performance management
      warmScene: (sceneId) => {
        set((state) => ({
          warmScenes: new Set([...state.warmScenes, sceneId])
        }));
      },
      
      unwarmScene: (sceneId) => {
        set((state) => {
          const newWarmScenes = new Set(state.warmScenes);
          newWarmScenes.delete(sceneId);
          return { warmScenes: newWarmScenes };
        });
      },
      
      loadToolset: async (deckType) => {
        // TODO: Implement dynamic toolset loading
        set((state) => ({
          loadedToolsets: new Set([...state.loadedToolsets, deckType])
        }));
      },
      
      unloadToolset: async (deckType) => {
        // TODO: Implement toolset unloading
        set((state) => {
          const newLoadedToolsets = new Set(state.loadedToolsets);
          newLoadedToolsets.delete(deckType);
          return { loadedToolsets: newLoadedToolsets };
        });
      },
      
      // Loading states
      setDecksLoading: (loading) => set({ decksLoading: loading }),
      setScenesLoading: (loading) => set({ scenesLoading: loading }),
      
      // Error handling
      setDecksError: (error) => set({ decksError: error }),
      setScenesError: (error) => set({ scenesError: error }),
    }),
    {
      name: 'deck-store',
    }
  )
);
