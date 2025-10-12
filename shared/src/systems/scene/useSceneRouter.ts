/**
 * useSceneRouter Hook
 * 
 * React hook for scene routing based on navigation context
 */

import { useMemo } from 'react';
import { sceneRouter } from './SceneRouter';
import { useCurrentContext } from '../navigator/useNavigator';

/**
 * Hook to get the scene ID for the current navigation context
 */
export function useSceneForContext(): string {
  const currentContext = useCurrentContext();
  
  // Use useMemo to recompute only when context properties change
  return useMemo(() => {
    return sceneRouter.getSceneForContext(currentContext);
  }, [
    currentContext.contextPath,
    currentContext.sceneId,
    currentContext.sceneSlug
  ]);
}

/**
 * Hook to access the SceneRouter instance
 */
export function useSceneRouter() {
  return {
    getSceneForContext: (context: any) => sceneRouter.getSceneForContext(context),
    setSceneOverride: (pattern: string, sceneId: string, priority?: number) => 
      sceneRouter.setSceneOverride(pattern, sceneId, priority),
    removeSceneOverride: (pattern: string) => sceneRouter.removeSceneOverride(pattern),
    getDefaultScene: () => sceneRouter.getDefaultScene(),
    setDefaultScene: (sceneId: string) => sceneRouter.setDefaultScene(sceneId),
    loadConfiguration: (config: any) => sceneRouter.loadConfiguration(config),
    exportConfiguration: () => sceneRouter.exportConfiguration()
  };
}

