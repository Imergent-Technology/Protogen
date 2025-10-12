/**
 * SceneContainer
 * 
 * Main scene rendering container for scene-first routing
 * Renders either system scenes or user/admin-authored scenes
 */

import React, { useEffect, useState } from 'react';
import { useSceneForContext, getSystemSceneComponent, isSystemScene } from '@protogen/shared/systems/scene';
import { SceneViewer } from './SceneViewer';
import { useScene } from '@protogen/shared/systems/scene';

export const SceneContainer: React.FC = () => {
  const sceneId = useSceneForContext();
  console.log('SceneContainer rendering, sceneId:', sceneId);
  const [isLoading, setIsLoading] = useState(true);

  // Check if this is a system scene
  const isSystem = isSystemScene(sceneId);
  console.log('Is system scene?', isSystem);

  // For system scenes, get the component
  const SystemSceneComponent = isSystem ? getSystemSceneComponent(sceneId) : null;

  // For authored scenes, load the scene data
  const { currentScene, isLoading: isSceneLoading } = useScene(isSystem ? null : sceneId);

  useEffect(() => {
    // Determine loading state
    if (isSystem) {
      setIsLoading(false);
    } else {
      setIsLoading(isSceneLoading);
    }
  }, [isSystem, isSceneLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading scene...</p>
        </div>
      </div>
    );
  }

  // Render system scene
  if (isSystem && SystemSceneComponent) {
    return (
      <div className="scene-container h-full w-full">
        <SystemSceneComponent />
      </div>
    );
  }

  // Render authored scene
  if (currentScene) {
    return (
      <div className="scene-container h-full w-full">
        <SceneViewer sceneId={currentScene.id} />
      </div>
    );
  }

  // Fallback: Scene not found
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md p-8">
        <h2 className="text-2xl font-bold mb-4">Scene Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The scene "{sceneId}" could not be loaded.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default SceneContainer;

