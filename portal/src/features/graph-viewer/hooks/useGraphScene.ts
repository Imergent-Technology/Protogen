/**
 * useGraphScene Hook
 * 
 * Hook for loading and managing graph scene data in the portal.
 */

import { useState, useEffect } from 'react';
import { useGraphStudio } from '@protogen/shared/systems/graph-studio';
import { GraphDataService } from '@protogen/shared/systems/graph-studio';
import { CoreGraphNode } from '@protogen/shared';

export interface UseGraphSceneOptions {
  /**
   * Scene ID to load
   */
  sceneId?: string | number;
  
  /**
   * Subgraph ID to load (overrides sceneId)
   */
  subgraphId?: string | number;
  
  /**
   * Auto-load on mount
   */
  autoLoad?: boolean;
}

export interface UseGraphSceneReturn {
  /**
   * All nodes from Graph Studio
   */
  nodes: CoreGraphNode[];
  
  /**
   * Loading state
   */
  loading: boolean;
  
  /**
   * Error message if any
   */
  error: string | null;
  
  /**
   * Currently selected node
   */
  selectedNode: CoreGraphNode | null;
  
  /**
   * Load graph data
   */
  loadGraph: () => Promise<void>;
  
  /**
   * Reload graph data
   */
  reload: () => Promise<void>;
}

/**
 * Hook for managing graph scene data
 * 
 * Handles loading graph/subgraph data and integrating with GraphStudioSystem.
 */
export function useGraphScene(options: UseGraphSceneOptions = {}): UseGraphSceneReturn {
  const { sceneId, subgraphId, autoLoad = true } = options;
  const { nodes, selectedNode, loadGraph: loadGraphStudio, loading: graphLoading, error: graphError } = useGraphStudio();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load graph data
  const loadGraph = async () => {
    try {
      setLoading(true);
      setError(null);

      let graphData;
      
      if (subgraphId) {
        // Load specific subgraph
        graphData = await GraphDataService.loadSubgraph(subgraphId);
      } else if (sceneId) {
        // TODO: Load graph via scene API
        // For now, load entire core graph
        const coreData = await GraphDataService.loadCoreGraph();
        graphData = { nodes: coreData.nodes, edges: coreData.edges };
      } else {
        // Load entire core graph
        const coreData = await GraphDataService.loadCoreGraph();
        graphData = { nodes: coreData.nodes, edges: coreData.edges };
      }

      await loadGraphStudio(graphData.nodes, graphData.edges);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load graph';
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadGraph();
    }
  }, [sceneId, subgraphId, autoLoad]);

  return {
    nodes,
    loading: loading || graphLoading,
    error: error || graphError,
    selectedNode,
    loadGraph,
    reload: loadGraph,
  };
}

