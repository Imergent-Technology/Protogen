import React from 'react';
import { Search, Grid, List, Check, X, Plus, Filter } from 'lucide-react';
import { Button, Input, Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@protogen/shared';
import { NodeSelectionProps, NodeSelectionOptions, NodeMetadata } from '../types';
import { useNodeSelection } from '../hooks/useNodeSelection';
import { useAuthoringPermissions } from '../hooks/useAuthoringPermissions';

const NodeSelectionInterface: React.FC<NodeSelectionProps> = ({
  nodes,
  selectedNodes,
  onSelectionChange,
  onNodeCreate,
  options = {},
  className = ''
}) => {
  const permissions = useAuthoringPermissions();
  
  const {
    searchQuery,
    filters,
    viewMode,
    filteredNodes,
    selectedNodeMetadata,
    selectionCount,
    availableTypes,
    availableTags,
    setSearchQuery,
    setFilters,
    setViewMode,
    handleNodeSelect,
    handleNodeDeselect,
    handleSelectAll,
    handleDeselectAll,
    searchNodes,
    isNodeSelected,
    options: finalOptions
  } = useNodeSelection(nodes, selectedNodes, onSelectionChange, options);

  // Check if user can create nodes
  const canCreateNode = permissions.canCreateNode && onNodeCreate;

  // Handle node selection with permission check
  const handleNodeSelectWithPermission = (nodeId: string) => {
    if (!permissions.canUseNodeSelection()) {
      return;
    }
    handleNodeSelect(nodeId);
  };

  // Handle multi-select toggle
  const toggleMultiSelect = () => {
    const newMode = finalOptions.mode === 'single' ? 'multi' : 'single';
    if (newMode === 'single') {
      // Switching to single select - keep only first selected
      onSelectionChange(selectedNodes.slice(0, 1));
    }
  };

  // Clear selection
  const clearSelection = () => {
    onSelectionChange([]);
  };

  // Select all (multi-select only)
  const selectAll = () => {
    if (finalOptions.mode === 'multi') {
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
            {selectionCount} selected
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Multi-select toggle */}
          <Button
            variant={finalOptions.mode === 'multi' ? "default" : "outline"}
            size="sm"
            onClick={toggleMultiSelect}
            disabled={!permissions.canUseNodeSelection()}
          >
            {finalOptions.mode === 'multi' ? "Multi" : "Single"}
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
          {finalOptions.mode === 'multi' && filteredNodes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              Select All
            </Button>
          )}
          
          {/* Create new node */}
          {canCreateNode && (
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
        {finalOptions.filterEnabled && availableTypes.length > 0 && (
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filters.type || 'all'}
              onChange={(e) => setFilters({ ...filters, type: e.target.value === 'all' ? undefined : e.target.value })}
              className="px-3 py-1 border border-border rounded-md bg-background text-foreground"
            >
              <option value="all">All Types</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* View mode tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
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
                const isSelected = isNodeSelected(node.id);
                return (
                  <div
                    key={node.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => handleNodeSelectWithPermission(node.id)}
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
              const isSelected = isNodeSelected(node.id);
              return (
                <Card
                  key={node.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleNodeSelectWithPermission(node.id)}
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
                {selectionCount} node{selectionCount !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedNodeMetadata.map(node => node.name).join(', ')}
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
