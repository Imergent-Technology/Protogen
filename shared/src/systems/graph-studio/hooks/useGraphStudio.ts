/**
 * useGraphStudio Hook
 * 
 * React hook for interacting with the Graph Studio system.
 * Provides graph state and methods for graph operations.
 */

import { useEffect, useState, useCallback } from 'react';
import { graphStudioSystem } from '../GraphStudioSystem';
import {
  GraphStudioEvent,
  GraphViewMode,
  GraphDisplayMode,
  GraphFilters,
} from '../types';
import { CoreGraphNode, CoreGraphEdge } from '../../../types';

export interface UseGraphStudioReturn {
  // State
  nodes: CoreGraphNode[];
  edges: CoreGraphEdge[];
  filteredNodes: CoreGraphNode[];
  selectedNode: CoreGraphNode | null;
  viewMode: GraphViewMode;
  displayMode: GraphDisplayMode;
  filters: GraphFilters;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadGraph: (nodes: CoreGraphNode[], edges: CoreGraphEdge[]) => Promise<void>;
  selectNode: (node: CoreGraphNode | null) => void;
  setViewMode: (mode: GraphViewMode) => void;
  setDisplayMode: (mode: GraphDisplayMode) => void;
  setFilters: (filters: Partial<GraphFilters>) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook for using the Graph Studio system
 */
export function useGraphStudio(): UseGraphStudioReturn {
  const [nodes, setNodes] = useState<CoreGraphNode[]>([]);
  const [edges, setEdges] = useState<CoreGraphEdge[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<CoreGraphNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CoreGraphNode | null>(null);
  const [viewMode, setViewModeState] = useState<GraphViewMode>('explore');
  const [displayMode, setDisplayModeState] = useState<GraphDisplayMode>('graph');
  const [filters, setFiltersState] = useState<GraphFilters>({
    searchTerm: '',
    nodeType: 'all',
    connections: 'all',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with system state
  useEffect(() => {
    const system = graphStudioSystem;
    
    // Initialize state from system
    setNodes(system.getNodes());
    setEdges(system.getEdges());
    setFilteredNodes(system.getFilteredNodes());
    setSelectedNode(system.getSelectedNode());
    setViewModeState(system.getViewMode());
    setDisplayModeState(system.getDisplayMode());
    setFiltersState(system.getFilters());
    setLoading(system.isLoading());
    setError(system.getError());

    // Subscribe to events
    const handleNodeSelected = (node: CoreGraphNode) => {
      setSelectedNode(node);
    };

    const handleNodeDeselected = () => {
      setSelectedNode(null);
    };

    const handleGraphLoaded = () => {
      setNodes(system.getNodes());
      setEdges(system.getEdges());
      setFilteredNodes(system.getFilteredNodes());
      setLoading(false);
    };

    const handleGraphError = (err: Error) => {
      setError(err.message);
      setLoading(false);
    };

    const handleViewModeChanged = (mode: GraphViewMode) => {
      setViewModeState(mode);
    };

    const handleDisplayModeChanged = (mode: GraphDisplayMode) => {
      setDisplayModeState(mode);
    };

    const handleFiltersChanged = (newFilters: GraphFilters) => {
      setFiltersState(newFilters);
      setFilteredNodes(system.getFilteredNodes());
    };

    system.on(GraphStudioEvent.NODE_SELECTED, handleNodeSelected);
    system.on(GraphStudioEvent.NODE_DESELECTED, handleNodeDeselected);
    system.on(GraphStudioEvent.GRAPH_LOADED, handleGraphLoaded);
    system.on(GraphStudioEvent.GRAPH_ERROR, handleGraphError);
    system.on(GraphStudioEvent.VIEW_MODE_CHANGED, handleViewModeChanged);
    system.on(GraphStudioEvent.DISPLAY_MODE_CHANGED, handleDisplayModeChanged);
    system.on(GraphStudioEvent.FILTERS_CHANGED, handleFiltersChanged);

    return () => {
      system.off(GraphStudioEvent.NODE_SELECTED, handleNodeSelected);
      system.off(GraphStudioEvent.NODE_DESELECTED, handleNodeDeselected);
      system.off(GraphStudioEvent.GRAPH_LOADED, handleGraphLoaded);
      system.off(GraphStudioEvent.GRAPH_ERROR, handleGraphError);
      system.off(GraphStudioEvent.VIEW_MODE_CHANGED, handleViewModeChanged);
      system.off(GraphStudioEvent.DISPLAY_MODE_CHANGED, handleDisplayModeChanged);
      system.off(GraphStudioEvent.FILTERS_CHANGED, handleFiltersChanged);
    };
  }, []);

  // Actions
  const loadGraph = useCallback(async (nodes: CoreGraphNode[], edges: CoreGraphEdge[]) => {
    setLoading(true);
    await graphStudioSystem.loadGraph(nodes, edges);
  }, []);

  const selectNode = useCallback((node: CoreGraphNode | null) => {
    graphStudioSystem.selectNode(node);
  }, []);

  const setViewMode = useCallback((mode: GraphViewMode) => {
    graphStudioSystem.setViewMode(mode);
  }, []);

  const setDisplayMode = useCallback((mode: GraphDisplayMode) => {
    graphStudioSystem.setDisplayMode(mode);
  }, []);

  const setFilters = useCallback((newFilters: Partial<GraphFilters>) => {
    graphStudioSystem.setFilters(newFilters);
  }, []);

  const clearError = useCallback(() => {
    graphStudioSystem.clearError();
    setError(null);
  }, []);

  const reset = useCallback(() => {
    graphStudioSystem.reset();
    setNodes([]);
    setEdges([]);
    setFilteredNodes([]);
    setSelectedNode(null);
    setViewModeState('explore');
    setDisplayModeState('graph');
    setFiltersState({
      searchTerm: '',
      nodeType: 'all',
      connections: 'all',
    });
    setLoading(false);
    setError(null);
  }, []);

  return {
    // State
    nodes,
    edges,
    filteredNodes,
    selectedNode,
    viewMode,
    displayMode,
    filters,
    loading,
    error,
    
    // Actions
    loadGraph,
    selectNode,
    setViewMode,
    setDisplayMode,
    setFilters,
    clearError,
    reset,
  };
}

