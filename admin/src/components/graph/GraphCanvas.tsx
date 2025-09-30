import { useEffect, useRef, useState, useCallback } from 'react';
import { CoreGraphNode, CoreGraphEdge } from '@protogen/shared';
import * as Sigma from 'sigma';
import * as Graph from 'graphology';
import { ContextMenu, useContextMenu, getGraphNodeContextMenuItems, GraphNodeContextMenuActions } from '../common/ContextMenu';

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
  // Note: clickedNode state removed as we now use context menu
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const isInitializedRef = useRef(false);
  const initializationAttemptedRef = useRef(false);
  const shouldPreventCleanupRef = useRef(false);
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  // Load saved positions from SceneItem database (temporarily disabled for testing)
  const loadNodePositions = useCallback(async () => {
    // Temporarily use fallback positioning until API issues are resolved
    loadFallbackPositions();
  }, [nodes]);

  // Fallback positioning when database is not available
  const loadFallbackPositions = useCallback(() => {
    const positions = new Map<string, NodePosition>();
    nodes.forEach((node, index) => {
      const savedPosition = node.properties?.position;
      if (savedPosition && typeof savedPosition.x === 'number' && typeof savedPosition.y === 'number') {
        positions.set(node.guid, {
          x: savedPosition.x,
          y: savedPosition.y,
          locked: true
        });
      } else {
        // Generate consistent grid-based position instead of random
        const gridSize = Math.ceil(Math.sqrt(nodes.length));
        const x = (index % gridSize) * 200 + 100;
        const y = Math.floor(index / gridSize) * 200 + 100;
        
        positions.set(node.guid, {
          x: x,
          y: y,
          locked: false
        });
      }
    });
    setNodePositions(positions);
  }, [nodes]);

  // Save node position to SceneItem database (temporarily disabled for testing)
  const saveNodePosition = useCallback(async (nodeGuid: string, position: NodePosition) => {
    // Temporarily just update local state until API issues are resolved
    const lockedPosition = { ...position, locked: true };
    setNodePositions(prev => new Map(prev).set(nodeGuid, lockedPosition));
  }, [nodes]);

  // Note: Lock functionality removed as nodes are now freely draggable but maintain position

  // Initialize graph function
  // Old initializeGraph function removed - logic moved to main effect
  /*
  const _initializeGraph = useCallback(() => {
    console.log('initializeGraph called');
    if (!containerRef.current!) {
      console.log('No container ref, skipping graph initialization');
      return;
    }

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
          type: 'circle', // Explicitly set node type for Sigma.js
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

      // Create Sigma instance with drag enabled but layout algorithms disabled
      const sigma = new Sigma.default(graph, containerRef.current!, {
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
        // Enable node dragging but disable layout algorithms
        enableEdgeEvents: false, // Disable edge interactions that might trigger layout
        // Disable any automatic layout features
        defaultNodeColor: '#666',
        defaultEdgeColor: '#ccc',
        // Force static rendering
        renderLabels: true,
        renderEdgeLabels: false, // Disable edge labels to reduce complexity
      });

      sigmaRef.current = sigma;
      console.log('Sigma instance created successfully');

      // Apply saved positions to nodes (but don't fix them to allow dragging)
      nodePositions.forEach((position, nodeGuid) => {
        if (graph.hasNode(nodeGuid)) {
          graph.setNodeAttribute(nodeGuid, 'x', position.x);
          graph.setNodeAttribute(nodeGuid, 'y', position.y);
          // Don't set fixed: true to allow dragging
        }
      });

      // Set initial positions but don't fix nodes (allow dragging)
      graph.nodes().forEach(nodeId => {
        // Set initial position
        graph.setNodeAttribute(nodeId, 'x', graph.getNodeAttribute(nodeId, 'x'));
        graph.setNodeAttribute(nodeId, 'y', graph.getNodeAttribute(nodeId, 'y'));
        // Don't set fixed: true to allow dragging
        // But disable velocity to prevent automatic movement
        graph.setNodeAttribute(nodeId, 'vx', 0);
        graph.setNodeAttribute(nodeId, 'vy', 0);
      });

      // Only run layout for nodes without saved positions
      const nodesWithoutPositions = nodes.filter(node => !nodePositions.has(node.guid));
      if (nodesWithoutPositions.length > 0) {
        // Run a single layout pass for new nodes only
        const runInitialLayout = () => {
          const nodes = graph.nodes();
          
          // Calculate forces only for nodes without positions
          const forces = new Map();
          nodesWithoutPositions.forEach(node => {
            if (graph.hasNode(node.guid)) {
              forces.set(node.guid, { x: 0, y: 0 });
            }
          });
          
          // Repulsion between new nodes and existing nodes
          nodesWithoutPositions.forEach(node1 => {
            if (!graph.hasNode(node1.guid)) return;
            
            const pos1 = {
              x: graph.getNodeAttribute(node1.guid, 'x'),
              y: graph.getNodeAttribute(node1.guid, 'y')
            };
            
            nodes.forEach(nodeId2 => {
              if (node1.guid === nodeId2) return;
              
              const pos2 = {
                x: graph.getNodeAttribute(nodeId2, 'x'),
                y: graph.getNodeAttribute(nodeId2, 'y')
              };
              
              const dx = pos1.x - pos2.x;
              const dy = pos1.y - pos2.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance > 0 && distance < 200) {
                const force = 1000 / (distance * distance);
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;
                
                const currentForce = forces.get(node1.guid);
                currentForce.x += fx;
                currentForce.y += fy;
              }
            });
          });
          
          // Apply forces once and fix the nodes
          forces.forEach((force, nodeGuid) => {
            const currentX = graph.getNodeAttribute(nodeGuid, 'x');
            const currentY = graph.getNodeAttribute(nodeGuid, 'y');
            
            const newX = currentX + force.x * 0.5;
            const newY = currentY + force.y * 0.5;
            
            graph.setNodeAttribute(nodeGuid, 'x', newX);
            graph.setNodeAttribute(nodeGuid, 'y', newY);
            graph.setNodeAttribute(nodeGuid, 'fixed', true); // Fix after initial positioning
          });
          
          // Ensure all nodes have zero velocity after layout (but don't fix them)
          graph.nodes().forEach(nodeId => {
            graph.setNodeAttribute(nodeId, 'vx', 0);
            graph.setNodeAttribute(nodeId, 'vy', 0);
            // Don't set fixed: true to allow dragging
          });
          
          sigma.refresh();
        };
        
        // Run initial layout once
        runInitialLayout();
      }

      // Store cleanup function
      const cleanup = () => {
        sigma.kill();
      };

      // Add event handlers
      const handleNodeClick = (event: any) => {
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (node) {
          onNodeClick?.(node);
        }
      };

      const handleNodeRightClick = (event: any) => {
        event.preventDefault();
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (node) {
          const actions: GraphNodeContextMenuActions = {
            onEdit: () => onNodeEdit?.(node),
            onDelete: () => onNodeDelete?.(node),
            onViewDetails: () => onNodeClick?.(node),
            onConnect: () => {
              // TODO: Implement connect functionality
              console.log('Connect to node:', node.label);
            },
            onCopy: () => {
              // TODO: Implement copy functionality
              console.log('Copy node:', node.label);
            },
            onMove: () => {
              // TODO: Implement move functionality
              console.log('Move node:', node.label);
            }
          };

          const menuItems = getGraphNodeContextMenuItems(node, actions);
          showContextMenu(event.originalEvent, menuItems, node.guid);
        }
      };

      const handleCanvasClick = () => {
        hideContextMenu();
        if (onNodeClick) {
          onNodeClick(null as any);
        }
      };

      // Handle drag start
      const handleNodeDown = (event: any) => {
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (!node) return;
        
        setIsDragging(true);
        // Temporarily unfix the node to allow dragging
        graph.setNodeAttribute(nodeId, 'fixed', false);
      };

      // Handle drag end
      const handleNodeUp = (event: any) => {
        if (!isDragging) return;
        
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (!node) return;
        
        setIsDragging(false);
        
        // Get the final position
        const nodeData = graph.getNodeAttributes(nodeId);
        const newPosition = {
          x: nodeData.x,
          y: nodeData.y,
          locked: true // Auto-lock after dragging
        };
        
        // Save the new position
        setNodePositions(prev => new Map(prev).set(nodeId, newPosition));
        saveNodePosition(nodeId, newPosition);
        
        // Fix the node in its new position
        graph.setNodeAttribute(nodeId, 'fixed', true);
        graph.setNodeAttribute(nodeId, 'x', newPosition.x);
        graph.setNodeAttribute(nodeId, 'y', newPosition.y);
        graph.setNodeAttribute(nodeId, 'vx', 0);
        graph.setNodeAttribute(nodeId, 'vy', 0);
      };

      // Handle canvas drag end
      const handleCanvasUp = () => {
        if (isDragging) {
          setIsDragging(false);
        }
      };

      // Attach event handlers with proper drag support
      sigma.on('clickNode', handleNodeClick);
      sigma.on('rightClickNode', handleNodeRightClick);
      sigma.on('clickStage', handleCanvasClick);
      sigma.on('downNode', handleNodeDown);
      sigma.on('upNode', handleNodeUp);
      sigma.on('upStage', handleCanvasUp);

      // Return cleanup function
      return cleanup;
    } catch (error) {
      console.error('Error initializing graph:', error);
    }
  }, [nodes, edges, onNodeClick, saveNodePosition]);
  */

  // Initialize graph with force layout (only once)
  useEffect(() => {
    console.log('Graph initialization effect triggered');
    if (!containerRef.current || isInitializedRef.current || initializationAttemptedRef.current) {
      console.log('Graph initialization skipped - container not ready, already initialized, or attempt in progress');
      return;
    }

    // Don't clean up if we already have a working instance
    if (sigmaRef.current && graphRef.current && isInitializedRef.current) {
      console.log('Graph already initialized and working, skipping');
      return;
    }

    initializationAttemptedRef.current = true;

    // Check if container has proper dimensions
    const container = containerRef.current!;
    const rect = container.getBoundingClientRect();
    
    if (rect.height === 0 || rect.width === 0) {
      console.log('Container not ready, waiting for proper dimensions');
      // Wait for next frame and try again
      const timer = setTimeout(() => {
        if (containerRef.current! && !isInitializedRef.current) {
          const newRect = containerRef.current!.getBoundingClientRect();
          if (newRect.height > 0 && newRect.width > 0) {
            console.log('Container ready, retrying initialization');
            // Retry initialization
            loadNodePositions();
            // Graph initialization moved to main effect
          } else {
            console.log('Container still not ready, giving up');
            initializationAttemptedRef.current = false;
          }
        }
      }, 200);
      
      return () => {
        clearTimeout(timer);
        initializationAttemptedRef.current = false;
      };
    }

    // Load positions first
    loadNodePositions();

    // Add a small delay to ensure container is properly sized
    const initTimer = setTimeout(() => {
      if (!containerRef.current) {
        console.log('Container ref not available');
        return;
      }
      
      const rect = containerRef.current.getBoundingClientRect();
      console.log('Container dimensions:', rect.width, 'x', rect.height);
      console.log('Container element:', containerRef.current);
      
      if (rect.width < 100 || rect.height < 100) {
        console.log('Container not properly sized, retrying...');
        // Force minimum size
        if (containerRef.current) {
          containerRef.current.style.minHeight = '400px';
          containerRef.current.style.minWidth = '400px';
        }
        setTimeout(() => {
          if (containerRef.current) {
            const newRect = containerRef.current.getBoundingClientRect();
            console.log('Retry container dimensions:', newRect.width, 'x', newRect.height);
            if (newRect.width > 100 && newRect.height > 100) {
              // Retry initialization
              initializeGraphInline();
            }
          }
        }, 200);
        return;
      }
      
      // Initialize the graph directly in the effect to avoid function recreation
      initializeGraphInline();
    }, 100);
    
    const initializeGraphInline = () => {
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
          type: 'circle', // Explicitly set node type for Sigma.js
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

      // Create Sigma instance with drag enabled but layout algorithms disabled
      const sigma = new Sigma.default(graph, containerRef.current!, {
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
        // Enable node dragging but disable layout algorithms
        enableEdgeEvents: false, // Disable edge interactions that might trigger layout
        // Disable any automatic layout features
        defaultNodeColor: '#666',
        defaultEdgeColor: '#ccc',
        // Force static rendering
        renderLabels: true,
        renderEdgeLabels: false, // Disable edge labels to reduce complexity
      });

      sigmaRef.current = sigma;
      console.log('Sigma instance created successfully');

      // Apply saved positions to nodes (but don't fix them to allow dragging)
      nodePositions.forEach((position, nodeGuid) => {
        if (graph.hasNode(nodeGuid)) {
          graph.setNodeAttribute(nodeGuid, 'x', position.x);
          graph.setNodeAttribute(nodeGuid, 'y', position.y);
          // Don't set fixed: true to allow dragging
        }
      });

      // Set initial positions but don't fix nodes (allow dragging)
      graph.nodes().forEach(nodeId => {
        // Set initial position
        graph.setNodeAttribute(nodeId, 'x', graph.getNodeAttribute(nodeId, 'x'));
        graph.setNodeAttribute(nodeId, 'y', graph.getNodeAttribute(nodeId, 'y'));
        // Don't set fixed: true to allow dragging
        // But disable velocity to prevent automatic movement
        graph.setNodeAttribute(nodeId, 'vx', 0);
        graph.setNodeAttribute(nodeId, 'vy', 0);
      });

      // Run initial layout to spread nodes
      const runInitialLayout = () => {
        // Simple force-directed layout for initial positioning
        const forces = new Map();
        
        // Initialize forces
        graph.nodes().forEach(nodeId => {
          forces.set(nodeId, { x: 0, y: 0 });
        });
        
        // Calculate repulsion forces between all nodes
        graph.nodes().forEach(nodeId1 => {
          const node1 = nodes.find(n => n.guid === nodeId1);
          if (!node1) return;
          
          graph.nodes().forEach(nodeId2 => {
            if (nodeId1 === nodeId2) return;
            
            const node2 = nodes.find(n => n.guid === nodeId2);
            if (!node2) return;
            
            const pos1 = {
              x: graph.getNodeAttribute(nodeId1, 'x'),
              y: graph.getNodeAttribute(nodeId1, 'y')
            };
            const pos2 = {
              x: graph.getNodeAttribute(nodeId2, 'x'),
              y: graph.getNodeAttribute(nodeId2, 'y')
            };
            
            const dx = pos1.x - pos2.x;
            const dy = pos1.y - pos2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < 200) {
              const force = 1000 / (distance * distance);
              const fx = (dx / distance) * force;
              const fy = (dy / distance) * force;
              
              const currentForce = forces.get(nodeId1);
              currentForce.x += fx;
              currentForce.y += fy;
            }
          });
        });
        
        // Apply forces once and fix the nodes
        forces.forEach((force, nodeGuid) => {
          const currentX = graph.getNodeAttribute(nodeGuid, 'x');
          const currentY = graph.getNodeAttribute(nodeGuid, 'y');
          
          const newX = currentX + force.x * 0.5;
          const newY = currentY + force.y * 0.5;
          
          graph.setNodeAttribute(nodeGuid, 'x', newX);
          graph.setNodeAttribute(nodeGuid, 'y', newY);
          graph.setNodeAttribute(nodeGuid, 'fixed', true); // Fix after initial positioning
        });
        
        // Ensure all nodes have zero velocity after layout (but don't fix them)
        graph.nodes().forEach(nodeId => {
          graph.setNodeAttribute(nodeId, 'vx', 0);
          graph.setNodeAttribute(nodeId, 'vy', 0);
          // Don't set fixed: true to allow dragging
        });
        
        sigma.refresh();
      };
      
      // Run initial layout once
      runInitialLayout();

      // Add event handlers
      const handleNodeClick = (event: any) => {
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (node) {
          onNodeClick?.(node);
        }
      };

      const handleNodeRightClick = (event: any) => {
        event.preventDefault();
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (node) {
          const actions: GraphNodeContextMenuActions = {
            onEdit: () => onNodeEdit?.(node),
            onDelete: () => onNodeDelete?.(node),
            onViewDetails: () => onNodeClick?.(node),
            onConnect: () => {
              // TODO: Implement connect functionality
              console.log('Connect to node:', node.label);
            },
            onCopy: () => {
              // TODO: Implement copy functionality
              console.log('Copy node:', node.label);
            },
            onMove: () => {
              // TODO: Implement move functionality
              console.log('Move node:', node.label);
            }
          };

          const menuItems = getGraphNodeContextMenuItems(node, actions);
          showContextMenu(event.originalEvent, menuItems, node.guid);
        }
      };

      const handleCanvasClick = () => {
        hideContextMenu();
        if (onNodeClick) {
          onNodeClick(null as any);
        }
      };

      // Handle drag start
      const handleNodeDown = (event: any) => {
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (node) {
          setIsDragging(true);
          // Temporarily unfix the node for dragging
          graph.setNodeAttribute(nodeId, 'fixed', false);
        }
      };

      // Handle drag end
      const handleNodeUp = (event: any) => {
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (node) {
          setIsDragging(false);
          
          // Get the new position
          const newX = graph.getNodeAttribute(nodeId, 'x');
          const newY = graph.getNodeAttribute(nodeId, 'y');
          
          // Save the new position
          saveNodePosition(nodeId, { x: newX, y: newY, locked: true });
          
          // Fix the node after dragging
          graph.setNodeAttribute(nodeId, 'fixed', true);
        }
      };

      // Handle canvas mouse up (in case drag ends outside node)
      const handleCanvasUp = () => {
        if (isDragging) {
          setIsDragging(false);
        }
      };

      // Add event listeners
      sigma.on('clickNode', handleNodeClick);
      sigma.on('rightClickNode', handleNodeRightClick);
      sigma.on('clickStage', handleCanvasClick);
      sigma.on('downNode', handleNodeDown);
      sigma.on('upNode', handleNodeUp);
      sigma.on('upStage', handleCanvasUp);
      } catch (error) {
        console.error('Error initializing graph:', error);
      }

      // Mark graph as initialized
      isInitializedRef.current = true;
    };
    
    // Mark that we should prevent cleanup
    shouldPreventCleanupRef.current = true;

    // Return cleanup function
    return () => {
      clearTimeout(initTimer);
      if (!shouldPreventCleanupRef.current) {
        console.log('Cleaning up graph instances');
        if (sigmaRef.current) {
          console.log('Killing Sigma instance in cleanup');
          sigmaRef.current.kill();
          sigmaRef.current = null;
        }
        if (graphRef.current) {
          console.log('Clearing graph in cleanup');
          graphRef.current.clear();
          graphRef.current = null;
        }
      } else {
        console.log('Preventing graph cleanup');
      }
    };
  }, [nodes, edges]);

  // Handle node selection visual updates (without reinitializing graph)
  useEffect(() => {
    if (!sigmaRef.current || !graphRef.current || !isInitializedRef.current) {
      console.log('Graph not ready for selection update');
      return;
    }

    // Add a small delay to ensure graph is fully rendered
    const updateTimer = setTimeout(() => {
      if (!sigmaRef.current || !graphRef.current) {
        console.log('Graph no longer available for selection update');
        return;
      }

      console.log('Updating node selection for:', selectedNodeGuid);
      const graph = graphRef.current;

    // Update node visual states based on selection
    graph.nodes().forEach((nodeId: string) => {
      const isSelected = nodeId === selectedNodeGuid;
      
      if (isSelected) {
        // Highlight selected node
        graph.setNodeAttribute(nodeId, 'color', '#3b82f6');
        graph.setNodeAttribute(nodeId, 'size', 20);
        console.log('Highlighted node:', nodeId);
      } else {
        // Reset to default appearance
        graph.setNodeAttribute(nodeId, 'color', '#666');
        graph.setNodeAttribute(nodeId, 'size', 15);
      }
    });

      // Don't call sigma.refresh() as it causes the renderer error
      // Sigma.js will automatically re-render when attributes change
    }, 50); // Small delay to ensure graph is ready

    return () => clearTimeout(updateTimer);
  }, [selectedNodeGuid]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isInitializedRef.current = false;
      initializationAttemptedRef.current = false;
    };
  }, []);

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
      
      {/* Context Menu */}
      <ContextMenu
        items={contextMenu.items}
        isOpen={contextMenu.isOpen}
        onClose={hideContextMenu}
        position={contextMenu.position}
      />
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
