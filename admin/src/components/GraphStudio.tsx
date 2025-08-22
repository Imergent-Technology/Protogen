import { useState, useEffect } from 'react';
import { 
  CoreGraphNode, 
  CoreGraphEdge, 
  CoreGraphNodeType, 
  CoreGraphEdgeType,
  apiClient 
} from '@progress/shared';
import { Network, Plus, Search, Settings, Eye, Edit3, Trash2, Loader2 } from 'lucide-react';

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
  const [edgeTypes, setEdgeTypes] = useState<CoreGraphEdgeType[]>([]);
  const [selectedNode, setSelectedNode] = useState<CoreGraphNode | null>(null);
  const [viewMode, setViewMode] = useState<'explore' | 'edit' | 'design'>('explore');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load core graph system data
  useEffect(() => {
    const loadGraphData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load node types and edge types
        const [nodeTypesResponse, edgeTypesResponse] = await Promise.all([
          apiClient.getGraphNodeTypes(),
          apiClient.getGraphEdgeTypes()
        ]);

        if (nodeTypesResponse.success) {
          setNodeTypes(nodeTypesResponse.data);
        }

        if (edgeTypesResponse.success) {
          setEdgeTypes(edgeTypesResponse.data);
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
        console.error('Error loading graph data:', err);
        setError('Failed to load graph data');
      } finally {
        setLoading(false);
      }
    };

    loadGraphData();
  }, []);

  const filteredNodes = nodes.filter(node => {
    const label = node.label || '';
    const matchesSearch = label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || node.node_type?.name === filterType;
    return matchesSearch && matchesType;
  });

  const handleNodeClick = (node: CoreGraphNode) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
  };

  const handleCreateNode = () => {
    onNodeCreate?.();
  };

  const handleEditNode = (node: CoreGraphNode) => {
    onNodeEdit?.(node);
  };

  const handleDeleteNode = (node: CoreGraphNode) => {
    onNodeDelete?.(node);
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
        </div>

        {viewMode !== 'explore' && (
          <button
            onClick={handleCreateNode}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Node
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Graph Canvas */}
        <div className="flex-1 relative bg-muted/20 overflow-hidden">
          <div className="absolute inset-0 p-4">
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
                {/* Placeholder for actual graph visualization */}
                <div className="grid grid-cols-5 gap-4">
                  {filteredNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedNode?.id === node.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {node.node_type?.display_name || 'Unknown'}
                    </span>
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
                  <h3 className="font-medium text-sm">{node.label}</h3>
                </div>
              ))}
            </div>
            
            {filteredNodes.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No nodes found</p>
                  {searchTerm && <p className="text-sm">Try adjusting your search</p>}
                </div>
              </div>
            )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {selectedNode && (
          <div className="w-80 border-l border-border bg-background">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold mb-2">Node Details</h3>
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
            
            <div className="p-4">
              <h4 className="font-medium mb-3">Connections</h4>
              <div className="space-y-2">
                {edges
                  .filter(edge => edge.source_node_guid === selectedNode.guid || edge.target_node_guid === selectedNode.guid)
                  .map(edge => {
                    const connectedNodeGuid = edge.source_node_guid === selectedNode.guid ? edge.target_node_guid : edge.source_node_guid;
                    const connectedNode = nodes.find(n => n.guid === connectedNodeGuid);
                    return (
                      <div key={edge.guid} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{connectedNode?.label || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{edge.edge_type?.display_name || 'Unknown'}</span>
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
    </div>
  );
}
