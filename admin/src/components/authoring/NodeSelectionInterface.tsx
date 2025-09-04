import React, { useState, useMemo } from 'react';
import { Search, Grid, List, Check, X, Plus, Filter } from 'lucide-react';
import { Button, Input, Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@progress/shared';

// Types for the node selection interface
export interface NodeMetadata {
  id: string;
  name: string;
  type: string;
  description?: string;
  tags?: string[];
  properties?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NodeSelectionOptions {
  mode: 'single' | 'multi';
  viewMode: 'graph' | 'list' | 'cards';
  searchEnabled: boolean;
  filterEnabled: boolean;
  showMetadata: boolean;
  allowCreate: boolean;
}

export interface NodeSelectionProps {
  nodes: NodeMetadata[];
  selectedNodes: string[];
  onSelectionChange: (nodeIds: string[]) => void;
  onNodeCreate?: () => void;
  options?: Partial<NodeSelectionOptions>;
  className?: string;
}

const NodeSelectionInterface: React.FC<NodeSelectionProps> = ({
  nodes,
  selectedNodes,
  onSelectionChange,
  onNodeCreate,
  options = {},
  className = ''
}) => {
  // Default options
  const defaultOptions: NodeSelectionOptions = {
    mode: 'single',
    viewMode: 'graph',
    searchEnabled: true,
    filterEnabled: true,
    showMetadata: true,
    allowCreate: false
  };

  const finalOptions = { ...defaultOptions, ...options };

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedViewMode, setSelectedViewMode] = useState<'graph' | 'list' | 'cards'>(finalOptions.viewMode);
  const [filterType, setFilterType] = useState<string>('all');
  const [isMultiSelect, setIsMultiSelect] = useState(finalOptions.mode === 'multi');

  // Get unique node types for filtering
  const nodeTypes = useMemo(() => {
    const types = new Set(nodes.map(node => node.type));
    return Array.from(types).sort();
  }, [nodes]);

  // Filter and search nodes
  const filteredNodes = useMemo(() => {
    let filtered = nodes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(node => 
        node.name.toLowerCase().includes(query) ||
        node.description?.toLowerCase().includes(query) ||
        node.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        node.type.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(node => node.type === filterType);
    }

    return filtered;
  }, [nodes, searchQuery, filterType]);

  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    if (isMultiSelect) {
      const newSelection = selectedNodes.includes(nodeId)
        ? selectedNodes.filter(id => id !== nodeId)
        : [...selectedNodes, nodeId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([nodeId]);
    }
  };

  // Handle multi-select toggle
  const toggleMultiSelect = () => {
    setIsMultiSelect(!isMultiSelect);
    if (!isMultiSelect) {
      // Switching to single select - keep only first selected
      onSelectionChange(selectedNodes.slice(0, 1));
    }
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'graph' | 'list' | 'cards') => {
    setSelectedViewMode(mode);
  };

  // Clear selection
  const clearSelection = () => {
    onSelectionChange([]);
  };

  // Select all (multi-select only)
  const selectAll = () => {
    if (isMultiSelect) {
      onSelectionChange(filteredNodes.map(node => node.id));
    }
  };

  return (
    <div className={`node-selection-interface ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4 p-4 bg-background border border-border rounded-lg">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Node Selection</h3>
          <Badge variant="secondary">
            {selectedNodes.length} selected
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Multi-select toggle */}
          <Button
            variant={isMultiSelect ? "default" : "outline"}
            size="sm"
            onClick={toggleMultiSelect}
          >
            {isMultiSelect ? "Multi" : "Single"}
          </Button>
          
          {/* Clear selection */}
          {selectedNodes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          
          {/* Select all (multi-select only) */}
          {isMultiSelect && filteredNodes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              Select All
            </Button>
          )}
          
          {/* Create new node */}
          {finalOptions.allowCreate && onNodeCreate && (
            <Button
              variant="default"
              size="sm"
              onClick={onNodeCreate}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Node
            </Button>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-4 space-y-3">
        {/* Search bar */}
        {finalOptions.searchEnabled && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes by name, description, tags, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Filters */}
        {finalOptions.filterEnabled && nodeTypes.length > 0 && (
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all">All Types</option>
              {nodeTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* View mode tabs */}
      <Tabs value={selectedViewMode} onValueChange={(value) => handleViewModeChange(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="graph">
            <Grid className="h-4 w-4 mr-2" />
            Graph View
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="cards">
            <Grid className="h-4 w-4 mr-2" />
            Card View
          </TabsTrigger>
        </TabsList>

        {/* Graph View */}
        <TabsContent value="graph" className="mt-0">
          <div className="border border-border rounded-lg p-4 min-h-[400px] bg-muted/20">
            <div className="text-center text-muted-foreground">
              <Grid className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Graph view will be integrated with Graph Studio</p>
              <p className="text-sm">Showing {filteredNodes.length} nodes</p>
            </div>
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-0">
          <div className="border border-border rounded-lg">
            <div className="divide-y divide-border">
              {filteredNodes.map((node) => {
                const isSelected = selectedNodes.includes(node.id);
                return (
                  <div
                    key={node.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => handleNodeSelect(node.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{node.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {node.type}
                          </Badge>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        {node.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {node.description}
                          </p>
                        )}
                        {node.tags && node.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {node.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(node.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredNodes.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No nodes found matching your criteria</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Card View */}
        <TabsContent value="cards" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNodes.map((node) => {
              const isSelected = selectedNodes.includes(node.id);
              return (
                <Card
                  key={node.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleNodeSelect(node.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{node.name}</h4>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    
                    <Badge variant="outline" className="text-xs mb-2">
                      {node.type}
                    </Badge>
                    
                    {node.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {node.description}
                      </p>
                    )}
                    
                    {node.tags && node.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {node.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {node.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{node.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      Updated {new Date(node.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          {filteredNodes.length === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No nodes found matching your criteria</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Selection summary */}
      {selectedNodes.length > 0 && (
        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {selectedNodes.length} node{selectedNodes.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedNodes.map(id => {
                  const node = nodes.find(n => n.id === id);
                  return node?.name;
                }).filter(Boolean).join(', ')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeSelectionInterface;
