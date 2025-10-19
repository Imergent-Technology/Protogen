/**
 * Graph Studio Layout Utilities
 * 
 * Helper functions for node positioning and layout
 */

import { NodePosition } from '../types';
import { CoreGraphNode } from '../../../services/ApiClient';

/**
 * Generate grid position for a node
 */
export function generateGridPosition(
  index: number,
  totalNodes: number
): { x: number; y: number } {
  const gridSize = Math.ceil(Math.sqrt(totalNodes));
  const x = (index % gridSize) * 200 + 100;
  const y = Math.floor(index / gridSize) * 200 + 100;
  
  return { x, y };
}

/**
 * Generate random position for a node
 */
export function generateRandomPosition(): { x: number; y: number } {
  return {
    x: Math.random() * 800 + 100,
    y: Math.random() * 600 + 100,
  };
}

/**
 * Calculate initial positions for nodes
 */
export function calculateInitialPositions(
  nodes: CoreGraphNode[]
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  
  nodes.forEach((node, index) => {
    if (node.position) {
      // Use saved position
      positions.set(node.guid, {
        x: node.position.x,
        y: node.position.y,
        locked: false,
      });
    } else {
      // Generate grid position
      const { x, y } = generateGridPosition(index, nodes.length);
      positions.set(node.guid, {
        x,
        y,
        locked: false,
      });
    }
  });
  
  return positions;
}

/**
 * Calculate repulsion forces for layout
 */
export function calculateRepulsionForces(
  nodeIds: string[],
  getPosition: (nodeId: string) => { x: number; y: number }
): Map<string, { x: number; y: number }> {
  const forces = new Map<string, { x: number; y: number }>();
  
  // Initialize forces
  nodeIds.forEach(nodeId => {
    forces.set(nodeId, { x: 0, y: 0 });
  });
  
  // Calculate pairwise repulsion
  nodeIds.forEach((nodeId1, i) => {
    const pos1 = getPosition(nodeId1);
    
    nodeIds.forEach((nodeId2, j) => {
      if (i >= j) return; // Skip self and already calculated pairs
      
      const pos2 = getPosition(nodeId2);
      const dx = pos1.x - pos2.x;
      const dy = pos1.y - pos2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0 && distance < 200) {
        const force = 1000 / (distance * distance);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        
        const force1 = forces.get(nodeId1)!;
        const force2 = forces.get(nodeId2)!;
        
        force1.x += fx;
        force1.y += fy;
        force2.x -= fx;
        force2.y -= fy;
      }
    });
  });
  
  return forces;
}

