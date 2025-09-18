import React, { useState, useEffect } from 'react';
import { Save, Eye, Settings, Plus, Trash2, EyeOff, X } from 'lucide-react';
import { Button, Input, Label, Textarea, Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@protogen/shared';
import { GraphSceneData, GraphEdge, GraphSceneAuthoringProps } from '../types';
import { NodeMetadata } from '../types/node-selection';
import { useAuthoringPermissions } from '../hooks/useAuthoringPermissions';
import { useSceneAuthoring } from '../hooks/useSceneAuthoring';
import NodeSelectionInterface from './NodeSelectionInterface';

const GraphSceneAuthoring: React.FC<GraphSceneAuthoringProps> = ({
  scene,
  availableNodes,
  onSave,
  onPreview,
  onCancel,
  className = '',
  permissions
}) => {
  const authoringPermissions = useAuthoringPermissions();
  const effectivePermissions = permissions || authoringPermissions;
  
  const {
    scene: formData,
    state,
    updateScene,
    saveScene,
    previewScene,
    canPerformAction
  } = useSceneAuthoring<GraphSceneData>(scene);

  // UI state
  const [activeTab, setActiveTab] = useState<'metadata' | 'nodes' | 'edges' | 'style' | 'config'>('metadata');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [showNodeSelection, setShowNodeSelection] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Check permissions
  const canUseGraphAuthoring = effectivePermissions.canUseGraphAuthoring();
  const canCreateNode = effectivePermissions.canCreateNode();
  const canCreateEdge = effectivePermissions.canCreateEdge();
  const canModifyCoreGraph = effectivePermissions.canModifyCoreGraph();
  const canSave = canPerformAction('save', 'graph');
  const canPreview = canPerformAction('preview', 'graph');

  // Initialize selected nodes
  useEffect(() => {
    if (formData?.nodes) {
      setSelectedNodes(formData.nodes);
    }
  }, [formData?.nodes]);

  // Handle form field changes
  const handleFieldChange = (field: keyof GraphSceneData, value: any) => {
    updateScene({ [field]: value } as Partial<GraphSceneData>);
  };

  const handleMetadataChange = (field: string, value: any) => {
    updateScene({
      metadata: {
        ...formData?.metadata,
        [field]: value
      }
    } as Partial<GraphSceneData>);
  };

  const handleConfigChange = (field: keyof GraphSceneData['config'], value: any) => {
    updateScene({
      config: {
        ...formData?.config,
        [field]: value
      }
    } as Partial<GraphSceneData>);
  };

  const handleStyleChange = (field: keyof GraphSceneData['style'], value: any) => {
    updateScene({
      style: {
        ...formData?.style,
        [field]: value
      }
    } as Partial<GraphSceneData>);
  };

  // Handle node selection
  const handleNodeSelection = (nodeIds: string[]) => {
    setSelectedNodes(nodeIds);
    updateScene({
      nodes: nodeIds
    } as Partial<GraphSceneData>);
    
    // Auto-import edges for connected nodes
    const newEdges = generateEdgesForNodes(nodeIds, availableNodes);
    updateScene({
      edges: newEdges
    } as Partial<GraphSceneData>);
  };

  // Generate edges for connected nodes
  const generateEdgesForNodes = (nodeIds: string[], nodes: NodeMetadata[]): GraphEdge[] => {
    const edges: GraphEdge[] = [];
    
    // Simple edge generation - create edges between nodes that share tags
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const node1 = nodes.find(n => n.id === nodeIds[i]);
        const node2 = nodes.find(n => n.id === nodeIds[j]);
        
        if (node1 && node2) {
          const commonTags = node1.tags?.filter(tag => node2.tags?.includes(tag)) || [];
          if (commonTags.length > 0) {
            edges.push({
              id: `edge-${nodeIds[i]}-${nodeIds[j]}`,
              source: nodeIds[i],
              target: nodeIds[j],
              type: 'related',
              label: `Related via ${commonTags[0]}`,
              visible: true
            });
          }
        }
      }
    }
    
    return edges;
  };

  // Handle edge management
  const addEdge = () => {
    if (!canCreateEdge) return;
    
    const newEdge: GraphEdge = {
      id: `edge-${Date.now()}`,
      source: selectedNodes[0] || '',
      target: selectedNodes[1] || '',
      type: 'custom',
      label: 'Custom Edge',
      visible: true
    };

    updateScene({
      edges: [...(formData?.edges || []), newEdge]
    } as Partial<GraphSceneData>);
  };

  const removeEdge = (edgeId: string) => {
    updateScene({
      edges: formData?.edges.filter(edge => edge.id !== edgeId) || []
    } as Partial<GraphSceneData>);
  };

  const updateEdge = (edgeId: string, updates: Partial<GraphEdge>) => {
    updateScene({
      edges: formData?.edges.map(edge => 
        edge.id === edgeId ? { ...edge, ...updates } : edge
      ) || []
    } as Partial<GraphSceneData>);
  };

  // Handle tag management
  const addTag = () => {
    if (newTag.trim() && !formData?.metadata.tags?.includes(newTag.trim())) {
      updateScene({
        metadata: {
          ...formData?.metadata,
          tags: [...(formData?.metadata.tags || []), newTag.trim()]
        }
      } as Partial<GraphSceneData>);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateScene({
      metadata: {
        ...formData?.metadata,
        tags: formData?.metadata.tags?.filter(tag => tag !== tagToRemove) || []
      }
    } as Partial<GraphSceneData>);
  };

  // Handle save
  const handleSave = async () => {
    if (!canSave || !formData) return;
    
    const success = await saveScene(formData);
    if (success) {
      onSave(formData);
    }
  };

  // Handle preview
  const handlePreview = async () => {
    if (!canPreview || !formData) return;
    
    const success = await previewScene(formData);
    if (success) {
      onPreview(formData);
    }
  };

  // Permission denied component
  if (!canUseGraphAuthoring) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold mb-2">Permission Required</h3>
        <p className="text-muted-foreground mb-4">
          You need Contributor level access to use graph authoring tools.
        </p>
        <Button onClick={onCancel} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </Card>
    );
  }

  return (
    <div className={`graph-scene-authoring ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Graph Scene Authoring</h2>
          <p className="text-sm text-muted-foreground">
            Create interactive graph visualizations with nodes and edges
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={!canPreview || state.isPreviewing}
          >
            <Eye className="h-4 w-4 mr-2" />
            {state.isPreviewing ? 'Previewing...' : 'Preview'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave || state.isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {state.isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Error display */}
      {state.errors.length > 0 && (
        <Card className="p-4 border-destructive/20 bg-destructive/5 mb-4">
          <h4 className="font-medium text-destructive mb-2">Validation Errors</h4>
          <ul className="text-sm text-destructive space-y-1">
            {state.errors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="metadata">
            <Settings className="h-4 w-4 mr-2" />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="nodes">
            Nodes ({selectedNodes.length})
          </TabsTrigger>
          <TabsTrigger value="edges">
            Edges ({formData?.edges.length || 0})
          </TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-4">
          <h3 className="text-lg font-medium">Scene Metadata</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scene-name">Scene Name</Label>
              <Input
                id="scene-name"
                value={formData?.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Enter scene name"
              />
            </div>

            <div>
              <Label htmlFor="scene-title">Title</Label>
              <Input
                id="scene-title"
                value={formData?.metadata.title || ''}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                placeholder="Enter scene title"
              />
            </div>

            <div>
              <Label htmlFor="scene-subtitle">Subtitle</Label>
              <Input
                id="scene-subtitle"
                value={formData?.metadata.subtitle || ''}
                onChange={(e) => handleMetadataChange('subtitle', e.target.value)}
                placeholder="Enter scene subtitle"
              />
            </div>

            <div>
              <Label htmlFor="scene-author">Author</Label>
              <Input
                id="scene-author"
                value={formData?.metadata.author || ''}
                onChange={(e) => handleMetadataChange('author', e.target.value)}
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="scene-description">Description</Label>
            <Textarea
              id="scene-description"
              value={formData?.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Enter scene description"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData?.metadata.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Nodes Tab */}
        <TabsContent value="nodes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Nodes</h3>
            <Button
              onClick={() => setShowNodeSelection(!showNodeSelection)}
              variant="outline"
            >
              {showNodeSelection ? <EyeOff className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
              {showNodeSelection ? 'Hide Selection' : 'Select Nodes'}
            </Button>
          </div>

          {showNodeSelection ? (
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
                allowCreate: canCreateNode
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedNodes.map(nodeId => {
                const node = availableNodes.find(n => n.id === nodeId);
                return node ? (
                  <Card key={nodeId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{node.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {node.type}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNodeSelection(selectedNodes.filter(id => id !== nodeId))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ) : null;
              })}
            </div>
          )}
        </TabsContent>

        {/* Edges Tab */}
        <TabsContent value="edges" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Edges</h3>
            <Button
              onClick={addEdge}
              disabled={!canCreateEdge || selectedNodes.length < 2}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Edge
            </Button>
          </div>

          <div className="space-y-2">
            {formData?.edges.map(edge => {
              const sourceNode = availableNodes.find(n => n.id === edge.source);
              const targetNode = availableNodes.find(n => n.id === edge.target);
              
              return (
                <Card key={edge.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{sourceNode?.name || edge.source}</Badge>
                      <span>→</span>
                      <Badge variant="outline">{targetNode?.name || edge.target}</Badge>
                      {edge.label && (
                        <span className="text-sm text-muted-foreground">({edge.label})</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEdge(edge.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-4">
          <h3 className="text-lg font-medium">Style Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                value={formData?.style.theme || 'default'}
                onChange={(e) => handleStyleChange('theme', e.target.value)}
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
                value={formData?.style.layout || 'force'}
                onChange={(e) => handleStyleChange('layout', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="force">Force Layout</option>
                <option value="hierarchical">Hierarchical</option>
                <option value="circular">Circular</option>
                <option value="grid">Grid</option>
              </select>
            </div>
          </div>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-4">
          <h3 className="text-lg font-medium">Configuration</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-labels"
                checked={formData?.config.showLabels || false}
                onChange={(e) => handleConfigChange('showLabels', e.target.checked)}
              />
              <Label htmlFor="show-labels">Show Labels</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-edges"
                checked={formData?.config.showEdges || false}
                onChange={(e) => handleConfigChange('showEdges', e.target.checked)}
              />
              <Label htmlFor="show-edges">Show Edges</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allow-interaction"
                checked={formData?.config.allowInteraction || false}
                onChange={(e) => handleConfigChange('allowInteraction', e.target.checked)}
              />
              <Label htmlFor="allow-interaction">Allow Interaction</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-layout"
                checked={formData?.config.autoLayout || false}
                onChange={(e) => handleConfigChange('autoLayout', e.target.checked)}
              />
              <Label htmlFor="auto-layout">Auto Layout</Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GraphSceneAuthoring;
