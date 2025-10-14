/**
 * Deck Configuration Types
 * 
 * Defines the structure for decks (collections of slides).
 */

export type DeckType = 'presentation' | 'graph' | 'hybrid';

export interface DeckConfig {
  id: string;
  name: string;
  description?: string;
  type: DeckType;
  sceneIds: string[];
  slideOrder: string[];
  navigation: DeckNavigation;
  metadata: DeckMetadata;
  created_at: string;
  updated_at: string;
  created_by?: number;
}

export interface DeckNavigation {
  autoPlay: boolean;
  autoPlayInterval?: number; // in seconds
  loop: boolean;
  allowRandomAccess: boolean;
  keyboardNavigation: boolean;
  swipeNavigation?: boolean;
  showProgress?: boolean;
  showControls?: boolean;
}

export interface DeckMetadata {
  thumbnail?: string;
  tags?: string[];
  category?: string;
  total_slides?: number;
  estimated_duration?: number;
  [key: string]: any;
}

export interface CreateDeckInput {
  name: string;
  description?: string;
  type: DeckType;
  sceneIds?: string[];
  navigation?: Partial<DeckNavigation>;
  metadata?: Partial<DeckMetadata>;
}

export interface UpdateDeckInput {
  name?: string;
  description?: string;
  type?: DeckType;
  sceneIds?: string[];
  slideOrder?: string[];
  navigation?: Partial<DeckNavigation>;
  metadata?: Partial<DeckMetadata>;
}

export interface DeckPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReorder: boolean;
  canAddSlides: boolean;
  canRemoveSlides: boolean;
}

