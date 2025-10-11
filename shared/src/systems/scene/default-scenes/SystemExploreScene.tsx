/**
 * SystemExploreScene
 * 
 * Content exploration scene
 */

import React from 'react';
import type { SystemSceneMetadata } from './SystemHomeScene';

export const SYSTEM_EXPLORE_SCENE_ID = 'system-explore';

export const SystemExploreSceneMetadata: SystemSceneMetadata = {
  id: SYSTEM_EXPLORE_SCENE_ID,
  name: 'Explore',
  description: 'Discover content',
  slug: 'explore'
};

export const SystemExploreScene: React.FC = () => {
  return (
    <div className="h-full p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Explore</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Discover scenes, decks, and content across the platform
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder content cards */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 bg-card rounded-lg border hover:border-primary transition-colors cursor-pointer">
              <div className="aspect-video bg-muted rounded mb-4" />
              <h3 className="font-semibold mb-2">Content {i}</h3>
              <p className="text-sm text-muted-foreground">
                Explore this content...
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemExploreScene;

