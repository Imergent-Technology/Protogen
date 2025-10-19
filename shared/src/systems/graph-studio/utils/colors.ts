/**
 * Graph Studio Color Utilities
 * 
 * Helper functions for node and edge colors
 */

import { NodeColorMap, EdgeColorMap } from '../types';

/**
 * Default node color mapping by type
 */
export const defaultNodeColors: NodeColorMap = {
  stage: '#4f46e5',
  user: '#059669',
  document: '#dc2626',
  concept: '#ea580c',
  resource: '#7c3aed',
  unknown: '#6b7280',
};

/**
 * Default edge color mapping by type
 */
export const defaultEdgeColors: EdgeColorMap = {
  references: '#3b82f6',
  depends_on: '#ef4444',
  contains: '#10b981',
  related_to: '#f59e0b',
  leads_to: '#8b5cf6',
  unknown: '#6b7280',
};

/**
 * Get color for a node type
 */
export function getNodeColor(nodeType: string, colorMap?: NodeColorMap): string {
  const colors = colorMap || defaultNodeColors;
  return colors[nodeType] || colors.unknown;
}

/**
 * Get color for an edge type
 */
export function getEdgeColor(edgeType: string, colorMap?: EdgeColorMap): string {
  const colors = colorMap || defaultEdgeColors;
  return colors[edgeType] || colors.unknown;
}

/**
 * Get selection highlight color
 */
export function getSelectionColor(): string {
  return '#3b82f6'; // blue-500
}

/**
 * Get hover highlight color
 */
export function getHoverColor(): string {
  return '#60a5fa'; // blue-400
}

