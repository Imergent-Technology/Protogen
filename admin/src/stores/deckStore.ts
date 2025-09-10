import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SceneCardData } from '../components/scenes/SceneCard';

// Deck types based on presentation requirements
export type DeckType = 'graph' | 'card' | 'document' | 'dashboard' | 'hybrid';

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
  evaluateDeckType: (deckId: string) => Promise<void>;
  
  // Scene management
  loadScenes: (forceReload?: boolean) => Promise<void>;
  refreshScenes: () => Promise<void>;
  createScene: (scene: Omit<Scene, 'id' | 'guid' | 'created_at' | 'updated_at'>) => Promise<SceneCardData>;
  updateScene: (id: string, updates: Partial<Scene>) => Promise<void>;
  deleteScene: (id: string) => Promise<void>;
  saveSceneContent: (sceneId: string, contentData: string, contentType?: string, contentKey?: string) => Promise<void>;
  loadSceneContent: (sceneId: string, contentType?: string, contentKey?: string) => Promise<string | null>;
  
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
        try {
          const response = await fetch('/api/decks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            },
            body: JSON.stringify({
              name: deckData.name,
              slug: deckData.slug,
              description: deckData.description,
              type: deckData.type,
              keep_warm: deckData.keep_warm,
              preload_strategy: deckData.preload_strategy,
              scene_ids: deckData.scene_ids || [],
              tags: deckData.tags || [],
              is_active: deckData.is_active !== false,
              is_public: deckData.is_public || false,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create deck');
          }

          const result = await response.json();
          const apiDeck = result.data;
          
          // Transform API response to match frontend interface
          const newDeck: Deck = {
            id: apiDeck.id,
            name: apiDeck.name,
            slug: apiDeck.slug,
            description: apiDeck.description,
            type: apiDeck.type,
            sceneIds: apiDeck.scene_ids || [],
            navigation: apiDeck.navigation || {
              type: 'sequential',
              transitions: { type: 'slide', duration: 300 },
              controls: { showProgress: true, allowRandomAccess: true, keyboardNavigation: true }
            },
            performance: {
              keepWarm: apiDeck.keep_warm || false,
              preloadStrategy: apiDeck.preload_strategy || 'proximity',
            },
            tags: apiDeck.tags || [],
            is_active: apiDeck.is_active,
            is_public: apiDeck.is_public,
            creator_id: apiDeck.creator_id,
            view_count: apiDeck.view_count || 0,
            last_viewed_at: apiDeck.last_viewed_at,
            created_at: apiDeck.created_at,
            updated_at: apiDeck.updated_at,
          };
          
          set((state) => ({
            decks: [...state.decks, newDeck]
          }));
        } catch (error) {
          console.error('Failed to create deck:', error);
          throw error;
        }
      },
      
      updateDeck: async (id, updates) => {
        try {
          const response = await fetch(`/api/decks/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            },
            body: JSON.stringify({
              name: updates.name,
              slug: updates.slug,
              description: updates.description,
              type: updates.type,
              keep_warm: updates.keep_warm,
              preload_strategy: updates.preload_strategy,
              scene_ids: updates.scene_ids,
              tags: updates.tags,
              is_active: updates.is_active,
              is_public: updates.is_public,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update deck');
          }

          const result = await response.json();
          const apiDeck = result.data;
          
          // Transform API response to match frontend interface
          const updatedDeck: Deck = {
            id: apiDeck.id,
            name: apiDeck.name,
            slug: apiDeck.slug,
            description: apiDeck.description,
            type: apiDeck.type,
            sceneIds: apiDeck.scene_ids || [],
            navigation: apiDeck.navigation || {
              type: 'sequential',
              transitions: { type: 'slide', duration: 300 },
              controls: { showProgress: true, allowRandomAccess: true, keyboardNavigation: true }
            },
            performance: {
              keepWarm: apiDeck.keep_warm || false,
              preloadStrategy: apiDeck.preload_strategy || 'proximity',
            },
            tags: apiDeck.tags || [],
            is_active: apiDeck.is_active,
            is_public: apiDeck.is_public,
            creator_id: apiDeck.creator_id,
            view_count: apiDeck.view_count || 0,
            last_viewed_at: apiDeck.last_viewed_at,
            created_at: apiDeck.created_at,
            updated_at: apiDeck.updated_at,
          };
          
          set((state) => ({
            decks: state.decks.map(deck =>
              deck.id === id ? updatedDeck : deck
            )
          }));
        } catch (error) {
          console.error('Failed to update deck:', error);
          throw error;
        }
      },
      
      deleteDeck: async (id) => {
        try {
          const response = await fetch(`/api/decks/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete deck');
          }

          set((state) => ({
            decks: state.decks.filter(deck => deck.id !== id)
          }));
        } catch (error) {
          console.error('Failed to delete deck:', error);
          throw error;
        }
      },
      
      // Scene management actions
      loadScenes: async (forceReload = false) => {
        const currentState = _get();
        if (currentState.scenesLoading || (!forceReload && currentState.scenes.length > 0)) {
          return; // Prevent multiple simultaneous calls or reloading if scenes already exist
        }
        
        try {
          set({ scenesLoading: true, scenesError: null });
          
          const response = await fetch('/api/scenes', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load scenes');
          }

          const result = await response.json();
          const apiScenes = result.data || [];
          
          // Transform API responses to match frontend interface
          const scenes: SceneCardData[] = apiScenes.map((apiScene: any) => ({
            id: apiScene.guid,
            name: apiScene.name,
            slug: apiScene.slug,
            type: apiScene.scene_type,
            description: apiScene.description,
            metadata: {
              title: apiScene.name,
              author: apiScene.creator?.name || 'Unknown',
              tags: [],
              createdAt: apiScene.created_at,
              updatedAt: apiScene.updated_at,
            },
            stats: {
              viewCount: 0,
              likeCount: 0,
              shareCount: 0,
              lastViewed: apiScene.updated_at,
            },
            isActive: apiScene.is_active,
            isPublic: apiScene.is_public,
            config: apiScene.config || {},
            meta: apiScene.meta || {},
            style: apiScene.style || {},
          }));
          
          set({ scenes, scenesLoading: false });
        } catch (error) {
          console.error('Failed to load scenes:', error);
          set({ 
            scenesError: error instanceof Error ? error.message : 'Failed to load scenes',
            scenesLoading: false 
          });
        }
      },
      
      loadSceneContent: async (sceneId, contentType = 'document', contentKey = 'main') => {
        try {
          const response = await fetch(`/api/scenes/${sceneId}/content/${contentType}/${contentKey}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            },
          });

          if (!response.ok) {
            if (response.status === 404) {
              return null; // Content doesn't exist yet
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load scene content');
          }

          const result = await response.json();
          return result.data?.content_data || null;
        } catch (error) {
          console.error('Failed to load scene content:', error);
          return null;
        }
      },
      
      refreshScenes: async () => {
        return _get().loadScenes(true);
      },
      
      createScene: async (sceneData) => {
        try {
          const response = await fetch('/api/scenes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            },
            body: JSON.stringify({
              name: sceneData.name,
              slug: sceneData.slug,
              description: sceneData.description,
              scene_type: sceneData.type,
              config: sceneData.config || {},
              meta: sceneData.meta || {},
              style: sceneData.style || {},
              is_active: sceneData.isActive !== false,
              is_public: sceneData.isPublic || false,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('=== SCENE CREATION API ERROR ===');
            console.error('Response status:', response.status);
            console.error('Error data:', errorData);
            console.error('Validation errors:', errorData.errors);
            console.error('Slug validation errors:', errorData.errors.slug);
            throw new Error(errorData.message || 'Failed to create scene');
          }

          const result = await response.json();
          const apiScene = result.data;
          
          // Transform API response to match frontend interface
          const newScene: SceneCardData = {
            id: apiScene.guid,
            name: apiScene.name,
            slug: apiScene.slug,
            type: apiScene.scene_type,
            description: apiScene.description,
            metadata: {
              title: apiScene.name,
              author: apiScene.creator?.name || 'Unknown',
              tags: [],
              createdAt: apiScene.created_at,
              updatedAt: apiScene.updated_at,
            },
            stats: {
              viewCount: 0,
              likeCount: 0,
              shareCount: 0,
            },
            isActive: apiScene.is_active,
            isPublic: apiScene.is_public,
            config: apiScene.config || {},
            meta: apiScene.meta || {},
            style: apiScene.style || {},
          };
          
          set((state) => ({
            scenes: [...state.scenes, newScene]
          }));
          
          // Evaluate deck types for all decks this scene belongs to
          if (sceneData.deckIds && sceneData.deckIds.length > 0) {
            for (const deckId of sceneData.deckIds) {
              await get().evaluateDeckType(deckId);
            }
          }
          
          return newScene;
        } catch (error) {
          console.error('Failed to create scene:', error);
          throw error;
        }
      },
      
      updateScene: async (id, updates) => {
        try {
          const scene = _get().scenes.find(s => s.id === id);
          if (!scene) {
            throw new Error('Scene not found');
          }

          const response = await fetch(`/api/scenes/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            },
            body: JSON.stringify({
              name: updates.name,
              slug: updates.slug,
              description: updates.description,
              scene_type: updates.type,
              config: updates.config,
              meta: updates.meta,
              style: updates.style,
              is_active: updates.isActive,
              is_public: updates.isPublic,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update scene');
          }

          const result = await response.json();
          const apiScene = result.data;
          
          // Transform API response to match frontend interface
          const updatedScene: SceneCardData = {
            id: apiScene.guid,
            name: apiScene.name,
            slug: apiScene.slug,
            type: apiScene.scene_type,
            description: apiScene.description,
            metadata: {
              title: apiScene.name,
              author: apiScene.creator?.name || 'Unknown',
              tags: [],
              createdAt: apiScene.created_at,
              updatedAt: apiScene.updated_at,
            },
            stats: {
              viewCount: 0,
              likeCount: 0,
              shareCount: 0,
            },
            isActive: apiScene.is_active,
            isPublic: apiScene.is_public,
            config: apiScene.config || {},
            meta: apiScene.meta || {},
            style: apiScene.style || {},
          };
          
          set((state) => ({
            scenes: state.scenes.map(scene =>
              scene.id === id ? updatedScene : scene
            )
          }));
          
          // Evaluate deck types for all decks this scene belongs to
          if (scene.deckIds && scene.deckIds.length > 0) {
            for (const deckId of scene.deckIds) {
              await get().evaluateDeckType(deckId);
            }
          }
        } catch (error) {
          console.error('Failed to update scene:', error);
          throw error;
        }
      },
      
      deleteScene: async (id) => {
        try {
          const scene = _get().scenes.find(s => s.id === id);
          if (!scene) {
            throw new Error('Scene not found');
          }

          const response = await fetch(`/api/scenes/${scene.guid}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete scene');
          }

          set((state) => ({
            scenes: state.scenes.filter(scene => scene.id !== id)
          }));
          
          // Evaluate deck types for all decks this scene belonged to
          if (scene.deckIds && scene.deckIds.length > 0) {
            for (const deckId of scene.deckIds) {
              await get().evaluateDeckType(deckId);
            }
          }
        } catch (error) {
          console.error('Failed to delete scene:', error);
          throw error;
        }
      },

      saveSceneContent: async (sceneId, contentData, contentType = 'document', contentKey = 'main') => {
        try {
          const scene = _get().scenes.find(s => s.id === sceneId);
          if (!scene) {
            throw new Error('Scene not found');
          }

          // Use scene.id as the GUID (since id is actually the GUID from the API)
          const sceneGuid = scene.id;
          console.log('=== SAVE SCENE CONTENT DEBUG ===');
          console.log('sceneId:', sceneId);
          console.log('scene:', scene);
          console.log('sceneGuid:', sceneGuid);

          const response = await fetch(`/api/scenes/${sceneGuid}/content`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
            },
            body: JSON.stringify({
              content_data: contentData,
              content_type: contentType,
              content_key: contentKey,
              content_format: 'html',
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save scene content');
          }

          // Content is saved to the database, no need to update local state
          // as it's stored separately in the scene_content table
        } catch (error) {
          console.error('Failed to save scene content:', error);
          throw error;
        }
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
      
      // Deck type evaluation
      evaluateDeckType: async (deckId) => {
        const state = get();
        const deck = state.decks.find(d => d.id === deckId);
        if (!deck) return;
        
        // Get all scenes that belong to this deck
        const deckScenes = state.scenes.filter(scene => scene.deckIds.includes(deckId));
        const sceneTypes = deckScenes.map(scene => scene.type);
        const uniqueTypes = [...new Set(sceneTypes)];
        
        let newType: DeckType;
        if (uniqueTypes.length === 0) {
          newType = 'graph'; // Default type for empty decks
        } else if (uniqueTypes.length === 1) {
          newType = uniqueTypes[0] as DeckType;
        } else {
          newType = 'hybrid'; // Multiple scene types = hybrid
        }
        
        // Only update if the type has changed
        if (deck.type !== newType) {
          try {
            const response = await fetch(`/api/decks/${deckId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
              },
              body: JSON.stringify({
                type: newType,
              }),
            });
            
            if (response.ok) {
              // Update the deck in the store
              set((state) => ({
                decks: state.decks.map(d => 
                  d.id === deckId ? { ...d, type: newType } : d
                )
              }));
            }
          } catch (error) {
            console.error('Failed to update deck type:', error);
          }
        }
      },
    }),
    {
      name: 'deck-store',
    }
  )
);
