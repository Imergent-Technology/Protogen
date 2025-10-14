/**
 * ToC Types - M1 Week 6
 * 
 * Type definitions for Table of Contents system.
 * Based on Spec 08: ToC Drawer Integration
 */

import type { SceneType } from '../services/HitTestLayer';

// ============================================================================
// ToC Node Structure
// ============================================================================

export interface ToCNode {
  id: string;
  type: 'deck' | 'scene' | 'slide' | 'page' | 'section';
  label: string;
  order: number;
  children?: ToCNode[];
  preview?: string;  // Data URL for thumbnail
  metadata?: ToCNodeMetadata;
  state?: ToCNodeState;
}

export interface ToCNodeMetadata {
  sceneType?: SceneType;
  itemCount?: number;
  duration?: number;     // For card/video scenes
  wordCount?: number;    // For document scenes
  [key: string]: any;
}

export interface ToCNodeState {
  expanded: boolean;
  selected: boolean;
  current: boolean;      // Current navigator location
  loading?: boolean;
  error?: string;
}

// ============================================================================
// ToC Configuration
// ============================================================================

export interface ToCConfig {
  showThumbnails: boolean;
  thumbnailSize: 'xs' | 'sm';
  expandedByDefault: boolean;
  showItemCounts: boolean;
  enableSearch: boolean;
  syncWithNavigator: boolean;
  virtualScrolling?: boolean;  // For large trees
  maxDepth?: number;           // Limit expansion depth
}

export const DEFAULT_TOC_CONFIG: ToCConfig = {
  showThumbnails: true,
  thumbnailSize: 'xs',
  expandedByDefault: false,
  showItemCounts: true,
  enableSearch: true,
  syncWithNavigator: true,
  virtualScrolling: false,
  maxDepth: 3
};

// ============================================================================
// ToC Actions
// ============================================================================

export type ToCAction =
  | { type: 'TOGGLE_NODE'; nodeId: string }
  | { type: 'SELECT_NODE'; nodeId: string }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'SET_CURRENT'; nodeId: string }
  | { type: 'FILTER'; query: string }
  | { type: 'LOAD_PREVIEW'; nodeId: string; dataUrl: string };

// ============================================================================
// ToC Search
// ============================================================================

export interface ToCSearchResult {
  node: ToCNode;
  path: string[];  // IDs from root to node
  match: {
    field: 'label' | 'metadata';
    score: number;
  };
}

// ============================================================================
// ToC Events
// ============================================================================

export interface ToCEventPayload {
  nodeId: string;
  node: ToCNode;
  timestamp: number;
}

export interface ToCNavigatePayload extends ToCEventPayload {
  targetType: 'deck' | 'scene' | 'slide' | 'page';
  targetId: string;
}

