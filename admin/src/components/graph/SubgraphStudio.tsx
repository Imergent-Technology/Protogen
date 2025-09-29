import { useState, useEffect } from 'react';
import { 
  Subgraph, 
  CoreGraphNode, 
  CoreGraphEdge,
  apiClient 
} from '@protogen/shared';
import { Network, Plus, Search, Settings, Eye, Edit3, Trash2, Loader2, Grid3X3, List, Link, Users } from 'lucide-react';
import { NodeCreationDialog } from './NodeCreationDialog';
import { EdgeCreationDialog } from './EdgeCreationDialog';
import { NodeEditDialog } from './NodeEditDialog';

interface SubgraphStudioProps {
  tenantId: number;
  onSubgraphSelect?: (subgraph: Subgraph) => void;
  onSubgraphCreate?: () => void;
  onSubgraphEdit?: (subgraph: Subgraph) => void;
  onSubgraphDelete?: (subgraph: Subgraph) => void;
}

export function SubgraphStudio({
  tenantId,
  onSubgraphSelect,
  onSubgraphCreate,
  onSubgraphEdit,
  onSubgraphDelete
}: SubgraphStudioProps) {
  const [subgraphs, setSubgraphs] = useState<Subgraph[]>([]);
  const [selectedSubgraph, setSelectedSubgraph] = useState<Subgraph | null>(null);
  const [subgraphNodes, setSubgraphNodes] = useState<CoreGraphNode[]>([]);
  const [subgraphEdges, setSubgraphEdges] = useState<CoreGraphEdge[]>([]);
  const [allNodes, setAllNodes] = useState<CoreGraphNode[]>([]);
  
  const [viewMode, setViewMode] = useState<'explore' | 'edit' | 'design'>('explore');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateEdgeDialog, setShowCreateEdgeDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSubgraph, setEditingSubgraph] = useState<Subgraph | null>(null);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list' | 'graph'>('grid');

  // Load subgraphs and all available nodes
  useEffect(() => {
    loadSubgraphData();
    loadAllNodes();
  }, [tenantId]);

  // Load subgraph details when selected
  useEffect(() => {
    if (selectedSubgraph) {
      loadSubgraphDetails(selectedSubgraph.id);
    }
  }, [selectedSubgraph]);

  const loadSubgraphData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getSubgraphs({ tenant_id: tenantId });
      if (response.success) {
        setSubgraphs(response.data);
      } else {
        setError('Failed to load subgraphs');
      }
    } catch (err) {
      setError('Failed to load subgraphs. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadAllNodes = async () => {
    try {
      const response = await apiClient.getGraphNodes();
      if (response.success) {
        setAllNodes(response.data);
      }
    } catch (err) {
      console.error('Failed to load all nodes:', err);
    }
  };

  const loadSubgraphDetails = async (subgraphId: number) => {
    try {
      const [nodesResponse, edgesResponse] = await Promise.all([
        apiClient.getSubgraphNodes(subgraphId),
        apiClient.getSubgraphEdges(subgraphId)
      ]);

      if (nodesResponse.success) {
        setSubgraphNodes(nodesResponse.data);
      }

      if (edgesResponse.success) {
        setSubgraphEdges(edgesResponse.data);
      }
    } catch (err) {
      console.error('Failed to load subgraph details:', err);
    }
  };

  const filteredSubgraphs = subgraphs.filter(subgraph => {
    const name = subgraph.name || '';
    const description = subgraph.description || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSubgraphClick = (subgraph: Subgraph) => {
    setSelectedSubgraph(subgraph);
    onSubgraphSelect?.(subgraph);
  };

  const handleCreateSubgraph = () => {
    setShowCreateDialog(true);
  };

  const handleSubgraphCreated = (newSubgraph: Subgraph) => {
    setSubgraphs(prev => [newSubgraph, ...prev]);
    setSelectedSubgraph(newSubgraph);
    onSubgraphCreate?.();
  };

  const handleEditSubgraph = (subgraph: Subgraph) => {
    setEditingSubgraph(subgraph);
    setShowEditDialog(true);
    onSubgraphEdit?.(subgraph);
  };

  const handleSubgraphUpdated = (updatedSubgraph: Subgraph) => {
    setSubgraphs(prev => prev.map(s => s.id === updatedSubgraph.id ? updatedSubgraph : s));
    if (selectedSubgraph?.id === updatedSubgraph.id) {
      setSelectedSubgraph(updatedSubgraph);
    }
  };

  const handleDeleteSubgraph = async (subgraph: Subgraph) => {
    if (confirm(`Are you sure you want to delete "${subgraph.name}"? This will also remove all associated scenes.`)) {
      try {
        const response = await apiClient.deleteSubgraph(subgraph.id);
        if (response.success) {
          setSubgraphs(prev => prev.filter(s => s.id !== subgraph.id));
          if (selectedSubgraph?.id === subgraph.id) {
            setSelectedSubgraph(null);
          }
          onSubgraphDelete?.(subgraph);
        } else {
          alert('Failed to delete subgraph: ' + (response.message || 'Unknown error'));
        }
      } catch (err) {
        alert('Failed to delete subgraph. Please try again.');
      }
    }
  };

  const handleAddNodeToSubgraph = async (nodeId: number) => {
    if (!selectedSubgraph) return;

    try {
      const response = await apiClient.addNodeToSubgraph(selectedSubgraph.id, nodeId);
      if (response.success) {
        loadSubgraphDetails(selectedSubgraph.id);
      } else {
        alert('Failed to add node to subgraph: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to add node to subgraph. Please try again.');
    }
  };

  const handleRemoveNodeFromSubgraph = async (nodeId: number) => {
    if (!selectedSubgraph) return;

    try {
      const response = await apiClient.removeNodeFromSubgraph(selectedSubgraph.id, nodeId);
      if (response.success) {
        loadSubgraphDetails(selectedSubgraph.id);
      } else {
        alert('Failed to remove node from subgraph: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to remove node from subgraph. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading subgraphs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <span>{error}</span>
        <button 
          onClick={loadSubgraphData}
          className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Network className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Subgraph Studio</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('explore')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'explore' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
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
                : 'text-muted-foreground hover:text-foreground'
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
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4 mr-1" />
            Design
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search subgraphs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDisplayMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                displayMode === 'grid' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              className={`p-2 rounded-md transition-colors ${
                displayMode === 'list' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDisplayMode('graph')}
              className={`p-2 rounded-md transition-colors ${
                displayMode === 'graph' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Network className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Subgraph List */}
        <div className="w-1/3 border-r border-border overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Subgraphs</h2>
              <button
                onClick={handleCreateSubgraph}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Subgraph
              </button>
            </div>
            
            <div className="space-y-2">
              {filteredSubgraphs.map((subgraph) => (
                <div
                  key={subgraph.id}
                  onClick={() => handleSubgraphClick(subgraph)}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedSubgraph?.id === subgraph.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{subgraph.name}</h3>
                      {subgraph.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {subgraph.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSubgraph(subgraph);
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubgraph(subgraph);
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {subgraph.nodes?.length || 0} nodes
                    </span>
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      {subgraphEdges.length} edges
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subgraph Details */}
        <div className="flex-1 p-4">
          {selectedSubgraph ? (
            <div className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedSubgraph.name}</h2>
                  {selectedSubgraph.description && (
                    <p className="text-muted-foreground">{selectedSubgraph.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {subgraphNodes.length} nodes, {subgraphEdges.length} edges
                  </span>
                </div>
              </div>

              {/* Node Management */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Nodes in Subgraph</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {subgraphNodes.map((node) => (
                      <div
                        key={node.id}
                        className="flex items-center justify-between p-2 border border-border rounded-md"
                      >
                        <span className="text-sm">{node.label}</span>
                        <button
                          onClick={() => handleRemoveNodeFromSubgraph(node.id)}
                          className="p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Available Nodes</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {allNodes
                      .filter(node => !subgraphNodes.some(n => n.id === node.id))
                      .map((node) => (
                        <div
                          key={node.id}
                          className="flex items-center justify-between p-2 border border-border rounded-md"
                        >
                          <span className="text-sm">{node.label}</span>
                          <button
                            onClick={() => handleAddNodeToSubgraph(node.id)}
                            className="p-1 text-muted-foreground hover:text-primary"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a subgraph to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {showCreateDialog && (
        <SubgraphCreationDialog
          tenantId={tenantId}
          onClose={() => setShowCreateDialog(false)}
          onSubgraphCreated={handleSubgraphCreated}
        />
      )}

      {showEditDialog && editingSubgraph && (
        <SubgraphEditDialog
          subgraph={editingSubgraph}
          onClose={() => {
            setShowEditDialog(false);
            setEditingSubgraph(null);
          }}
          onSubgraphUpdated={handleSubgraphUpdated}
        />
      )}
    </div>
  );
}

// Subgraph Creation Dialog Component
interface SubgraphCreationDialogProps {
  tenantId: number;
  onClose: () => void;
  onSubgraphCreated: (subgraph: Subgraph) => void;
}

function SubgraphCreationDialog({ tenantId, onClose, onSubgraphCreated }: SubgraphCreationDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await apiClient.createSubgraph({
        name: name.trim(),
        description: description.trim() || undefined,
        tenant_id: tenantId,
        is_public: isPublic
      });

      if (response.success) {
        onSubgraphCreated(response.data);
        onClose();
      } else {
        alert('Failed to create subgraph: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to create subgraph. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create New Subgraph</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <label htmlFor="isPublic" className="text-sm">Make public</label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subgraph Edit Dialog Component
interface SubgraphEditDialogProps {
  subgraph: Subgraph;
  onClose: () => void;
  onSubgraphUpdated: (subgraph: Subgraph) => void;
}

function SubgraphEditDialog({ subgraph, onClose, onSubgraphUpdated }: SubgraphEditDialogProps) {
  const [name, setName] = useState(subgraph.name);
  const [description, setDescription] = useState(subgraph.description || '');
  const [isPublic, setIsPublic] = useState(subgraph.is_public);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await apiClient.updateSubgraph(subgraph.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: isPublic
      });

      if (response.success) {
        onSubgraphUpdated(response.data);
        onClose();
      } else {
        alert('Failed to update subgraph: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to update subgraph. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Subgraph</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <label htmlFor="isPublic" className="text-sm">Make public</label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
