/**
 * Scene Configuration Types
 * 
 * Defines the structure and metadata for scenes in the system.
 */

export type SceneType = 'graph' | 'card' | 'document' | 'custom';

export interface SceneConfig {
  id: string;
  name: string;
  slug: string;
  type: SceneType;
  description?: string;
  is_active: boolean;
  is_public: boolean;
  deckIds: string[];
  metadata: SceneMetadata;
  created_at: string;
  updated_at: string;
  created_by?: number;
}

export interface SceneMetadata {
  thumbnail?: string;
  tags?: string[];
  category?: string;
  estimated_duration?: number; // in seconds
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  [key: string]: any; // Allow custom metadata
}

export interface CreateSceneInput {
  name: string;
  slug: string;
  type: SceneType;
  description?: string;
  is_active?: boolean;
  is_public?: boolean;
  deckIds?: string[];
  config?: Record<string, any>;
  meta?: Record<string, any>;
  style?: Record<string, any>;
}

export interface UpdateSceneInput {
  name?: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  is_public?: boolean;
  deckIds?: string[];
  metadata?: Partial<SceneMetadata>;
}

export interface ScenePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canChangeType: boolean;
  canLinkDecks: boolean;
  canManageSlides: boolean;
}

