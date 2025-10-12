/**
 * useBreadcrumbs Hook
 * 
 * Computes breadcrumb trail from current navigation context
 */

import { useMemo } from 'react';
import { useCurrentContext } from './useNavigator';

export interface Breadcrumb {
  id: string;
  label: string;
  path: string;
  sceneId?: string;
  icon?: string;
  isActive?: boolean;
}

export interface UseBreadcrumbsOptions {
  maxItems?: number;
  showHome?: boolean;
  customLabels?: Record<string, string>;
}

/**
 * Hook to compute breadcrumb trail from current navigation context
 */
export function useBreadcrumbs(options: UseBreadcrumbsOptions = {}): Breadcrumb[] {
  const {
    maxItems = 5,
    showHome = true,
    customLabels = {}
  } = options;

  const currentContext = useCurrentContext();

  return useMemo(() => {
    const breadcrumbs: Breadcrumb[] = [];

    // Always add Home if requested
    if (showHome) {
      breadcrumbs.push({
        id: 'home',
        label: 'Home',
        path: '/',
        icon: 'home',
        isActive: !currentContext.contextPath || currentContext.contextPath === '/'
      });
    }

    // If we have a contextPath, parse it into breadcrumbs
    if (currentContext.contextPath && currentContext.contextPath !== '/') {
      const pathParts = currentContext.contextPath.split('/').filter(Boolean);
      
      let accumulatedPath = '';
      pathParts.forEach((part, index) => {
        accumulatedPath += `/${part}`;
        
        // Use custom label if provided, otherwise format the path part
        const label = customLabels[accumulatedPath] || formatPathPart(part);
        
        breadcrumbs.push({
          id: `path-${index}`,
          label,
          path: accumulatedPath,
          isActive: index === pathParts.length - 1
        });
      });
    }

    // If we have a specific scene, deck, or slide, add it to breadcrumbs
    if (currentContext.sceneSlug && !currentContext.contextPath) {
      breadcrumbs.push({
        id: 'scene',
        label: customLabels[`scene:${currentContext.sceneSlug}`] || formatPathPart(currentContext.sceneSlug),
        path: `/scene/${currentContext.sceneSlug}`,
        sceneId: currentContext.sceneId || undefined,
        isActive: !currentContext.deckSlug && !currentContext.slideId
      });
    }

    if (currentContext.deckSlug) {
      breadcrumbs.push({
        id: 'deck',
        label: customLabels[`deck:${currentContext.deckSlug}`] || formatPathPart(currentContext.deckSlug),
        path: `/deck/${currentContext.deckSlug}`,
        isActive: !currentContext.slideId
      });
    }

    if (currentContext.slideId) {
      breadcrumbs.push({
        id: 'slide',
        label: `Slide ${currentContext.slideId}`,
        path: `/slide/${currentContext.slideId}`,
        isActive: true
      });
    }

    // Limit breadcrumbs if maxItems is set
    if (maxItems && breadcrumbs.length > maxItems) {
      const keep = breadcrumbs.length - maxItems + 1; // +1 for the ellipsis placeholder
      return [
        breadcrumbs[0], // Always keep home
        {
          id: 'ellipsis',
          label: '...',
          path: '',
          isActive: false
        },
        ...breadcrumbs.slice(-keep)
      ];
    }

    return breadcrumbs;
  }, [
    currentContext.contextPath,
    currentContext.sceneId,
    currentContext.sceneSlug,
    currentContext.deckSlug,
    currentContext.slideId,
    currentContext.timestamp,
    maxItems,
    showHome,
    customLabels
  ]);
}

/**
 * Format a path part into a human-readable label
 */
function formatPathPart(part: string): string {
  // Remove hyphens/underscores and capitalize each word
  return part
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get breadcrumb label for a path
 */
export function getBreadcrumbLabel(path: string, customLabels: Record<string, string> = {}): string {
  if (customLabels[path]) {
    return customLabels[path];
  }

  const pathPart = path.split('/').filter(Boolean).pop();
  return pathPart ? formatPathPart(pathPart) : 'Home';
}

