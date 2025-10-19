import { useEffect, useRef, useState, useCallback } from 'react';
import { CoreGraphNode, CoreGraphEdge } from '../../../types';
import * as Sigma from 'sigma';
import * as Graph from 'graphology';
import { GraphCanvasProps, NodePosition } from '../types';
import { getNodeColor, getEdgeColor, getSelectionColor } from '../utils';

/**
 * GraphCanvas Component
 * 
 * Core graph visualization using Sigma.js and Graphology.
 * Handles node positioning, dragging, selection, and rendering.
 */
export function GraphCanvas({
  nodes,
  edges,
  onNodeClick,
  onNodeRightClick,
  selectedNodeGuid,
  className = '',
  config = {},
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<any | null>(null);
  const graphRef = useRef<any | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const isDraggingRef = useRef(false);
  const draggedNodeRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);
  const initializationAttemptedRef = useRef(false);
  const lastMouseButtonRef = useRef(0);

  // Configuration with defaults
  const {
    enableDragging = true,
    enableSelection = true,
    minCameraRatio = 0.1,
    maxCameraRatio = 10,
    labelRenderedSizeThreshold = 6,
    nodeColors,
    edgeColors,
  } = config;

  // Load saved positions from nodes
  const loadNodePositions = useCallback(async () => {
    const positions = new Map<string, NodePosition>();
    
    nodes.forEach((node, index) => {
      if (node.position) {
        positions.set(node.guid, {
          x: node.position.x,
          y: node.position.y,
          locked: false,
        });
      } else {
        // Generate initial grid position
        const gridSize = Math.ceil(Math.sqrt(nodes.length));
        const x = (index % gridSize) * 200 + 100;
        const y = Math.floor(index / gridSize) * 200 + 100;
        
        positions.set(node.guid, { x, y, locked: false });
      }
    });
    
    setNodePositions(positions);
    return positions;
  }, [nodes]);

  // Track mouse button globally
  const handleGlobalMouseDown = useCallback((e: MouseEvent) => {
    lastMouseButtonRef.current = e.button;
  }, []);
  
  const handleGlobalMouseUp = useCallback(() => {
    setTimeout(() => {
      lastMouseButtonRef.current = 0;
    }, 10);
  }, []);

  // Initialize graph
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current || initializationAttemptedRef.current) {
      return;
    }

    if (sigmaRef.current && graphRef.current && isInitializedRef.current) {
      return;
    }

    initializationAttemptedRef.current = true;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    if (rect.height === 0 || rect.width === 0) {
      const timer = setTimeout(() => {
        if (containerRef.current && !isInitializedRef.current) {
          const newRect = containerRef.current.getBoundingClientRect();
          if (newRect.height > 0 && newRect.width > 0) {
            loadNodePositions();
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

    let initTimer: number;
    
    loadNodePositions().then((positions) => {
      initTimer = setTimeout(() => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        
        if (rect.width < 100 || rect.height < 100) {
          if (containerRef.current) {
            containerRef.current.style.minHeight = '400px';
            containerRef.current.style.minWidth = '400px';
          }
          setTimeout(() => {
            if (containerRef.current) {
              const newRect = containerRef.current.getBoundingClientRect();
              if (newRect.width > 100 && newRect.height > 100) {
                initializeGraph(positions);
              }
            }
          }, 200);
          return;
        }
        
        initializeGraph(positions);
      }, 100);
    }).catch((error) => {
      console.error('Error loading node positions:', error);
      initializationAttemptedRef.current = false;
    });

    const initializeGraph = (positions: Map<string, NodePosition>) => {
      try {
        // Create graph instance
        const graph = new Graph.default();
        graphRef.current = graph;

        // Add nodes
        nodes.forEach((node) => {
          const position = positions.get(node.guid) || {
            x: Math.random() * 800 + 100,
            y: Math.random() * 600 + 100,
            locked: false,
          };

          graph.addNode(node.guid, {
            label: node.label,
            size: 8,
            color: getNodeColor(node.node_type?.name || 'unknown', nodeColors),
            x: position.x,
            y: position.y,
            fixed: false,
            type: 'circle',
            nodeType: node.node_type?.name || 'unknown',
            nodeTypeDisplay: node.node_type?.display_name || 'Unknown',
            description: node.description || '',
          });
        });

        // Add edges
        edges.forEach((edge) => {
          if (graph.hasNode(edge.source_node_guid) && graph.hasNode(edge.target_node_guid)) {
            graph.addEdge(edge.source_node_guid, edge.target_node_guid, {
              label: edge.label || edge.edge_type?.display_name || 'Connection',
              color: getEdgeColor(edge.edge_type?.name || 'unknown', edgeColors),
              size: 2,
              edgeType: edge.edge_type?.name || 'unknown',
              edgeTypeDisplay: edge.edge_type?.display_name || 'Unknown',
            });
          }
        });

        // Create Sigma instance
        const sigma = new Sigma.default(graph, containerRef.current!, {
          minCameraRatio,
          maxCameraRatio,
          labelDensity: 0.07,
          labelGridCellSize: 60,
          labelRenderedSizeThreshold,
          zIndex: true,
          labelSize: 12,
          labelWeight: 'bold',
          labelColor: { color: '#333' },
          edgeLabelSize: 10,
          edgeLabelColor: { color: '#666' },
          allowInvalidContainer: true,
          enableEdgeEvents: false,
          defaultNodeColor: '#666',
          defaultEdgeColor: '#ccc',
          renderLabels: true,
          renderEdgeLabels: false,
        });

        sigmaRef.current = sigma;

        // Apply saved positions
        positions.forEach((position, nodeGuid) => {
          if (graph.hasNode(nodeGuid)) {
            graph.setNodeAttribute(nodeGuid, 'x', position.x);
            graph.setNodeAttribute(nodeGuid, 'y', position.y);
          }
        });

        // Set initial positions and disable velocity
        graph.nodes().forEach(nodeId => {
          graph.setNodeAttribute(nodeId, 'vx', 0);
          graph.setNodeAttribute(nodeId, 'vy', 0);
        });

        // Event handlers
        const handleNodeClick = (event: any) => {
          if (!enableSelection) return;
          
          const nodeId = event.node;
          const node = nodes.find(n => n.guid === nodeId);
          if (node && onNodeClick) {
            onNodeClick(node);
          }
        };

        const handleNodeRightClick = (event: any) => {
          if (event.originalEvent) {
            event.originalEvent.preventDefault();
            event.originalEvent.stopPropagation();
          }
          
          const nodeId = event.node;
          const node = nodes.find(n => n.guid === nodeId);
          if (node && onNodeRightClick) {
            onNodeRightClick(node, event.originalEvent);
          }
        };

        const handleCanvasClick = () => {
          if (onNodeClick) {
            onNodeClick(null);
          }
        };

        if (containerRef.current) {
          containerRef.current.addEventListener('mousedown', handleGlobalMouseDown);
          containerRef.current.addEventListener('mouseup', handleGlobalMouseUp);
        }

        // Drag handlers
        const handleNodeDown = (event: any) => {
          if (!enableDragging) return;
          if (lastMouseButtonRef.current === 2 || lastMouseButtonRef.current === 1) return;
          
          const nodeId = event.node;
          isDraggingRef.current = true;
          draggedNodeRef.current = nodeId;
          graph.setNodeAttribute(nodeId, 'fixed', false);
        };

        const handleNodeUp = (event: any) => {
          if (!enableDragging) return;
          
          const nodeId = event.node;
          isDraggingRef.current = false;
          draggedNodeRef.current = null;
          
          const newX = graph.getNodeAttribute(nodeId, 'x');
          const newY = graph.getNodeAttribute(nodeId, 'y');
          
          setNodePositions(prev => new Map(prev).set(nodeId, { x: newX, y: newY, locked: false }));
          graph.setNodeAttribute(nodeId, 'fixed', false);
        };

        const handleCanvasUp = () => {
          if (isDraggingRef.current) {
            isDraggingRef.current = false;
            draggedNodeRef.current = null;
          }
        };

        const handleMouseMove = (e: MouseEvent) => {
          if (isDraggingRef.current && sigmaRef.current && draggedNodeRef.current) {
            const nodeId = draggedNodeRef.current;
            e.preventDefault();
            e.stopPropagation();
            
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const graphCoords = sigmaRef.current.viewportToGraph({ x, y });
              
              graph.setNodeAttribute(nodeId, 'x', graphCoords.x);
              graph.setNodeAttribute(nodeId, 'y', graphCoords.y);
              sigmaRef.current.refresh();
            }
          }
        };

        // Add event listeners
        sigma.on('clickNode', handleNodeClick);
        sigma.on('rightClickNode', handleNodeRightClick);
        sigma.on('clickStage', handleCanvasClick);
        sigma.on('downNode', handleNodeDown);
        sigma.on('upNode', handleNodeUp);
        sigma.on('upStage', handleCanvasUp);

        const container = containerRef.current;
        if (container) {
          container.addEventListener('mousemove', handleMouseMove);
          (sigma as any)._mouseMoveListener = handleMouseMove;
        }

        isInitializedRef.current = true;

        // Position camera
        if (graphRef.current.order > 0) {
          sigmaRef.current.getCamera().animatedReset();
        }

        // Delayed render
        setTimeout(() => {
          if (sigmaRef.current) {
            sigmaRef.current.getCamera().animatedReset();
            sigmaRef.current.refresh();
          }
        }, 100);
      } catch (error) {
        console.error('Error initializing graph:', error);
      }
    };

    return () => {
      clearTimeout(initTimer);
      
      const container = containerRef.current;
      if (container) {
        container.removeEventListener('mousedown', handleGlobalMouseDown);
        container.removeEventListener('mouseup', handleGlobalMouseUp);
        if (sigmaRef.current && (sigmaRef.current as any)._mouseMoveListener) {
          container.removeEventListener('mousemove', (sigmaRef.current as any)._mouseMoveListener);
        }
      }

      if (sigmaRef.current) {
        sigmaRef.current.kill();
        sigmaRef.current = null;
      }
      if (graphRef.current) {
        graphRef.current.clear();
        graphRef.current = null;
      }
    };
  }, [nodes, edges, enableDragging, enableSelection, minCameraRatio, maxCameraRatio, labelRenderedSizeThreshold, nodeColors, edgeColors, loadNodePositions, handleGlobalMouseDown, handleGlobalMouseUp, onNodeClick, onNodeRightClick]);

  // Handle selection visual updates
  useEffect(() => {
    if (!sigmaRef.current || !graphRef.current || !isInitializedRef.current) {
      return;
    }

    const updateTimer = setTimeout(() => {
      if (!sigmaRef.current || !graphRef.current) {
        return;
      }

      const graph = graphRef.current;

      graph.nodes().forEach((nodeId: string) => {
        const isSelected = nodeId === selectedNodeGuid;
        const node = nodes.find(n => n.guid === nodeId);
        
        if (isSelected) {
          graph.setNodeAttribute(nodeId, 'color', getSelectionColor());
          graph.setNodeAttribute(nodeId, 'size', 12);
        } else {
          graph.setNodeAttribute(nodeId, 'color', getNodeColor(node?.node_type?.name || 'unknown', nodeColors));
          graph.setNodeAttribute(nodeId, 'size', 8);
        }
      });
    }, 50);

    return () => clearTimeout(updateTimer);
  }, [selectedNodeGuid, nodes, nodeColors]);

  // Cleanup
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
    </div>
  );
}

