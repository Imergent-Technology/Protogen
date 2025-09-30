import { useEffect, useRef, useState, useCallback } from 'react';
import { CoreGraphNode, CoreGraphEdge, apiClient } from '@protogen/shared';
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
  const [, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const isDraggingRef = useRef(false);
  const draggedNodeRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const initializationAttemptedRef = useRef(false);
  const shouldPreventCleanupRef = useRef(false);
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  // Load saved positions from node position field
  const loadNodePositions = useCallback(async () => {
    const positions = new Map<string, NodePosition>();
    
    nodes.forEach((node) => {
      if (node.position) {
        positions.set(node.guid, {
          x: node.position.x,
          y: node.position.y,
          locked: false // Allow dragging even for saved positions
        });
      } else {
        // Generate initial position if none exists
        const gridSize = Math.ceil(Math.sqrt(nodes.length));
        const index = nodes.indexOf(node);
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
    return positions; // Return the positions Map
  }, [nodes]);


  // Save node position to database with client-first updates
  const saveNodePosition = useCallback(async (nodeGuid: string, position: NodePosition) => {
    // Update local state immediately for smooth UX
    const lockedPosition = { ...position, locked: true };
    setNodePositions(prev => new Map(prev).set(nodeGuid, lockedPosition));
    
    // Defer server update for smooth performance
    setTimeout(async () => {
      try {
        await apiClient.updateNodePosition(nodeGuid, { x: position.x, y: position.y });
      } catch (error) {
        console.error('Failed to save node position to server:', error);
        // Could implement retry logic here
      }
    }, 500); // 500ms delay for batching
  }, []);

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
        const position = positions.get(node.guid) || {
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
          fixed: false, // Always allow dragging
          type: 'circle', // Explicitly set node type for Sigma.js
          nodeType: node.node_type?.name || 'unknown',
          nodeTypeDisplay: node.node_type?.display_name || 'Unknown',
          description: node.description || ''
        });
        
        // Log the actual position after adding
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
      

      // Apply saved positions to nodes (but don't fix them to allow dragging)
      positions.forEach((position, nodeGuid) => {
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
      const nodesWithoutPositions = nodes.filter(node => !positions.has(node.guid));
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
          // Removed onNodeClick to prevent opening Node Details pane on left-click
          // Node Details can be accessed via context menu instead
        }
      };

      const handleNodeRightClick = (event: any) => {
        // Prevent default browser context menu
        if (event.originalEvent) {
          event.originalEvent.preventDefault();
          event.originalEvent.stopPropagation();
        }
        // Also prevent the Sigma.js default behavior
        if (event.preventSigmaDefault) {
          event.preventSigmaDefault();
        }
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (node) {
          const actions: GraphNodeContextMenuActions = {
            onEdit: () => onNodeEdit?.(node),
            onDelete: () => onNodeDelete?.(node),
            onViewDetails: () => onNodeClick?.(node),
            onConnect: () => {
              // TODO: Implement connect functionality
            },
            onCopy: () => {
              // TODO: Implement copy functionality
            },
            onMove: () => {
              // TODO: Implement move functionality
            }
          };

          const menuItems = getGraphNodeContextMenuItems(node, actions);
          // Convert graph coordinates to screen coordinates
          const graphPosition = sigmaRef.current?.graphToViewport({
            x: graph.getNodeAttribute(nodeId, 'x'),
            y: graph.getNodeAttribute(nodeId, 'y')
          });
          
          // Get the container's bounding rectangle
          const containerRect = containerRef.current?.getBoundingClientRect();
          
          // Calculate screen coordinates
          const screenX = (containerRect?.left || 0) + (graphPosition?.x || 0);
          const screenY = (containerRect?.top || 0) + (graphPosition?.y || 0);
          
          
          // Create a proper mouse event for the context menu
          const mouseEvent = event.originalEvent || new MouseEvent('contextmenu', {
            clientX: screenX,
            clientY: screenY
          });
          showContextMenu(mouseEvent, menuItems, node.guid);
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

  // Track the last mouse button pressed globally
  const lastMouseButtonRef = useRef(0);
  
  // Add global mouse event listener to track button
  const handleGlobalMouseDown = useCallback((e: MouseEvent) => {
    lastMouseButtonRef.current = e.button;
  }, []);
  
  const handleGlobalMouseUp = useCallback(() => {
    // Reset after a short delay to allow for event processing
    setTimeout(() => {
      lastMouseButtonRef.current = 0;
    }, 10);
  }, []);
  
  // Prevent right-click from triggering downNode
  const preventRightClickDown = useCallback((e: MouseEvent) => {
    if (e.button === 2) { // Right-click
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  // Initialize graph with force layout (only once)
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current || initializationAttemptedRef.current) {
      return;
    }

    // Don't clean up if we already have a working instance
    if (sigmaRef.current && graphRef.current && isInitializedRef.current) {
      return;
    }

    initializationAttemptedRef.current = true;

    // Check if container has proper dimensions
    const container = containerRef.current!;
    const rect = container.getBoundingClientRect();
    
    if (rect.height === 0 || rect.width === 0) {
      // Wait for next frame and try again
      const timer = setTimeout(() => {
        if (containerRef.current! && !isInitializedRef.current) {
          const newRect = containerRef.current!.getBoundingClientRect();
          if (newRect.height > 0 && newRect.width > 0) {
            // Retry initialization
            loadNodePositions();
            // Graph initialization moved to main effect
          } else {
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
    let initTimer: number;
    
    loadNodePositions().then((positions) => {
      // Add a small delay to ensure container is properly sized
      initTimer = setTimeout(() => {
      if (!containerRef.current) {
        return;
      }
      
      const rect = containerRef.current.getBoundingClientRect();
      
      if (rect.width < 100 || rect.height < 100) {
        // Force minimum size
        if (containerRef.current) {
          containerRef.current.style.minHeight = '400px';
          containerRef.current.style.minWidth = '400px';
        }
        setTimeout(() => {
          if (containerRef.current) {
            const newRect = containerRef.current.getBoundingClientRect();
            if (newRect.width > 100 && newRect.height > 100) {
              // Retry initialization
              initializeGraphInline(positions);
            }
          }
        }, 200);
        return;
      }
      
      // Initialize the graph directly in the effect to avoid function recreation
      initializeGraphInline(positions);
    }, 100);
    
    const initializeGraphInline = (positions: Map<string, NodePosition>) => {
      try {
      // Create a new graph instance
      const graph = new Graph.default();
      graphRef.current = graph;

      // Add nodes to the graph with saved positions
      nodes.forEach((node) => {
        const position = positions.get(node.guid) || {
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
          fixed: false, // Always allow dragging
          type: 'circle', // Explicitly set node type for Sigma.js
          nodeType: node.node_type?.name || 'unknown',
          nodeTypeDisplay: node.node_type?.display_name || 'Unknown',
          description: node.description || ''
        });
        
        // Log the actual position after adding
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
      

      // Apply saved positions to nodes (but don't fix them to allow dragging)
      positions.forEach((position, nodeGuid) => {
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
      const nodesWithoutPositions = nodes.filter(node => !positions.has(node.guid));
      if (nodesWithoutPositions.length > 0) {
        // Run a simple layout for new nodes only
        const runInitialLayout = () => {
          const forces = new Map();
          
          // Initialize forces only for nodes without positions
          nodesWithoutPositions.forEach(node => {
            if (graph.hasNode(node.guid)) {
              forces.set(node.guid, { x: 0, y: 0 });
            }
          });
          
          // Calculate repulsion forces between new nodes and existing nodes
          nodesWithoutPositions.forEach(node1 => {
            if (!graph.hasNode(node1.guid)) return;
            
            const pos1 = {
              x: graph.getNodeAttribute(node1.guid, 'x'),
              y: graph.getNodeAttribute(node1.guid, 'y')
            };
            
            // Repulsion from all other nodes (both new and existing)
            graph.nodes().forEach(nodeId2 => {
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
          
          // Apply forces only to new nodes
          forces.forEach((force, nodeGuid) => {
            const currentX = graph.getNodeAttribute(nodeGuid, 'x');
            const currentY = graph.getNodeAttribute(nodeGuid, 'y');
            
            const newX = currentX + force.x * 0.5;
            const newY = currentY + force.y * 0.5;
            
            graph.setNodeAttribute(nodeGuid, 'x', newX);
            graph.setNodeAttribute(nodeGuid, 'y', newY);
          });
          
          // Ensure all nodes have zero velocity
          graph.nodes().forEach(nodeId => {
            graph.setNodeAttribute(nodeId, 'vx', 0);
            graph.setNodeAttribute(nodeId, 'vy', 0);
          });
          
          sigma.refresh();
        };
        
        // Run initial layout for new nodes only
        runInitialLayout();
      }

      // Add event handlers
      const handleNodeClick = (event: any) => {
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (node) {
          // Removed onNodeClick to prevent opening Node Details pane on left-click
          // Node Details can be accessed via context menu instead
        }
      };

      const handleNodeRightClick = (event: any) => {
        // Prevent default browser context menu
        if (event.originalEvent) {
          event.originalEvent.preventDefault();
          event.originalEvent.stopPropagation();
        }
        // Also prevent the Sigma.js default behavior
        if (event.preventSigmaDefault) {
          event.preventSigmaDefault();
        }
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (node) {
          const actions: GraphNodeContextMenuActions = {
            onEdit: () => onNodeEdit?.(node),
            onDelete: () => onNodeDelete?.(node),
            onViewDetails: () => onNodeClick?.(node),
            onConnect: () => {
              // TODO: Implement connect functionality
            },
            onCopy: () => {
              // TODO: Implement copy functionality
            },
            onMove: () => {
              // TODO: Implement move functionality
            }
          };

          const menuItems = getGraphNodeContextMenuItems(node, actions);
          // Convert graph coordinates to screen coordinates
          const graphPosition = sigmaRef.current?.graphToViewport({
            x: graph.getNodeAttribute(nodeId, 'x'),
            y: graph.getNodeAttribute(nodeId, 'y')
          });
          
          // Get the container's bounding rectangle
          const containerRect = containerRef.current?.getBoundingClientRect();
          
          // Calculate screen coordinates
          const screenX = (containerRect?.left || 0) + (graphPosition?.x || 0);
          const screenY = (containerRect?.top || 0) + (graphPosition?.y || 0);
          
          
          // Create a proper mouse event for the context menu
          const mouseEvent = event.originalEvent || new MouseEvent('contextmenu', {
            clientX: screenX,
            clientY: screenY
          });
          showContextMenu(mouseEvent, menuItems, node.guid);
        }
      };

      const handleCanvasClick = () => {
        hideContextMenu();
        if (onNodeClick) {
          onNodeClick(null as any);
        }
      };

      if (containerRef.current) {
        containerRef.current.addEventListener('mousedown', handleGlobalMouseDown);
        containerRef.current.addEventListener('mouseup', handleGlobalMouseUp);
      }

      // Handle drag start
      const handleNodeDown = (event: any) => {
        // Check if this is a right-click (button 2) or middle-click (button 1)
        if (lastMouseButtonRef.current === 2 || lastMouseButtonRef.current === 1) {
          return;
        }
        
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (node) {
          // Clear any previous drag state
          isDraggingRef.current = false;
          draggedNodeRef.current = null;
          
          // Start new drag
          isDraggingRef.current = true;
          draggedNodeRef.current = nodeId;
          
          // Temporarily unfix the node for dragging
          graph.setNodeAttribute(nodeId, 'fixed', false);
        }
      };

      // Handle drag end
      const handleNodeUp = (event: any) => {
        const nodeId = event.node;
        const node = nodes.find(n => n.guid === nodeId);
        if (node) {
          isDraggingRef.current = false;
          draggedNodeRef.current = null;
          
          // Get the new position
          const newX = graph.getNodeAttribute(nodeId, 'x');
          const newY = graph.getNodeAttribute(nodeId, 'y');
          
          // Save the new position
          saveNodePosition(nodeId, { x: newX, y: newY, locked: false });
          
          // Keep the node unfixed to allow future dragging
          graph.setNodeAttribute(nodeId, 'fixed', false);
        }
      };

      // Handle canvas mouse up (in case drag ends outside node)
      const handleCanvasUp = () => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          draggedNodeRef.current = null;
        }
      };

      // Add event listeners
      sigma.on('clickNode', handleNodeClick);
      sigma.on('rightClickNode', (event) => {
        handleNodeRightClick(event);
      });
      sigma.on('clickStage', handleCanvasClick);
      
      // Use downNode but with better button detection
      sigma.on('downNode', handleNodeDown);
      
      // Add a direct mousedown listener to prevent right-click from triggering downNode
      if (containerRef.current) {
        containerRef.current.addEventListener('mousedown', preventRightClickDown, true); // Use capture phase
      }
      
      sigma.on('upNode', handleNodeUp);
      sigma.on('upStage', handleCanvasUp);
      
      // Add mouse move handler for manual node dragging
      const handleMouseMove = (e: MouseEvent) => {
        if (isDraggingRef.current && sigmaRef.current && draggedNodeRef.current) {
          const nodeId = draggedNodeRef.current;
          
          // Prevent default to stop viewport panning
          e.preventDefault();
          e.stopPropagation();
          
          // Get mouse position relative to the container
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Convert screen coordinates to graph coordinates using Sigma instance
            const graphCoords = sigmaRef.current.viewportToGraph({ x, y });
            
            // Update node position
            graph.setNodeAttribute(nodeId, 'x', graphCoords.x);
            graph.setNodeAttribute(nodeId, 'y', graphCoords.y);
            
            // Refresh the graph
            sigmaRef.current.refresh();
          }
        }
      };
      
      // Add mouse move listener to the container
      const container = containerRef.current;
      if (container) {
        container.addEventListener('mousemove', handleMouseMove);
        
        const preventContextMenu = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
        };
        container.addEventListener('contextmenu', preventContextMenu);
        
        // Store the event listeners for cleanup
        (sigma as any)._contextMenuListener = preventContextMenu;
        (sigma as any)._mouseMoveListener = handleMouseMove;
      }
      } catch (error) {
        console.error('Error initializing graph:', error);
      }

      // Mark graph as initialized
      isInitializedRef.current = true;
      
      // Force immediate render to ensure visibility
      if (graphRef.current.order > 0) {
        // Get the graph bounds to position the camera correctly
        sigmaRef.current.getBBox();
        
        // Reset camera to fit the graph
        sigmaRef.current.getCamera().animatedReset();
        
        // Try to fit the graph in view
        try {
          sigmaRef.current.getCamera().animatedReset({
            duration: 0
          });
        } catch (error) {
          console.log('Camera fit failed, using reset:', error);
        }
        
        // Force render
        sigmaRef.current.refresh();
        sigmaRef.current.render();
      }
      
      // Force a refresh to ensure the graph is visible
      setTimeout(() => {
        if (sigmaRef.current) {
          sigmaRef.current.refresh();
          
          // Ensure camera is positioned to show the graph
          sigmaRef.current.getCamera();
          
          // Fit the graph in view
          sigmaRef.current.getCamera().animatedReset();
          
          // Force a render
          sigmaRef.current.render();
          
          // Try to fit the graph in view with proper zoom
          setTimeout(() => {
            if (sigmaRef.current) {
              sigmaRef.current.getCamera().animatedReset();
              sigmaRef.current.render();
            }
          }, 200);
        }
      }, 100);
      
      // Additional delayed initialization to ensure visibility
      setTimeout(() => {
        if (sigmaRef.current && containerRef.current) {
          const container = containerRef.current;
          const rect = container.getBoundingClientRect();
          
          if (rect.width > 0 && rect.height > 0) {
            // Ensure camera is positioned to show the graph
            sigmaRef.current.getBBox();
            
            // Reset camera to fit the graph
            sigmaRef.current.getCamera().animatedReset();
            
            // Try to fit the graph in view
            try {
              sigmaRef.current.getCamera().animatedReset({
                duration: 0
              });
            } catch (error) {
              console.log('Camera fit failed in delayed check, using reset:', error);
            }
            
            sigmaRef.current.refresh();
            sigmaRef.current.render();
          } else {
            // Force minimum size and retry
            container.style.minHeight = '400px';
            container.style.minWidth = '400px';
            setTimeout(() => {
              if (sigmaRef.current) {
                // Reset camera to fit the graph
                sigmaRef.current.getCamera().animatedReset();
                
                // Try to fit the graph in view
                try {
                  sigmaRef.current.getCamera().animatedReset({
                    duration: 0
                  });
                } catch (error) {
                  console.log('Camera fit failed in retry, using reset:', error);
                }
                
                sigmaRef.current.refresh();
                sigmaRef.current.render();
              }
            }, 100);
          }
        }
      }, 500);
    };
    
    // Mark that we should prevent cleanup
    shouldPreventCleanupRef.current = true;
    }).catch((error) => {
      console.error('Error loading node positions:', error);
      initializationAttemptedRef.current = false;
    });
    
    // Return cleanup function
    return () => {
      clearTimeout(initTimer);
      
      // Clean up context menu event listener
      const container = containerRef.current;
      if (container && sigmaRef.current && (sigmaRef.current as any)._contextMenuListener) {
        container.removeEventListener('contextmenu', (sigmaRef.current as any)._contextMenuListener);
      }
      
      // Clean up global mouse event listeners
      if (container) {
        container.removeEventListener('mousedown', handleGlobalMouseDown);
        container.removeEventListener('mouseup', handleGlobalMouseUp);
        // Clean up the right-click prevention listener
        container.removeEventListener('mousedown', preventRightClickDown, true);
      }
      
      if (!shouldPreventCleanupRef.current) {
        if (sigmaRef.current) {
          sigmaRef.current.kill();
          sigmaRef.current = null;
        }
        if (graphRef.current) {
          graphRef.current.clear();
          graphRef.current = null;
        }
      } else {
      }
    };
  }, [nodes, edges]);

  // Handle node selection visual updates (without reinitializing graph)
  useEffect(() => {
    if (!sigmaRef.current || !graphRef.current || !isInitializedRef.current) {
      return;
    }

    // Add a small delay to ensure graph is fully rendered
    const updateTimer = setTimeout(() => {
      if (!sigmaRef.current || !graphRef.current) {
        return;
      }

      const graph = graphRef.current;

    // Update node visual states based on selection
    graph.nodes().forEach((nodeId: string) => {
      const isSelected = nodeId === selectedNodeGuid;
      
      if (isSelected) {
        // Highlight selected node
        graph.setNodeAttribute(nodeId, 'color', '#3b82f6');
        graph.setNodeAttribute(nodeId, 'size', 20);
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
