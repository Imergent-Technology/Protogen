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
  console.log('useSceneForContext - currentContext:', currentContext);
  console.log('useSceneForContext - contextPath:', currentContext.contextPath);
  console.log('useSceneForContext - timestamp:', currentContext.timestamp);
  
  // Use useMemo to recompute only when context properties change
  const sceneId = useMemo(() => {
    const result = sceneRouter.getSceneForContext(currentContext);
    console.log('useSceneForContext - computed sceneId from path:', currentContext.contextPath, '→', result);
    return result;
  }, [
    currentContext.contextPath,
    currentContext.sceneId,
    currentContext.sceneSlug
  ]);
  
  return sceneId;
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

