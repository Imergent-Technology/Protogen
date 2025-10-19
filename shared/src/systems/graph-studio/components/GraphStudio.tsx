/**
 * GraphStudio Component
 * 
 * Main graph visualization and exploration component.
 * Combines GraphCanvas with controls and state management.
 */

import React, { useEffect } from 'react';
import { CoreGraphNode } from '../../../services/ApiClient';
import { GraphCanvas } from './GraphCanvas';
import { useGraphStudio } from '../hooks';
import { GraphStudioConfig } from '../types';

export interface GraphStudioProps {
  /**
   * Subgraph ID to load (optional)
   * If not provided, loads entire core graph
   */
  subgraphId?: number | string | null;
  
  /**
   * Callback when a node is selected
   */
  onNodeSelect?: (node: CoreGraphNode | null) => void;
  
  /**
   * Callback when a node is right-clicked
   */
  onNodeRightClick?: (node: CoreGraphNode, event: MouseEvent) => void;
  
  /**
   * Additional className for container
   */
  className?: string;
  
  /**
   * Graph visualization configuration
   */
  config?: GraphStudioConfig;
  
  /**
   * Loading state override
   */
  loading?: boolean;
}

/**
 * GraphStudio - Main graph visualization component
 * 
 * Provides interactive graph exploration with node selection,
 * filtering, and basic interactions.
 */
export function GraphStudio({
  subgraphId,
  onNodeSelect,
  onNodeRightClick,
  className = '',
  config = {},
  loading: externalLoading,
}: GraphStudioProps) {
  const {
    nodes,
    edges,
    selectedNode,
    loading: internalLoading,
    error,
    selectNode,
  } = useGraphStudio();

  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  // Handle node selection
  const handleNodeClick = (node: CoreGraphNode | null) => {
    selectNode(node);
    onNodeSelect?.(node);
  };

  // Handle node right-click
  const handleNodeRightClick = (node: CoreGraphNode, event: MouseEvent) => {
    selectNode(node);
    onNodeRightClick?.(node, event);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center w-full h-full min-h-[500px] ${className}`}>
        <div className="text-center">
          <div className="text-lg font-medium">Loading graph...</div>
          <div className="text-sm text-muted-foreground mt-2">
            Preparing visualization
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center w-full h-full min-h-[500px] ${className}`}>
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Error loading graph</div>
          <div className="text-sm text-muted-foreground mt-2">{error}</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (nodes.length === 0) {
    return (
      <div className={`flex items-center justify-center w-full h-full min-h-[500px] ${className}`}>
        <div className="text-center">
          <div className="text-lg font-medium">No nodes to display</div>
          <div className="text-sm text-muted-foreground mt-2">
            The graph is empty
          </div>
        </div>
      </div>
    );
  }

  // Render graph
  return (
    <div className={`w-full h-full ${className}`}>
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeRightClick}
        selectedNodeGuid={selectedNode?.guid}
        config={config}
      />
    </div>
  );
}

