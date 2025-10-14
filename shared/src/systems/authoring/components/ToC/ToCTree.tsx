/**
 * ToCTree Component - M1 Week 6
 * 
 * Table of Contents tree component with hierarchical navigation.
 * Supports preview thumbnails, keyboard navigation, and state sync.
 * 
 * Based on Spec 08: ToC Drawer Integration
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigator } from '../../../navigator/useNavigator';
import { useTocPreviews } from '../../hooks/useBatchPreviews';
import type { ToCNode, ToCConfig, DEFAULT_TOC_CONFIG } from '../../types/toc';
import { ToCTreeNode } from './ToCTreeNode';

export interface ToCTreeProps {
  deckId?: string;
  sceneId?: string;
  config?: Partial<ToCConfig>;
  onNodeClick?: (node: ToCNode) => void;
  className?: string;
}

export function ToCTree({
  deckId,
  sceneId,
  config: userConfig,
  onNodeClick,
  className = ''
}: ToCTreeProps) {
  const [tree, setTree] = useState<ToCNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const { currentItem, navigateToItem } = useNavigator();
  const treeRef = useRef<HTMLDivElement>(null);

  const config = { ...DEFAULT_TOC_CONFIG, ...userConfig };

  // Load tree data
  useEffect(() => {
    loadTreeData();
  }, [deckId, sceneId]);

  // Sync with Navigator
  useEffect(() => {
    if (config.syncWithNavigator && currentItem) {
      // Update current node in tree
      updateCurrentNode(currentItem.id);
    }
  }, [currentItem, config.syncWithNavigator]);

  // Expand default nodes
  useEffect(() => {
    if (tree && config.expandedByDefault) {
      expandAll();
    }
  }, [tree]);

  const loadTreeData = async () => {
    // TODO: Load from API in production
    // For M1, create mock data
    const mockTree: ToCNode = {
      id: deckId || 'deck-1',
      type: 'deck',
      label: 'My Deck',
      order: 0,
      metadata: { itemCount: 2 },
      children: [
        {
          id: 'scene-1',
          type: 'scene',
          label: 'Welcome Scene',
          order: 0,
          metadata: { sceneType: 'card', itemCount: 3 },
          state: { expanded: false, selected: false, current: false },
          children: [
            {
              id: 'slide-1',
              type: 'slide',
              label: 'Title Slide',
              order: 0,
              state: { expanded: false, selected: false, current: true }
            },
            {
              id: 'slide-2',
              type: 'slide',
              label: 'Features',
              order: 1,
              state: { expanded: false, selected: false, current: false }
            }
          ]
        },
        {
          id: 'scene-2',
          type: 'scene',
          label: 'Documentation',
          order: 1,
          metadata: { sceneType: 'document', itemCount: 2 },
          state: { expanded: false, selected: false, current: false },
          children: [
            {
              id: 'page-1',
              type: 'page',
              label: 'Getting Started',
              order: 0,
              metadata: { wordCount: 450 },
              state: { expanded: false, selected: false, current: false }
            }
          ]
        }
      ]
    };

    setTree(mockTree);
  };

  const updateCurrentNode = (nodeId: string) => {
    if (!tree) return;

    const updated = updateNodeState(tree, nodeId, { current: true });
    setTree({ ...updated });

    // Auto-expand parent nodes
    const path = findNodePath(tree, nodeId);
    if (path) {
      path.forEach(id => setExpandedNodes(prev => new Set([...prev, id])));
    }
  };

  const updateNodeState = (
    node: ToCNode,
    targetId: string,
    state: Partial<ToCNode['state']>
  ): ToCNode => {
    if (node.id === targetId) {
      return {
        ...node,
        state: { ...node.state, ...state } as ToCNode['state']
      };
    }

    if (node.children) {
      return {
        ...node,
        children: node.children.map(child => updateNodeState(child, targetId, state))
      };
    }

    return node;
  };

  const findNodePath = (node: ToCNode, targetId: string, path: string[] = []): string[] | null => {
    if (node.id === targetId) {
      return [...path, node.id];
    }

    if (node.children) {
      for (const child of node.children) {
        const result = findNodePath(child, targetId, [...path, node.id]);
        if (result) return result;
      }
    }

    return null;
  };

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleNodeClick = useCallback((node: ToCNode) => {
    // Toggle expansion for nodes with children
    if (node.children && node.children.length > 0) {
      toggleNode(node.id);
    }

    // Navigate based on node type
    if (node.type === 'slide' || node.type === 'page') {
      navigateToItem(node.id, node.type);
    }

    // Callback
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [toggleNode, navigateToItem, onNodeClick]);

  const expandAll = () => {
    if (!tree) return;
    const allIds = collectNodeIds(tree);
    setExpandedNodes(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const collectNodeIds = (node: ToCNode, ids: string[] = []): string[] => {
    ids.push(node.id);
    if (node.children) {
      node.children.forEach(child => collectNodeIds(child, ids));
    }
    return ids;
  };

  const filterTree = (node: ToCNode, query: string): ToCNode | null => {
    if (!query) return node;

    const matches = node.label.toLowerCase().includes(query.toLowerCase());
    const filteredChildren = node.children
      ?.map(child => filterTree(child, query))
      .filter(Boolean) as ToCNode[];

    if (matches || (filteredChildren && filteredChildren.length > 0)) {
      return {
        ...node,
        children: filteredChildren
      };
    }

    return null;
  };

  const displayTree = searchQuery && tree ? filterTree(tree, searchQuery) : tree;

  if (!displayTree) {
    return (
      <div className={`toc-tree toc-tree--empty ${className}`}>
        <div className="toc-tree__empty-state">
          <p>No content available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={treeRef}
      className={`toc-tree ${className}`}
      role="tree"
      aria-label="Table of Contents"
    >
      {/* Search */}
      {config.enableSearch && (
        <div className="toc-tree__search">
          <input
            type="text"
            className="toc-tree__search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search table of contents"
          />
        </div>
      )}

      {/* Actions */}
      <div className="toc-tree__actions">
        <button
          className="toc-tree__action"
          onClick={expandAll}
          aria-label="Expand all"
        >
          Expand All
        </button>
        <button
          className="toc-tree__action"
          onClick={collapseAll}
          aria-label="Collapse all"
        >
          Collapse All
        </button>
      </div>

      {/* Tree */}
      <div className="toc-tree__nodes">
        <ToCTreeNode
          node={displayTree}
          depth={0}
          expanded={expandedNodes.has(displayTree.id)}
          config={config}
          onClick={handleNodeClick}
          onToggle={toggleNode}
        />
      </div>
    </div>
  );
}

// Export default
export default ToCTree;

