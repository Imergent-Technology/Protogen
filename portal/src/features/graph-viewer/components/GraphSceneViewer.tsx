/**
 * GraphSceneViewer Component
 * 
 * Displays graph scenes in the portal with interactive exploration.
 */

import { useState } from 'react';
import { GraphStudio } from '@protogen/shared/systems/graph-studio';
import { CoreGraphNode } from '@protogen/shared';
import { useGraphScene } from '../hooks/useGraphScene';
import { NodeDetailDialog } from './NodeDetailDialog';

export interface GraphSceneViewerProps {
  /**
   * Scene ID to display
   */
  sceneId?: string | number;
  
  /**
   * Subgraph ID (overrides sceneId)
   */
  subgraphId?: string | number;
  
  /**
   * Additional className
   */
  className?: string;
}

/**
 * GraphSceneViewer - Graph visualization for portal
 * 
 * Provides interactive graph exploration with node selection and details.
 */
export function GraphSceneViewer({
  sceneId,
  subgraphId,
  className = '',
}: GraphSceneViewerProps) {
  const { loading } = useGraphScene({
    sceneId,
    subgraphId,
    autoLoad: true,
  });

  const [showNodeDetail, setShowNodeDetail] = useState(false);
  const [detailNode, setDetailNode] = useState<CoreGraphNode | null>(null);

  // Handle node selection
  const handleNodeSelect = (node: CoreGraphNode | null) => {
    if (node) {
      setDetailNode(node);
      setShowNodeDetail(true);
    } else {
      setShowNodeDetail(false);
    }
  };

  // Handle node right-click (future: context menu)
  const handleNodeRightClick = (node: CoreGraphNode, event: MouseEvent) => {
    event.preventDefault();
    setDetailNode(node);
    setShowNodeDetail(true);
  };

  // Close detail dialog
  const handleCloseDetail = () => {
    setShowNodeDetail(false);
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <GraphStudio
        subgraphId={subgraphId}
        onNodeSelect={handleNodeSelect}
        onNodeRightClick={handleNodeRightClick}
        loading={loading}
        className="w-full h-full"
      />

      {/* Node Detail Dialog */}
      {showNodeDetail && detailNode && (
        <NodeDetailDialog
          node={detailNode}
          isOpen={showNodeDetail}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}

