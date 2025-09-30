import { useState, useEffect } from 'react';
import { 
  CoreGraphNode, 
  CoreGraphEdge, 
  CoreGraphNodeType, 
  Subgraph,
  apiClient 
} from '@protogen/shared';
import { Network, Plus, Search, Settings, Eye, Edit3, Trash2, Loader2, Grid3X3, List, Link, Layers, Filter, X } from 'lucide-react';
import { NodeCreationDialog } from './NodeCreationDialog';
import { EdgeCreationDialog } from './EdgeCreationDialog';
import { NodeEditDialog } from './NodeEditDialog';
import { GraphCanvas } from './GraphCanvas';
import { CreateSubgraphDialog } from './CreateSubgraphDialog';

interface GraphStudioProps {
  onNodeSelect?: (node: CoreGraphNode) => void;
  onNodeCreate?: () => void;
  onNodeEdit?: (node: CoreGraphNode) => void;
  onNodeDelete?: (node: CoreGraphNode) => void;
}

export function GraphStudio({
  onNodeSelect,
  onNodeCreate,
  onNodeEdit,
  onNodeDelete
}: GraphStudioProps) {
  const [nodes, setNodes] = useState<CoreGraphNode[]>([]);
  const [edges, setEdges] = useState<CoreGraphEdge[]>([]);
  const [nodeTypes, setNodeTypes] = useState<CoreGraphNodeType[]>([]);
  const [subgraphs, setSubgraphs] = useState<Subgraph[]>([]);

  const [selectedNode, setSelectedNode] = useState<CoreGraphNode | null>(null);
  const [selectedSubgraph, setSelectedSubgraph] = useState<Subgraph | null>(null);
  const [viewMode, setViewMode] = useState<'explore' | 'edit' | 'design'>('explore');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterConnections, setFilterConnections] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateEdgeDialog, setShowCreateEdgeDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingNode, setEditingNode] = useState<CoreGraphNode | null>(null);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list' | 'graph'>('graph');
  const [showSubgraphPanel, setShowSubgraphPanel] = useState(true);
  const [showCreateSubgraphDialog, setShowCreateSubgraphDialog] = useState(false);

  // Load core graph system data
  useEffect(() => {
    loadGraphData();
  }, []);

  const filteredNodes = nodes.filter(node => {
    const label = node.label || '';
    const matchesSearch = label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || node.node_type?.name === filterType;
    
    // Connection filtering
    const connectionCount = edges.filter(edge => 
      edge.source_node_guid === node.guid || edge.target_node_guid === node.guid
    ).length;
    
    let matchesConnections = true;
    if (filterConnections === 'connected') {
      matchesConnections = connectionCount > 0;
    } else if (filterConnections === 'isolated') {
      matchesConnections = connectionCount === 0;
    }
    
    // Subgraph filtering
    let matchesSubgraph = true;
    if (selectedSubgraph) {
      // This will be updated when we load subgraph nodes
      matchesSubgraph = true; // Placeholder for now
    }
    
    return matchesSearch && matchesType && matchesConnections && matchesSubgraph;
  });



  const handleNodeClick = (node: CoreGraphNode) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
  };

  const handleCreateNode = () => {
    setShowCreateDialog(true);
  };





  const handleNodeCreated = (_newNode: CoreGraphNode) => {
    // Refresh the entire graph data to ensure consistency
    loadGraphData();
    onNodeCreate?.();
  };

  const handleEdgeCreated = (_newEdge: any) => {
    // Refresh the entire graph data to ensure consistency
    loadGraphData();
  };

  const handleNodeUpdated = (updatedNode: CoreGraphNode) => {
    // Refresh the entire graph data to ensure consistency
    loadGraphData();
    // Update selected node if it was the one being edited
    if (selectedNode?.guid === updatedNode.guid) {
      setSelectedNode(updatedNode);
    }
  };

  const loadGraphData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load node types, edge types, and subgraphs
      const [nodeTypesResponse, edgeTypesResponse, subgraphsResponse] = await Promise.all([
        apiClient.getGraphNodeTypes(),
        apiClient.getGraphEdgeTypes(),
        apiClient.getSubgraphs()
      ]);

      if (nodeTypesResponse.success) {
        setNodeTypes(nodeTypesResponse.data);
      }

      if (edgeTypesResponse.success) {
        // Edge types loaded but not stored in state yet
      }

      if (subgraphsResponse.success) {
        setSubgraphs(subgraphsResponse.data);
      }

      // Load nodes and edges
      const [nodesResponse, edgesResponse] = await Promise.all([
        apiClient.getGraphNodes(),
        apiClient.getGraphEdges()
      ]);

      if (nodesResponse.success) {
        setNodes(nodesResponse.data);
      }

      if (edgesResponse.success) {
        setEdges(edgesResponse.data);
      }

    } catch (err) {
      setError('Failed to load graph data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNode = (node: CoreGraphNode) => {
    setEditingNode(node);
    setShowEditDialog(true);
    onNodeEdit?.(node);
  };

  const handleDeleteNode = async (node: CoreGraphNode) => {
    if (confirm(`Are you sure you want to delete "${node.label}"? This will also delete all connected edges.`)) {
      try {
        const response = await apiClient.deleteGraphNode(node.guid);
        if (response.success) {
          loadGraphData(); // Refresh data
          // Clear selection if this was the selected node
          if (selectedNode?.guid === node.guid) {
            setSelectedNode(null);
          }
        } else {
          alert('Failed to delete node: ' + (response.message || 'Unknown error'));
        }
      } catch (err) {
        alert('Failed to delete node. Please try again.');
      }
    }
    onNodeDelete?.(node);
  };

  const handleDeleteEdge = async (edge: any) => {
    if (confirm('Are you sure you want to delete this edge?')) {
      try {
        const response = await apiClient.deleteGraphEdge(edge.guid);
        if (response.success) {
          loadGraphData(); // Refresh data
        } else {
          alert('Failed to delete edge: ' + (response.message || 'Unknown error'));
        }
      } catch (err) {
        alert('Failed to delete edge. Please try again.');
      }
    }
  };

  // Subgraph management functions
  const handleSubgraphSelect = (subgraph: Subgraph | null) => {
    setSelectedSubgraph(subgraph);
  };

  const handleCreateSubgraph = async (name: string, description?: string) => {
    try {
      const response = await apiClient.createSubgraph({
        name,
        description: description || '',
        tenant_id: 1, // TODO: Get from context
        is_public: false
      });
      
      if (response.success) {
        loadGraphData(); // Refresh subgraphs
        setShowCreateSubgraphDialog(false);
      } else {
        alert('Failed to create subgraph: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to create subgraph. Please try again.');
    }
  };

  const handleAddNodeToSubgraph = async (node: CoreGraphNode, subgraph: Subgraph) => {
    try {
      const response = await apiClient.addNodeToSubgraph(subgraph.id, node.id);
      if (response.success) {
        loadGraphData(); // Refresh data
      } else {
        alert('Failed to add node to subgraph: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to add node to subgraph. Please try again.');
    }
  };

  const handleRemoveNodeFromSubgraph = async (node: CoreGraphNode, subgraph: Subgraph) => {
    try {
      const response = await apiClient.removeNodeFromSubgraph(subgraph.id, node.id);
      if (response.success) {
        loadGraphData(); // Refresh data
      } else {
        alert('Failed to remove node from subgraph: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to remove node from subgraph. Please try again.');
    }
  };


  
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Network className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Graph Studio</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('explore')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'explore'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Eye className="h-4 w-4 mr-1" />
            Explore
          </button>
          <button
            onClick={() => setViewMode('edit')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'edit'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => setViewMode('design')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'design'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Settings className="h-4 w-4 mr-1" />
            Design
          </button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <button
            onClick={() => setShowSubgraphPanel(!showSubgraphPanel)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              showSubgraphPanel
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Layers className="h-4 w-4 mr-1" />
            Subgraphs
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            {nodeTypes.map((nodeType) => (
              <option key={nodeType.id} value={nodeType.name}>
                {nodeType.display_name}
              </option>
            ))}
          </select>
          
          <select
            value={filterConnections}
            onChange={(e) => setFilterConnections(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Nodes</option>
            <option value="connected">Connected Only</option>
            <option value="isolated">Isolated Only</option>
          </select>
          
          {selectedSubgraph && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-md">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                {selectedSubgraph.name}
              </span>
              <button
                onClick={() => setSelectedSubgraph(null)}
                className="p-1 hover:bg-primary/20 rounded"
              >
                <X className="h-3 w-3 text-primary" />
              </button>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-border rounded-md bg-background">
          <button
            onClick={() => setDisplayMode('grid')}
            className={`p-2 transition-colors ${
              displayMode === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
            title="Grid View"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDisplayMode('list')}
            className={`p-2 transition-colors ${
              displayMode === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDisplayMode('graph')}
            className={`p-2 rounded-r-md transition-colors ${
              displayMode === 'graph'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
            title="Graph View"
          >
            <Network className="h-4 w-4" />
          </button>
        </div>

        {viewMode !== 'explore' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNode}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Node
            </button>
            <button
              onClick={() => setShowCreateEdgeDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              <Link className="h-4 w-4" />
              Add Edge
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Subgraph Panel */}
        {showSubgraphPanel && (
          <div className="w-80 border-r border-border bg-background">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Subgraphs</h3>
                <button
                  onClick={() => setShowCreateSubgraphDialog(true)}
                  className="p-1 hover:bg-muted rounded"
                  title="Create new subgraph"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleSubgraphSelect(null)}
                  className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                    !selectedSubgraph
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  All Nodes
                </button>
                
                {subgraphs.map((subgraph) => (
                  <button
                    key={subgraph.id}
                    onClick={() => handleSubgraphSelect(subgraph)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      selectedSubgraph?.id === subgraph.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">{subgraph.name}</div>
                    {subgraph.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {subgraph.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Graph Canvas */}
        <div className="flex-1 relative bg-muted/20 overflow-auto w-full">
          <div className="p-4 min-h-full">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading graph data...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Network className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
                  <p className="text-destructive mb-2">Error loading graph data</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>

            
            {filteredNodes.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No nodes found</p>
                  {searchTerm && <p className="text-sm">Try adjusting your search</p>}
                </div>
              </div>
            ) : (
              <>
                {displayMode === 'graph' ? (
                  <div className="w-full h-full">
                    <GraphCanvas
                      nodes={filteredNodes}
                      edges={edges}
                      onNodeClick={handleNodeClick}
                      selectedNodeGuid={selectedNode?.guid || null}
                      className="w-full h-full"
                      onNodeEdit={viewMode !== 'explore' ? handleEditNode : undefined}
                      onNodeDelete={viewMode !== 'explore' ? handleDeleteNode : undefined}
                    />
                  </div>
                ) : displayMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 w-full">
                    {filteredNodes.map((node) => (
                      <div
                        key={node.guid}
                        onClick={() => handleNodeClick(node)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md min-w-0 ${
                          selectedNode?.guid === node.guid
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background hover:border-primary/50'
                        }`}
                      >
                                                                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {node.node_type?.display_name || 'Unknown'}
                        </span>
                        {/* Connection indicator */}
                        {(() => {
                          const connectionCount = edges.filter(edge => 
                            edge.source_node_guid === node.guid || edge.target_node_guid === node.guid
                          ).length;
                          return connectionCount > 0 ? (
                            <span 
                              className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full"
                              title={`${connectionCount} ${connectionCount === 1 ? 'connection' : 'connections'}`}
                            >
                              {connectionCount}
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <h3 className="font-medium text-sm truncate mb-2" title={node.label}>{node.label}</h3>
                      {viewMode !== 'explore' && (
                        <div className="flex items-center justify-end gap-1 mt-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNode(node);
                            }}
                            className="p-0.5 hover:bg-muted rounded"
                          >
                            <Edit3 className="h-2.5 w-2.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNode(node);
                            }}
                            className="p-0.5 hover:bg-muted rounded text-destructive"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNodes.map((node) => (
                      <div
                        key={node.guid}
                        onClick={() => handleNodeClick(node)}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                          selectedNode?.guid === node.guid
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase min-w-[80px]">
                            {node.node_type?.display_name || 'Unknown'}
                          </span>
                          <h3 className="font-medium text-sm truncate" title={node.label}>{node.label}</h3>
                          {/* Connection indicator */}
                          {(() => {
                            const connectionCount = edges.filter(edge => 
                              edge.source_node_guid === node.guid || edge.target_node_guid === node.guid
                            ).length;
                            return connectionCount > 0 ? (
                              <span 
                                className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full"
                                title={`${connectionCount} ${connectionCount === 1 ? 'connection' : 'connections'}`}
                              >
                                {connectionCount}
                              </span>
                            ) : null;
                          })()}
                        </div>
                        {viewMode !== 'explore' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditNode(node);
                              }}
                              className="p-1 hover:bg-muted rounded"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(node);
                              }}
                              className="p-1 hover:bg-muted rounded text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
              </>
            )}
          </div>
        </div>

        {/* Floating Node Details Overlay */}
        {selectedNode && (
          <div className="fixed top-4 right-4 w-80 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg z-50 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Node Details</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium">{selectedNode.node_type?.display_name || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Label:</span>
                  <span className="ml-2">{selectedNode.label}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">GUID:</span>
                  <span className="ml-2 font-mono text-xs">{selectedNode.guid}</span>
                </div>
                {selectedNode.description && (
                  <div>
                    <span className="text-muted-foreground">Description:</span>
                    <span className="ml-2">{selectedNode.description}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Subgraph Management */}
            <div className="p-4 border-b border-border">
              <h4 className="font-medium mb-3">Subgraph Management</h4>
              <div className="space-y-2">
                {subgraphs.map((subgraph) => {
                  // TODO: Check if node is in this subgraph
                  const isInSubgraph = false; // Placeholder
                  
                  return (
                    <div key={subgraph.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{subgraph.name}</div>
                        {subgraph.description && (
                          <div className="text-xs text-muted-foreground">{subgraph.description}</div>
                        )}
                      </div>
                      <button
                        onClick={() => isInSubgraph 
                          ? handleRemoveNodeFromSubgraph(selectedNode, subgraph)
                          : handleAddNodeToSubgraph(selectedNode, subgraph)
                        }
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          isInSubgraph
                            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                      >
                        {isInSubgraph ? 'Remove' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="font-medium mb-3">Connections</h4>
              <div className="space-y-2">
                {edges
                  .filter(edge => edge.source_node_guid === selectedNode.guid || edge.target_node_guid === selectedNode.guid)
                  .map(edge => {
                    const connectedNodeGuid = edge.source_node_guid === selectedNode.guid ? edge.target_node_guid : edge.source_node_guid;
                    const connectedNode = nodes.find(n => n.guid === connectedNodeGuid);
                    const isOutgoing = edge.source_node_guid === selectedNode.guid;
                    return (
                      <div key={edge.guid} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-muted-foreground">
                            {isOutgoing ? '→' : '←'}
                          </span>
                          <span className="text-sm font-medium">{connectedNode?.label || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded">
                            {edge.edge_type?.display_name || 'Unknown'}
                          </span>
                        </div>
                        {viewMode !== 'explore' && (
                          <button
                            onClick={() => handleDeleteEdge(edge)}
                            className="p-1 hover:bg-destructive/10 rounded text-destructive"
                            title="Delete edge"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                {edges.filter(edge => edge.source_node_guid === selectedNode.guid || edge.target_node_guid === selectedNode.guid).length === 0 && (
                  <p className="text-sm text-muted-foreground">No connections</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Node Creation Dialog */}
      <NodeCreationDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onNodeCreated={handleNodeCreated}
      />

      {/* Edge Creation Dialog */}
      <EdgeCreationDialog
        isOpen={showCreateEdgeDialog}
        onClose={() => setShowCreateEdgeDialog(false)}
        onEdgeCreated={handleEdgeCreated}
        availableNodes={nodes}
      />

      {/* Node Edit Dialog */}
      <NodeEditDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingNode(null);
        }}
        onNodeUpdated={handleNodeUpdated}
        node={editingNode}
      />

      {/* Create Subgraph Dialog */}
      {showCreateSubgraphDialog && (
        <CreateSubgraphDialog
          isOpen={showCreateSubgraphDialog}
          onClose={() => setShowCreateSubgraphDialog(false)}
          onCreateSubgraph={handleCreateSubgraph}
        />
      )}
    </div>
  );
}
