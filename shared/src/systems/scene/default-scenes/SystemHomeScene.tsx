/**
 * SystemHomeScene
 * 
 * Default landing scene for the portal
 */

import React from 'react';

export const SYSTEM_HOME_SCENE_ID = 'system-home';

export interface SystemSceneMetadata {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export const SystemHomeSceneMetadata: SystemSceneMetadata = {
  id: SYSTEM_HOME_SCENE_ID,
  name: 'Home',
  description: 'Welcome to Protogen',
  slug: 'home'
};

export const SystemHomeScene: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-background to-accent/20">
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to Protogen
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your scene-oriented platform for interactive content
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Navigate</h3>
            <p className="text-sm text-muted-foreground">
              Explore scenes and content through intuitive navigation
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Interact</h3>
            <p className="text-sm text-muted-foreground">
              Engage with dynamic content and leave comments
            </p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Discover</h3>
            <p className="text-sm text-muted-foreground">
              Find and bookmark interesting content
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHomeScene;

