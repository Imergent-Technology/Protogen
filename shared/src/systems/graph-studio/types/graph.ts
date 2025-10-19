/**
 * Graph Studio Type Definitions
 * 
 * Core types for graph visualization and interaction
 */

import { CoreGraphNode, CoreGraphEdge } from '../../../types';

/**
 * Node position in 2D space
 */
export interface NodePosition {
  x: number;
  y: number;
  locked: boolean;
}

/**
 * Graph view mode
 */
export type GraphViewMode = 'explore' | 'edit' | 'design';

/**
 * Display mode for graph visualization
 */
export type GraphDisplayMode = 'grid' | 'list' | 'graph';

/**
 * Node color mapping by type
 */
export interface NodeColorMap {
  [key: string]: string;
}

/**
 * Edge color mapping by type
 */
export interface EdgeColorMap {
  [key: string]: string;
}

/**
 * Graph filter options
 */
export interface GraphFilters {
  searchTerm: string;
  nodeType: string;
  connections: 'all' | 'connected' | 'isolated';
  subgraphId?: string | null;
}

/**
 * Graph Studio configuration
 */
export interface GraphStudioConfig {
  /**
   * Enable node dragging
   */
  enableDragging?: boolean;
  
  /**
   * Enable node selection
   */
  enableSelection?: boolean;
  
  /**
   * Enable context menus
   */
  enableContextMenu?: boolean;
  
  /**
   * Minimum camera zoom ratio
   */
  minCameraRatio?: number;
  
  /**
   * Maximum camera zoom ratio
   */
  maxCameraRatio?: number;
  
  /**
   * Label rendering threshold
   */
  labelRenderedSizeThreshold?: number;
  
  /**
   * Node color map
   */
  nodeColors?: NodeColorMap;
  
  /**
   * Edge color map
   */
  edgeColors?: EdgeColorMap;
}

/**
 * Graph canvas props
 */
export interface GraphCanvasProps {
  nodes: CoreGraphNode[];
  edges: CoreGraphEdge[];
  onNodeClick?: (node: CoreGraphNode | null) => void;
  onNodeRightClick?: (node: CoreGraphNode, event: MouseEvent) => void;
  selectedNodeGuid?: string | null;
  className?: string;
  config?: GraphStudioConfig;
}

/**
 * Graph Studio state
 */
export interface GraphStudioState {
  nodes: CoreGraphNode[];
  edges: CoreGraphEdge[];
  selectedNode: CoreGraphNode | null;
  viewMode: GraphViewMode;
  displayMode: GraphDisplayMode;
  filters: GraphFilters;
  loading: boolean;
  error: string | null;
}

/**
 * Graph Studio events
 */
export enum GraphStudioEvent {
  NODE_SELECTED = 'node-selected',
  NODE_DESELECTED = 'node-deselected',
  GRAPH_LOADED = 'graph-loaded',
  GRAPH_ERROR = 'graph-error',
  VIEW_MODE_CHANGED = 'view-mode-changed',
  DISPLAY_MODE_CHANGED = 'display-mode-changed',
  FILTERS_CHANGED = 'filters-changed',
}

/**
 * Graph Studio event payloads
 */
export interface GraphStudioEventMap {
  [GraphStudioEvent.NODE_SELECTED]: CoreGraphNode;
  [GraphStudioEvent.NODE_DESELECTED]: void;
  [GraphStudioEvent.GRAPH_LOADED]: { nodeCount: number; edgeCount: number };
  [GraphStudioEvent.GRAPH_ERROR]: Error;
  [GraphStudioEvent.VIEW_MODE_CHANGED]: GraphViewMode;
  [GraphStudioEvent.DISPLAY_MODE_CHANGED]: GraphDisplayMode;
  [GraphStudioEvent.FILTERS_CHANGED]: GraphFilters;
}

