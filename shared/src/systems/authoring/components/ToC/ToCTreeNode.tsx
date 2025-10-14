/**
 * ToCTreeNode Component - M1 Week 6
 * 
 * Individual tree node with preview thumbnail and expansion controls.
 * Recursive component for hierarchical rendering.
 * 
 * Based on Spec 08: ToC Drawer Integration
 */

import React from 'react';
import { usePreview } from '../../hooks/usePreview';
import type { ToCNode, ToCConfig } from '../../types/toc';
import type { PreviewTarget } from '../../types/preview';

export interface ToCTreeNodeProps {
  node: ToCNode;
  depth: number;
  expanded: boolean;
  config: ToCConfig;
  onClick: (node: ToCNode) => void;
  onToggle: (nodeId: string) => void;
}

export function ToCTreeNode({
  node,
  depth,
  expanded,
  config,
  onClick,
  onToggle
}: ToCTreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;

  // Load preview if configured
  const previewTarget: PreviewTarget | null = config.showThumbnails
    ? getPreviewTarget(node)
    : null;

  const { dataUrl: previewUrl, loading: previewLoading } = usePreview(
    previewTarget,
    config.thumbnailSize
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(node);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(node.id);
  };

  const icon = getNodeIcon(node.type);
  const indentStyle = { paddingLeft: `${depth * 20}px` };

  return (
    <div
      className={`toc-node toc-node--${node.type} ${node.state?.current ? 'toc-node--current' : ''} ${node.state?.selected ? 'toc-node--selected' : ''}`}
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={node.state?.selected}
      aria-level={depth + 1}
    >
      {/* Node content */}
      <div
        className="toc-node__content"
        style={indentStyle}
        onClick={handleClick}
      >
        {/* Expand/collapse toggle */}
        {hasChildren && (
          <button
            className={`toc-node__toggle ${expanded ? 'toc-node__toggle--expanded' : ''}`}
            onClick={handleToggle}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d={expanded ? 'M2 4 L6 8 L10 4' : 'M4 2 L8 6 L4 10'} fill="currentColor" />
            </svg>
          </button>
        )}

        {/* Icon */}
        <span className="toc-node__icon">{icon}</span>

        {/* Preview thumbnail */}
        {config.showThumbnails && (
          <div className="toc-node__thumbnail">
            {previewLoading ? (
              <div className="toc-node__thumbnail-loading" />
            ) : previewUrl || node.preview ? (
              <img
                src={previewUrl || node.preview}
                alt={`Preview of ${node.label}`}
                className="toc-node__thumbnail-image"
              />
            ) : (
              <div className="toc-node__thumbnail-placeholder">
                {icon}
              </div>
            )}
          </div>
        )}

        {/* Label */}
        <span className="toc-node__label">{node.label}</span>

        {/* Item count */}
        {config.showItemCounts && node.metadata?.itemCount !== undefined && (
          <span className="toc-node__count">
            ({node.metadata.itemCount})
          </span>
        )}

        {/* Metadata badges */}
        {node.metadata && (
          <div className="toc-node__metadata">
            {node.metadata.duration && (
              <span className="toc-node__badge">
                {formatDuration(node.metadata.duration)}
              </span>
            )}
            {node.metadata.wordCount && (
              <span className="toc-node__badge">
                {node.metadata.wordCount} words
              </span>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="toc-node__children">
          {node.children!.map((child) => (
            <ToCTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded} // Would need separate tracking per node
              config={config}
              onClick={onClick}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions
function getNodeIcon(type: string): string {
  const icons: Record<string, string> = {
    deck: '📚',
    scene: '🎬',
    slide: '📄',
    page: '📝',
    section: '📑'
  };
  return icons[type] || '•';
}

function getPreviewTarget(node: ToCNode): PreviewTarget | null {
  switch (node.type) {
    case 'scene':
      return {
        type: 'scene',
        sceneId: node.id
      };
    case 'slide':
      // Extract scene ID from parent context (would be passed in props)
      return {
        type: 'slide',
        sceneId: 'scene-1', // TODO: Get from context
        slideId: node.id
      };
    case 'page':
      return {
        type: 'page',
        sceneId: 'scene-1', // TODO: Get from context
        pageId: node.id
      };
    default:
      return null;
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Export default
export default ToCTreeNode;

