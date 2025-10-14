/**
 * ToCDrawer Component - M1 Week 6
 * 
 * ToC integration with Toolbar left drawer.
 * Provides navigation interface for deck structure in authoring mode.
 * 
 * Based on Spec 08: ToC Drawer Integration
 */

import React from 'react';
import { useNavigator } from '../../../navigator/useNavigator';
import { ToCTree } from './ToCTree';
import type { ToCConfig } from '../../types/toc';

export interface ToCDrawerProps {
  deckId?: string;
  sceneId?: string;
  config?: Partial<ToCConfig>;
  className?: string;
}

export function ToCDrawer({
  deckId,
  sceneId,
  config,
  className = ''
}: ToCDrawerProps) {
  const { mode, tocOpen, toggleToc } = useNavigator();

  // Only show in author mode
  if (mode !== 'author') {
    return null;
  }

  return (
    <div className={`toc-drawer ${tocOpen ? 'toc-drawer--open' : ''} ${className}`}>
      {/* Header */}
      <div className="toc-drawer__header">
        <h2 className="toc-drawer__title">Table of Contents</h2>
        <button
          className="toc-drawer__close"
          onClick={toggleToc}
          aria-label="Close ToC"
        >
          ×
        </button>
      </div>

      {/* ToC Tree */}
      <div className="toc-drawer__content">
        <ToCTree
          deckId={deckId}
          sceneId={sceneId}
          config={config}
        />
      </div>
    </div>
  );
}

// Export default
export default ToCDrawer;

