import React, { useState, useEffect } from 'react';
import { Save, Eye, Settings, Plus, Trash2, EyeOff, X } from 'lucide-react';
import { Button, Input, Label, Textarea, Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@progress/shared';
import NodeSelectionInterface, { NodeMetadata } from './NodeSelectionInterface';

// Types for graph scene authoring
export interface GraphSceneData {
  id?: string;
  name: string;
  description?: string;
  type: 'graph';
  metadata: {
    title?: string;
    subtitle?: string;
    author?: string;
    version?: string;
    tags?: string[];
  };
  nodes: string[]; // Node IDs
  edges: GraphEdge[];
  style: {
    theme?: string;
    layout?: string;
    nodeStyles?: Record<string, any>;
    edgeStyles?: Record<string, any>;
  };
  config: {
    showLabels?: boolean;
    showEdges?: boolean;
    allowInteraction?: boolean;
    autoLayout?: boolean;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  style?: Record<string, any>;
  visible?: boolean;
}

export interface GraphSceneAuthoringProps {
  scene?: GraphSceneData;
  availableNodes: NodeMetadata[];
  onSave: (scene: GraphSceneData) => void;
  onPreview: (scene: GraphSceneData) => void;
  onCancel: () => void;
  className?: string;
}

const GraphSceneAuthoring: React.FC<GraphSceneAuthoringProps> = ({
  scene,
  availableNodes,
  onSave,
  onPreview,
  onCancel,
  className = ''
}) => {
  // Form state
  const [formData, setFormData] = useState<GraphSceneData>({
    name: '',
    description: '',
    type: 'graph',
    metadata: {
      title: '',
      subtitle: '',
      author: '',
      version: '1.0.0',
      tags: []
    },
    nodes: [],
    edges: [],
    style: {
      theme: 'default',
      layout: 'force',
      nodeStyles: {},
      edgeStyles: {}
    },
    config: {
      showLabels: true,
      showEdges: true,
      allowInteraction: true,
      autoLayout: true
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'metadata' | 'nodes' | 'edges' | 'style' | 'config'>('metadata');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [showNodeSelection, setShowNodeSelection] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Initialize form data
  useEffect(() => {
    if (scene) {
      setFormData(scene);
      setSelectedNodes(scene.nodes);
    }
  }, [scene]);

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const handleConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  // Handle node selection
  const handleNodeSelection = (nodeIds: string[]) => {
    setSelectedNodes(nodeIds);
    setFormData(prev => ({
      ...prev,
      nodes: nodeIds
    }));
    
    // Auto-import edges for connected nodes
    const newEdges = generateEdgesForNodes(nodeIds, availableNodes);
    setFormData(prev => ({
      ...prev,
      edges: newEdges
    }));
  };

  // Generate edges for connected nodes
  const generateEdgesForNodes = (nodeIds: string[], nodes: NodeMetadata[]): GraphEdge[] => {
    const edges: GraphEdge[] = [];
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    
    // This is a simplified edge generation - in a real implementation,
    // you'd query the actual graph relationships
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const sourceNode = nodeMap.get(nodeIds[i]);
        const targetNode = nodeMap.get(nodeIds[j]);
        
        if (sourceNode && targetNode) {
          // Check if nodes are related (simplified logic)
          const hasRelationship = checkNodeRelationship(sourceNode, targetNode);
          if (hasRelationship) {
            edges.push({
              id: `${nodeIds[i]}-${nodeIds[j]}`,
              source: nodeIds[i],
              target: nodeIds[j],
              type: 'default',
              visible: true
            });
          }
        }
      }
    }
    
    return edges;
  };

  // Simplified relationship check
  const checkNodeRelationship = (source: NodeMetadata, target: NodeMetadata): boolean => {
    // In a real implementation, this would check actual graph relationships
    // For now, we'll use a simple heuristic based on type similarity
    if (source.type === target.type) return true;
    if (source.tags && target.tags) {
      return source.tags.some(tag => target.tags?.includes(tag) || false);
    }
    return false;
  };

  // Handle edge management
  const toggleEdgeVisibility = (edgeId: string) => {
    setFormData(prev => ({
      ...prev,
      edges: prev.edges.map(edge => 
        edge.id === edgeId 
          ? { ...edge, visible: !edge.visible }
          : edge
      )
    }));
  };

  const removeEdge = (edgeId: string) => {
    setFormData(prev => ({
      ...prev,
      edges: prev.edges.filter(edge => edge.id !== edgeId)
    }));
  };

  // Handle tag management
  const addTag = () => {
    if (newTag.trim() && !formData.metadata.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: [...(prev.metadata.tags || []), newTag.trim()]
        }
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata.tags?.filter(tag => tag !== tagToRemove) || []
      }
    }));
  };

  // Handle save
  const handleSave = () => {
    const sceneToSave = {
      ...formData,
      nodes: selectedNodes
    };
    onSave(sceneToSave);
  };

  // Handle preview
  const handlePreview = () => {
    const sceneToPreview = {
      ...formData,
      nodes: selectedNodes
    };
    onPreview(sceneToPreview);
  };

  return (
    <div className={`graph-scene-authoring ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {scene ? 'Edit Graph Scene' : 'Create Graph Scene'}
          </h2>
          <p className="text-muted-foreground">
            Design and configure a graph-based scene with nodes and edges
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Scene
          </Button>
        </div>
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
          <TabsTrigger value="edges">Edges</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Scene Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Enter scene name"
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.metadata.title || ''}
                  onChange={(e) => handleMetadataChange('title', e.target.value)}
                  placeholder="Display title"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.metadata.subtitle || ''}
                  onChange={(e) => handleMetadataChange('subtitle', e.target.value)}
                  placeholder="Display subtitle"
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.metadata.author || ''}
                  onChange={(e) => handleMetadataChange('author', e.target.value)}
                  placeholder="Scene author"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe the scene purpose and content"
                rows={3}
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.metadata.tags && formData.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.metadata.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Nodes Tab */}
        <TabsContent value="nodes" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Node Selection</h3>
              <Button onClick={() => setShowNodeSelection(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Select Nodes
              </Button>
            </div>
            
            {selectedNodes.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {selectedNodes.length} node{selectedNodes.length !== 1 ? 's' : ''} selected
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedNodes.map(nodeId => {
                    const node = availableNodes.find(n => n.id === nodeId);
                    return node ? (
                      <div key={nodeId} className="p-3 border border-border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{node.name}</h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {node.type}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedNodes(prev => prev.filter(id => id !== nodeId))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No nodes selected</p>
                <p className="text-sm">Click "Select Nodes" to choose nodes for this scene</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Edges Tab */}
        <TabsContent value="edges" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Edge Management</h3>
            
            {formData.edges.length > 0 ? (
              <div className="space-y-3">
                {formData.edges.map(edge => {
                  const sourceNode = availableNodes.find(n => n.id === edge.source);
                  const targetNode = availableNodes.find(n => n.id === edge.target);
                  
                  return (
                    <div key={edge.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm">
                          <span className="font-medium">{sourceNode?.name || edge.source}</span>
                          <span className="text-muted-foreground mx-2">→</span>
                          <span className="font-medium">{targetNode?.name || edge.target}</span>
                        </div>
                        {edge.type && (
                          <Badge variant="outline" className="text-xs">
                            {edge.type}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEdgeVisibility(edge.id)}
                        >
                          {edge.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEdge(edge.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No edges configured</p>
                <p className="text-sm">Edges will be automatically generated when you select connected nodes</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Visual Styling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={formData.style.theme || 'default'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    style: { ...prev.style, theme: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="colorful">Colorful</option>
                </select>
              </div>
              <div>
                <Label htmlFor="layout">Layout</Label>
                <select
                  id="layout"
                  value={formData.style.layout || 'force'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    style: { ...prev.style, layout: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="force">Force-directed</option>
                  <option value="hierarchical">Hierarchical</option>
                  <option value="circular">Circular</option>
                  <option value="grid">Grid</option>
                </select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Scene Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showLabels">Show Node Labels</Label>
                  <p className="text-sm text-muted-foreground">Display node names on the graph</p>
                </div>
                <input
                  type="checkbox"
                  id="showLabels"
                  checked={formData.config.showLabels || false}
                  onChange={(e) => handleConfigChange('showLabels', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showEdges">Show Edges</Label>
                  <p className="text-sm text-muted-foreground">Display connections between nodes</p>
                </div>
                <input
                  type="checkbox"
                  id="showEdges"
                  checked={formData.config.showEdges || false}
                  onChange={(e) => handleConfigChange('showEdges', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowInteraction">Allow Interaction</Label>
                  <p className="text-sm text-muted-foreground">Enable user interaction with nodes and edges</p>
                </div>
                <input
                  type="checkbox"
                  id="allowInteraction"
                  checked={formData.config.allowInteraction || false}
                  onChange={(e) => handleConfigChange('allowInteraction', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoLayout">Auto Layout</Label>
                  <p className="text-sm text-muted-foreground">Automatically position nodes</p>
                </div>
                <input
                  type="checkbox"
                  id="autoLayout"
                  checked={formData.config.autoLayout || false}
                  onChange={(e) => handleConfigChange('autoLayout', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Node Selection Modal */}
      {showNodeSelection && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Nodes</h3>
                <Button variant="ghost" onClick={() => setShowNodeSelection(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <NodeSelectionInterface
                nodes={availableNodes}
                selectedNodes={selectedNodes}
                onSelectionChange={handleNodeSelection}
                options={{
                  mode: 'multi',
                  viewMode: 'cards',
                  searchEnabled: true,
                  filterEnabled: true,
                  showMetadata: true,
                  allowCreate: false
                }}
              />
            </div>
            <div className="p-4 border-t border-border flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNodeSelection(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowNodeSelection(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphSceneAuthoring;
