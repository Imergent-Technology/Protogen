import { useState, useMemo, useCallback } from 'react';
import { NodeMetadata, NodeSelectionOptions, NodeFilter, NodeSearchResult, NodeSearchOptions } from '../types';

/**
 * Hook for managing node selection state and operations
 */
export const useNodeSelection = (
  nodes: NodeMetadata[],
  selectedNodes: string[],
  onSelectionChange: (nodeIds: string[]) => void,
  options: Partial<NodeSelectionOptions> = {}
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<NodeFilter>({});
  const [viewMode, setViewMode] = useState<'graph' | 'list' | 'cards'>('graph');
  
  const defaultOptions: NodeSelectionOptions = {
    mode: 'single',
    viewMode: 'graph',
    searchEnabled: true,
    filterEnabled: true,
    showMetadata: true,
    allowCreate: false,
    ...options
  };
  
  // Filter and search nodes
  const filteredNodes = useMemo(() => {
    let filtered = [...nodes];
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(node => 
        node.name.toLowerCase().includes(query) ||
        node.description?.toLowerCase().includes(query) ||
        node.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(node => node.type === filters.type);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(node => 
        node.tags?.some(tag => filters.tags!.includes(tag))
      );
    }
    
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(node => {
        const nodeDate = new Date(node.createdAt);
        return nodeDate >= startDate && nodeDate <= endDate;
      });
    }
    
    if (filters.properties) {
      filtered = filtered.filter(node => {
        return Object.entries(filters.properties!).every(([key, value]) => 
          node.properties?.[key] === value
        );
      });
    }
    
    return filtered;
  }, [nodes, searchQuery, filters]);
  
  // Search nodes with scoring
  const searchNodes = useCallback((searchOptions: NodeSearchOptions): NodeSearchResult[] => {
    const { query, limit = 10, includeMetadata = true } = searchOptions;
    
    if (!query.trim()) {
      return filteredNodes.slice(0, limit).map(node => ({
        node,
        score: 1,
        highlights: []
      }));
    }
    
    const results = filteredNodes
      .map(node => {
        let score = 0;
        const highlights: string[] = [];
        const queryLower = query.toLowerCase();
        
        // Name match (highest score)
        if (node.name.toLowerCase().includes(queryLower)) {
          score += 10;
          highlights.push(`Name: ${node.name}`);
        }
        
        // Description match
        if (node.description?.toLowerCase().includes(queryLower)) {
          score += 5;
          highlights.push(`Description: ${node.description}`);
        }
        
        // Tag match
        if (node.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
          score += 3;
          const matchingTags = node.tags.filter(tag => tag.toLowerCase().includes(queryLower));
          highlights.push(`Tags: ${matchingTags.join(', ')}`);
        }
        
        // Type match
        if (node.type.toLowerCase().includes(queryLower)) {
          score += 2;
          highlights.push(`Type: ${node.type}`);
        }
        
        return {
          node,
          score,
          highlights: includeMetadata ? highlights : []
        };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return results;
  }, [filteredNodes]);
  
  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    if (defaultOptions.mode === 'single') {
      onSelectionChange([nodeId]);
    } else {
      const newSelection = selectedNodes.includes(nodeId)
        ? selectedNodes.filter(id => id !== nodeId)
        : [...selectedNodes, nodeId];
      onSelectionChange(newSelection);
    }
  }, [selectedNodes, onSelectionChange, defaultOptions.mode]);
  
  // Handle node deselection
  const handleNodeDeselect = useCallback((nodeId: string) => {
    const newSelection = selectedNodes.filter(id => id !== nodeId);
    onSelectionChange(newSelection);
  }, [selectedNodes, onSelectionChange]);
  
  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (defaultOptions.mode === 'multi') {
      onSelectionChange(filteredNodes.map(node => node.id));
    }
  }, [filteredNodes, onSelectionChange, defaultOptions.mode]);
  
  // Handle deselect all
  const handleDeselectAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);
  
  // Get selected node metadata
  const selectedNodeMetadata = useMemo(() => {
    return nodes.filter(node => selectedNodes.includes(node.id));
  }, [nodes, selectedNodes]);
  
  // Check if node is selected
  const isNodeSelected = useCallback((nodeId: string) => {
    return selectedNodes.includes(nodeId);
  }, [selectedNodes]);
  
  // Get selection count
  const selectionCount = selectedNodes.length;
  
  // Get available node types
  const availableTypes = useMemo(() => {
    const types = new Set(nodes.map(node => node.type));
    return Array.from(types);
  }, [nodes]);
  
  // Get available tags
  const availableTags = useMemo(() => {
    const tags = new Set(nodes.flatMap(node => node.tags || []));
    return Array.from(tags);
  }, [nodes]);
  
  return {
    // State
    searchQuery,
    filters,
    viewMode,
    filteredNodes,
    selectedNodeMetadata,
    selectionCount,
    availableTypes,
    availableTags,
    
    // Actions
    setSearchQuery,
    setFilters,
    setViewMode,
    handleNodeSelect,
    handleNodeDeselect,
    handleSelectAll,
    handleDeselectAll,
    searchNodes,
    isNodeSelected,
    
    // Options
    options: defaultOptions
  };
};
