import { useEffect, useRef, useState } from 'react';
import { CoreGraphNode, CoreGraphEdge } from '@progress/shared';
import * as Sigma from 'sigma';
import * as Graph from 'graphology';

interface GraphCanvasProps {
  nodes: CoreGraphNode[];
  edges: CoreGraphEdge[];
  onNodeClick?: (node: CoreGraphNode) => void;
  selectedNodeGuid?: string | null;
  className?: string;
}

export function GraphCanvas({
  nodes,
  edges,
  onNodeClick,
  selectedNodeGuid,
  className = ''
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<any | null>(null);
  const graphRef = useRef<any | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a new graph instance
    const graph = new Graph.default();
    graphRef.current = graph;

    // Add nodes to the graph
    nodes.forEach((node) => {
      graph.addNode(node.guid, {
        label: node.label,
        size: 8,
        color: getNodeColor(node.node_type?.name || 'unknown'),
        x: Math.random() * 1000, // Random initial position
        y: Math.random() * 1000,
        nodeType: node.node_type?.name || 'unknown',
        nodeTypeDisplay: node.node_type?.display_name || 'Unknown',
        description: node.description || ''
      });
    });

    // Add edges to the graph
    edges.forEach((edge) => {
      if (graph.hasNode(edge.source_node_guid) && graph.hasNode(edge.target_node_guid)) {
        graph.addEdge(edge.source_node_guid, edge.target_node_guid, {
          label: edge.label || edge.edge_type?.display_name || 'Connection',
          color: getEdgeColor(edge.edge_type?.name || 'unknown'),
          size: 2,
          edgeType: edge.edge_type?.name || 'unknown',
          edgeTypeDisplay: edge.edge_type?.display_name || 'Unknown'
        });
      }
    });

    // Create Sigma instance
    const sigma = new Sigma.default(graph, containerRef.current, {
      minCameraRatio: 0.1,
      maxCameraRatio: 10,
      labelDensity: 0.07,
      labelGridCellSize: 60,
      labelRenderedSizeThreshold: 6,
      zIndex: true,
      labelSize: 12,
      labelWeight: 'bold',
      labelColor: { color: '#333' },
      edgeLabelSize: 10,
      edgeLabelColor: { color: '#666' },
      nodeReducer: (node, data) => ({
        ...data,
        color: selectedNodeGuid === node ? '#ff6b6b' : data.color,
        size: selectedNodeGuid === node ? data.size * 1.5 : data.size
      }),
      edgeReducer: (edge, data) => ({
        ...data,
        color: selectedNodeGuid && 
          (graph.getSourceAttributes(edge).id === selectedNodeGuid || 
           graph.getTargetAttributes(edge).id === selectedNodeGuid) 
          ? '#ff6b6b' : data.color,
        size: selectedNodeGuid && 
          (graph.getSourceAttributes(edge).id === selectedNodeGuid || 
           graph.getTargetAttributes(edge).id === selectedNodeGuid) 
          ? data.size * 2 : data.size
      })
    });

    sigmaRef.current = sigma;

    // Handle node clicks
    sigma.on('clickNode', (event) => {
      const nodeId = event.node;
      const node = nodes.find(n => n.guid === nodeId);
      if (node && onNodeClick) {
        onNodeClick(node);
      }
    });

    // Handle background clicks to deselect
    sigma.on('clickStage', () => {
      if (onNodeClick) {
        onNodeClick(null as any);
      }
    });

    // Cleanup function
    return () => {
      sigma.kill();
    };
  }, [nodes, edges, onNodeClick, selectedNodeGuid]);

  // Update graph when data changes
  useEffect(() => {
    if (!sigmaRef.current || !graphRef.current) return;

    const graph = graphRef.current;
    const sigma = sigmaRef.current;

    // Clear existing graph
    graph.clear();

    // Re-add nodes
    nodes.forEach((node) => {
      graph.addNode(node.guid, {
        label: node.label,
        size: 8,
        color: getNodeColor(node.node_type?.name || 'unknown'),
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        nodeType: node.node_type?.name || 'unknown',
        nodeTypeDisplay: node.node_type?.display_name || 'Unknown',
        description: node.description || ''
      });
    });

    // Re-add edges
    edges.forEach((edge) => {
      if (graph.hasNode(edge.source_node_guid) && graph.hasNode(edge.target_node_guid)) {
        graph.addEdge(edge.source_node_guid, edge.target_node_guid, {
          label: edge.label || edge.edge_type?.display_name || 'Connection',
          color: getEdgeColor(edge.edge_type?.name || 'unknown'),
          size: 2,
          edgeType: edge.edge_type?.name || 'unknown',
          edgeTypeDisplay: edge.edge_type?.display_name || 'Unknown'
        });
      }
    });

    // Refresh Sigma
    sigma.refresh();
  }, [nodes, edges]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full bg-background ${className}`}
      style={{ minHeight: '500px' }}
    />
  );
}

// Helper functions for colors
function getNodeColor(nodeType: string): string {
  const colors: { [key: string]: string } = {
    stage: '#4f46e5',
    user: '#059669',
    document: '#dc2626',
    concept: '#ea580c',
    resource: '#7c3aed',
    unknown: '#6b7280'
  };
  return colors[nodeType] || colors.unknown;
}

function getEdgeColor(edgeType: string): string {
  const colors: { [key: string]: string } = {
    references: '#3b82f6',
    depends_on: '#ef4444',
    contains: '#10b981',
    related_to: '#f59e0b',
    leads_to: '#8b5cf6',
    unknown: '#6b7280'
  };
  return colors[edgeType] || colors.unknown;
}
