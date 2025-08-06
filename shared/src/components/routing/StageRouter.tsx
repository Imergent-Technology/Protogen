import { useEffect, useState } from 'react';
import { useStageManager } from '../../hooks/useStageManager';
import { Stage } from '../../types/stage';

interface StageRouterProps {
  children: React.ReactNode;
  basePath?: string;
  onRouteChange?: (path: string, stage?: Stage) => void;
}

export function StageRouter({ 
  children, 
  basePath = '/stages',
  onRouteChange 
}: StageRouterProps) {
  const { stageManager, navigateToStage } = useStageManager();
  const [currentPath, setCurrentPath] = useState('');

  // Simple client-side routing (can be replaced with React Router, Next.js router, etc.)
  useEffect(() => {
    const handlePathChange = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      
      // Parse stage route: /stages/:stageId
      if (path.startsWith(basePath)) {
        const segments = path.replace(basePath, '').split('/').filter(Boolean);
        const stageId = segments[0];
        
        if (stageId) {
          const stage = stageManager.getStage(stageId);
          if (stage) {
            navigateToStage(stageId, {}, path);
          }
        }
      }
      
      onRouteChange?.(path);
    };

    // Handle initial load
    handlePathChange();

    // Listen for browser navigation
    window.addEventListener('popstate', handlePathChange);
    
    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, [basePath, stageManager, navigateToStage, onRouteChange]);

  // Update URL when stage manager navigates
  useEffect(() => {
    // Note: This would ideally be done through the StageManager config,
    // but we're keeping it simple for now
    return () => {};
  }, [currentPath]);

  return <>{children}</>;
}

// Route generation utilities
export const stageRoutes = {
  stage: (stageId: string) => `/stages/${stageId}`,
  dashboard: () => '/dashboard',
  settings: () => '/settings',
  help: () => '/help',
};

// Navigation helper that updates both StageManager and URL
export function useStageNavigation() {
  const { navigateToStage } = useStageManager();

  const navigateTo = async (path: string, stageId?: string) => {
    if (stageId) {
      const success = await navigateToStage(stageId, {}, path);
      if (success) {
        window.history.pushState({}, '', path);
      }
      return success;
    } else {
      // Simple navigation without stage
      window.history.pushState({}, '', path);
      return true;
    }
  };

  const navigateToStageById = async (stageId: string) => {
    const path = stageRoutes.stage(stageId);
    return navigateTo(path, stageId);
  };

  return {
    navigateTo,
    navigateToStageById,
    routes: stageRoutes,
  };
}