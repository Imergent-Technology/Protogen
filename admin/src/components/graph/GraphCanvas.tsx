import { useEffect, useRef, useState, useCallback } from 'react';
import { CoreGraphNode, CoreGraphEdge, apiClient } from '@progress/shared';
import * as Sigma from 'sigma';
import * as Graph from 'graphology';
import { NodeDonut } from './NodeDonut';

interface GraphCanvasProps {
  nodes: CoreGraphNode[];
  edges: CoreGraphEdge[];
  onNodeClick?: (node: CoreGraphNode) => void;
  selectedNodeGuid?: string | null;
  className?: string;
  onNodeEdit?: (node: CoreGraphNode) => void;
  onNodeDelete?: (node: CoreGraphNode) => void;
}

interface NodePosition {
  x: number;
  y: number;
  locked: boolean;
}

export function GraphCanvas({
  nodes,
  edges,
  onNodeClick,
  selectedNodeGuid,
  className = '',
  onNodeEdit,
  onNodeDelete
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<any | null>(null);
  const graphRef = useRef<any | null>(null);
  const [clickedNode, setClickedNode] = useState<CoreGraphNode | null>(null);
  const [donutPosition, setDonutPosition] = useState<{ x: number; y: number } | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved positions from node properties
  const loadNodePositions = useCallback(() => {
    const positions = new Map<string, NodePosition>();
    nodes.forEach((node) => {
      const savedPosition = node.properties?.position;
      if (savedPosition && typeof savedPosition.x === 'number' && typeof savedPosition.y === 'number') {
        positions.set(node.guid, {
          x: savedPosition.x,
          y: savedPosition.y,
          locked: savedPosition.locked || false
        });
      } else {
        // Generate initial position if none exists
        positions.set(node.guid, {
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          locked: false
        });
      }
    });
    setNodePositions(positions);
  }, [nodes]);

  // Save node position to backend
  const saveNodePosition = useCallback(async (nodeGuid: string, position: NodePosition) => {
    try {
      const node = nodes.find(n => n.guid === nodeGuid);
      if (!node) return;

      const updatedProperties = {
        ...node.properties,
        position: position
      };

      await apiClient.updateGraphNode(nodeGuid, {
        properties: updatedProperties
      });
    } catch (error) {
      console.error('Failed to save node position:', error);
    }
  }, [nodes]);

  // Handle node lock toggle
  const handleNodeLockToggle = useCallback(async (nodeGuid: string, locked: boolean) => {
    const currentPosition = nodePositions.get(nodeGuid);
    if (!currentPosition) return;

    const newPosition = { ...currentPosition, locked };
    setNodePositions(prev => new Map(prev).set(nodeGuid, newPosition));
    
    // Update the graph node position
    if (graphRef.current && sigmaRef.current) {
      const graph = graphRef.current;
      const sigma = sigmaRef.current;
      
      if (locked) {
        // Lock the node in place
        graph.setNodeAttribute(nodeGuid, 'fixed', true);
        graph.setNodeAttribute(nodeGuid, 'x', currentPosition.x);
        graph.setNodeAttribute(nodeGuid, 'y', currentPosition.y);
      } else {
        // Unlock the node
        graph.setNodeAttribute(nodeGuid, 'fixed', false);
      }
      
      sigma.refresh();
    }

    await saveNodePosition(nodeGuid, newPosition);
  }, [nodePositions, saveNodePosition]);

  // Initialize graph function
  const initializeGraph = useCallback(() => {
    if (!containerRef.current) return;

    try {
      // Create a new graph instance
      const graph = new Graph.default();
      graphRef.current = graph;

      // Add nodes to the graph with saved positions
      nodes.forEach((node) => {
        const position = nodePositions.get(node.guid) || {
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          locked: false
        };

        graph.addNode(node.guid, {
          label: node.label,
          size: 8,
          color: getNodeColor(node.node_type?.name || 'unknown'),
          x: position.x,
          y: position.y,
          fixed: position.locked, // Lock position if saved as locked
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

      // Create Sigma instance with force layout
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
        allowInvalidContainer: true, // Allow container with no height initially
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

      // Simple force layout implementation
      let animationId: number;
      const runForceLayout = () => {
        const nodes = graph.nodes();
        const edges = graph.edges();
        
        // Calculate forces
        const forces = new Map();
        nodes.forEach(nodeId => {
          if (graph.getNodeAttribute(nodeId, 'fixed')) return; // Skip locked nodes
          
          forces.set(nodeId, { x: 0, y: 0 });
        });
        
        // Repulsion between nodes
        nodes.forEach(nodeId1 => {
          if (graph.getNodeAttribute(nodeId1, 'fixed')) return;
          
          const pos1 = {
            x: graph.getNodeAttribute(nodeId1, 'x'),
            y: graph.getNodeAttribute(nodeId1, 'y')
          };
          
          nodes.forEach(nodeId2 => {
            if (nodeId1 === nodeId2 || graph.getNodeAttribute(nodeId2, 'fixed')) return;
            
            const pos2 = {
              x: graph.getNodeAttribute(nodeId2, 'x'),
              y: graph.getNodeAttribute(nodeId2, 'y')
            };
            
            const dx = pos1.x - pos2.x;
            const dy = pos1.y - pos2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              const force = 1000 / (distance * distance); // Repulsion force
              const fx = (dx / distance) * force;
              const fy = (dy / distance) * force;
              
              const currentForce = forces.get(nodeId1);
              currentForce.x += fx;
              currentForce.y += fy;
            }
          });
        });
        
        // Attraction along edges
        edges.forEach(edgeId => {
          const sourceId = graph.source(edgeId);
          const targetId = graph.target(edgeId);
          
          if (graph.getNodeAttribute(sourceId, 'fixed') && graph.getNodeAttribute(targetId, 'fixed')) return;
          
          const sourcePos = {
            x: graph.getNodeAttribute(sourceId, 'x'),
            y: graph.getNodeAttribute(sourceId, 'y')
          };
          const targetPos = {
            x: graph.getNodeAttribute(targetId, 'x'),
            y: graph.getNodeAttribute(targetId, 'y')
          };
          
          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const force = (distance - 100) * 0.01; // Attraction force
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            if (!graph.getNodeAttribute(sourceId, 'fixed')) {
              const sourceForce = forces.get(sourceId);
              sourceForce.x += fx;
              sourceForce.y += fy;
            }
            
            if (!graph.getNodeAttribute(targetId, 'fixed')) {
              const targetForce = forces.get(targetId);
              targetForce.x -= fx;
              targetForce.y -= fy;
            }
          }
        });
        
        // Apply forces
        forces.forEach((force, nodeId) => {
          const currentX = graph.getNodeAttribute(nodeId, 'x');
          const currentY = graph.getNodeAttribute(nodeId, 'y');
          
          const newX = currentX + force.x * 0.1; // Damping
          const newY = currentY + force.y * 0.1;
          
          graph.setNodeAttribute(nodeId, 'x', newX);
          graph.setNodeAttribute(nodeId, 'y', newY);
        });
        
        sigma.refresh();
        animationId = requestAnimationFrame(runForceLayout);
      };
      
      // Start force layout
      runForceLayout();

      // Store animation ID for cleanup
      const cleanup = () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        sigma.kill();
      };

      // Add event handlers
      const handleNodeClick = (event: any) => {
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (node) {
          setClickedNode(node);
          onNodeClick?.(node);
          
          // Get node position in screen coordinates
          const nodeData = graph.getNodeAttributes(nodeId);
          const nodePosition = sigma.graphToViewport({ x: nodeData.x, y: nodeData.y });
          setDonutPosition({ x: nodePosition.x, y: nodePosition.y });
        }
      };

      const handleStageClick = () => {
        setClickedNode(null);
        setDonutPosition(null);
        if (onNodeClick) {
          onNodeClick(null as any);
        }
      };

      const handleNodeDown = (event: any) => {
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (!node) return;

        // Start drag timeout
        dragTimeoutRef.current = setTimeout(() => {
          setIsDragging(true);
          setClickedNode(null);
          setDonutPosition(null);
        }, 200); // 200ms delay before considering it a drag
      };

      const handleNodeUp = (event: any) => {
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }
        
        if (isDragging) {
          setIsDragging(false);
          // Save the new position
          const nodeId = event.node;
          const node = nodes.find(n => n.guid === nodeId);
          if (node) {
            const nodeData = graph.getNodeAttributes(nodeId);
            const newPosition = {
              x: nodeData.x,
              y: nodeData.y,
              locked: true // Auto-lock when dragged
            };
            
            setNodePositions(prev => new Map(prev).set(nodeId, newPosition));
            saveNodePosition(nodeId, newPosition);
            
            // Update the graph
            graph.setNodeAttribute(nodeId, 'fixed', true);
            graph.setNodeAttribute(nodeId, 'x', newPosition.x);
            graph.setNodeAttribute(nodeId, 'y', newPosition.y);
          }
        }
      };

      const handleStageUp = () => {
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }
      };

      // Attach event handlers
      sigma.on('clickNode', handleNodeClick);
      sigma.on('clickStage', handleStageClick);
      sigma.on('downNode', handleNodeDown);
      sigma.on('upNode', handleNodeUp);
      sigma.on('upStage', handleStageUp);

      // Return cleanup function
      return cleanup;
    } catch (error) {
      console.error('Error initializing graph:', error);
    }
  }, [nodes, edges, selectedNodeGuid, onNodeClick, saveNodePosition, isDragging]);

  // Initialize graph with force layout
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing instances first
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }
    if (graphRef.current) {
      graphRef.current.clear();
      graphRef.current = null;
    }

    // Check if container has proper dimensions
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    if (rect.height === 0 || rect.width === 0) {
      // Wait for next frame and try again
      const timer = setTimeout(() => {
        if (containerRef.current) {
          const newRect = containerRef.current.getBoundingClientRect();
          if (newRect.height > 0 && newRect.width > 0) {
            // Retry initialization
            loadNodePositions();
            initializeGraph();
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }

    // Load positions first
    loadNodePositions();

    // Initialize the graph and get cleanup function
    const cleanup = initializeGraph();
    
    // Return cleanup function
    return cleanup;
  }, [nodes, edges, onNodeClick, selectedNodeGuid, loadNodePositions, saveNodePosition, isDragging, initializeGraph]);



  return (
    <div className={`relative w-full h-full bg-background ${className}`} style={{ minHeight: '500px' }}>
      <div 
        ref={containerRef} 
        className="w-full h-full" 
        style={{ 
          minHeight: '500px',
          height: '100%',
          width: '100%'
        }}
      />
      
      {/* Node Donut Interface */}
      {clickedNode && donutPosition && (
        <NodeDonut
          node={clickedNode}
          position={donutPosition}
          isLocked={nodePositions.get(clickedNode.guid)?.locked || false}
          onLockToggle={(locked: boolean) => handleNodeLockToggle(clickedNode.guid, locked)}
          onClose={() => {
            setClickedNode(null);
            setDonutPosition(null);
          }}
          onEdit={onNodeEdit}
          onDelete={onNodeDelete}
        />
      )}
    </div>
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
