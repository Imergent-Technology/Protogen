/**
 * Graph Studio System
 * 
 * Singleton system for managing graph visualization state and operations.
 * Follows the same pattern as Navigator, Dialog, and other Protogen systems.
 */

import { EventEmitter } from '../../utils/EventEmitter';
import { CoreGraphNode, CoreGraphEdge } from '../../services/ApiClient';
import {
  GraphStudioState,
  GraphStudioEvent,
  GraphStudioEventMap,
  GraphViewMode,
  GraphDisplayMode,
  GraphFilters,
} from './types';

export class GraphStudioSystem extends EventEmitter<GraphStudioEventMap> {
  private static instance: GraphStudioSystem;
  
  private state: GraphStudioState = {
    nodes: [],
    edges: [],
    selectedNode: null,
    viewMode: 'explore',
    displayMode: 'graph',
    filters: {
      searchTerm: '',
      nodeType: 'all',
      connections: 'all',
    },
    loading: false,
    error: null,
  };

  private constructor() {
    super();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): GraphStudioSystem {
    if (!GraphStudioSystem.instance) {
      GraphStudioSystem.instance = new GraphStudioSystem();
    }
    return GraphStudioSystem.instance;
  }

  /**
   * Initialize the graph studio system
   */
  public initialize(): void {
    // Reset state
    this.state = {
      nodes: [],
      edges: [],
      selectedNode: null,
      viewMode: 'explore',
      displayMode: 'graph',
      filters: {
        searchTerm: '',
        nodeType: 'all',
        connections: 'all',
      },
      loading: false,
      error: null,
    };
  }

  /**
   * Load graph data
   */
  public async loadGraph(nodes: CoreGraphNode[], edges: CoreGraphEdge[]): Promise<void> {
    try {
      this.state.loading = true;
      this.state.error = null;
      
      this.state.nodes = nodes;
      this.state.edges = edges;
      
      this.state.loading = false;
      
      this.emit(GraphStudioEvent.GRAPH_LOADED, {
        nodeCount: nodes.length,
        edgeCount: edges.length,
      });
    } catch (error) {
      this.state.loading = false;
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit(GraphStudioEvent.GRAPH_ERROR, error as Error);
    }
  }

  /**
   * Select a node
   */
  public selectNode(node: CoreGraphNode | null): void {
    const previousNode = this.state.selectedNode;
    this.state.selectedNode = node;
    
    if (node) {
      this.emit(GraphStudioEvent.NODE_SELECTED, node);
    } else if (previousNode) {
      this.emit(GraphStudioEvent.NODE_DESELECTED, undefined);
    }
  }

  /**
   * Get the currently selected node
   */
  public getSelectedNode(): CoreGraphNode | null {
    return this.state.selectedNode;
  }

  /**
   * Set view mode
   */
  public setViewMode(mode: GraphViewMode): void {
    this.state.viewMode = mode;
    this.emit(GraphStudioEvent.VIEW_MODE_CHANGED, mode);
  }

  /**
   * Get current view mode
   */
  public getViewMode(): GraphViewMode {
    return this.state.viewMode;
  }

  /**
   * Set display mode
   */
  public setDisplayMode(mode: GraphDisplayMode): void {
    this.state.displayMode = mode;
    this.emit(GraphStudioEvent.DISPLAY_MODE_CHANGED, mode);
  }

  /**
   * Get current display mode
   */
  public getDisplayMode(): GraphDisplayMode {
    return this.state.displayMode;
  }

  /**
   * Update filters
   */
  public setFilters(filters: Partial<GraphFilters>): void {
    this.state.filters = {
      ...this.state.filters,
      ...filters,
    };
    this.emit(GraphStudioEvent.FILTERS_CHANGED, this.state.filters);
  }

  /**
   * Get current filters
   */
  public getFilters(): GraphFilters {
    return this.state.filters;
  }

  /**
   * Get all nodes
   */
  public getNodes(): CoreGraphNode[] {
    return this.state.nodes;
  }

  /**
   * Get all edges
   */
  public getEdges(): CoreGraphEdge[] {
    return this.state.edges;
  }

  /**
   * Get filtered nodes based on current filters
   */
  public getFilteredNodes(): CoreGraphNode[] {
    const { searchTerm, nodeType, connections, subgraphId } = this.state.filters;
    
    return this.state.nodes.filter(node => {
      // Search filter
      const matchesSearch = !searchTerm || 
        (node.label?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      // Type filter
      const matchesType = nodeType === 'all' || node.node_type?.name === nodeType;
      
      // Connection filter
      let matchesConnections = true;
      if (connections !== 'all') {
        const connectionCount = this.state.edges.filter(edge =>
          edge.source_node_guid === node.guid || edge.target_node_guid === node.guid
        ).length;
        
        matchesConnections = connections === 'connected' 
          ? connectionCount > 0
          : connectionCount === 0;
      }
      
      // Subgraph filter (placeholder for now)
      let matchesSubgraph = true;
      if (subgraphId) {
        // This will be implemented when subgraph support is added
        matchesSubgraph = true;
      }
      
      return matchesSearch && matchesType && matchesConnections && matchesSubgraph;
    });
  }

  /**
   * Get the current state (for debugging)
   */
  public getState(): Readonly<GraphStudioState> {
    return { ...this.state };
  }

  /**
   * Check if system is loading
   */
  public isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * Get current error
   */
  public getError(): string | null {
    return this.state.error;
  }

  /**
   * Clear error
   */
  public clearError(): void {
    this.state.error = null;
  }

  /**
   * Reset the system
   */
  public reset(): void {
    this.initialize();
  }
}

// Export singleton instance
export const graphStudioSystem = GraphStudioSystem.getInstance();

