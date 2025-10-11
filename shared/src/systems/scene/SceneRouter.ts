/**
 * SceneRouter
 * 
 * Maps navigation contexts to scenes, enabling scene-first routing
 * Admins can configure context-to-scene mappings
 */

import type { CurrentContext } from '../navigator/types';

export interface SceneRouteConfig {
  defaultSceneId: string;
  contextOverrides: Map<string, string>; // context pattern -> sceneId
}

export interface SceneRouteMapping {
  pattern: string;
  sceneId: string;
  priority: number; // Higher priority matches first
  isRegex?: boolean;
}

export class SceneRouter {
  private defaultSceneId: string;
  private routeMappings: SceneRouteMapping[] = [];
  private contextOverrides: Map<string, string> = new Map();

  constructor(config?: Partial<SceneRouteConfig>) {
    this.defaultSceneId = config?.defaultSceneId || 'system-home';
    
    if (config?.contextOverrides) {
      this.contextOverrides = config.contextOverrides;
      this.buildRouteMappings();
    }
  }

  /**
   * Get scene ID for the given context
   */
  getSceneForContext(context: CurrentContext): string {
    // Check for exact context path match
    if (context.contextPath) {
      const exactMatch = this.contextOverrides.get(context.contextPath);
      if (exactMatch) {
        return exactMatch;
      }
    }

    // Check route mappings (with pattern matching)
    const contextPath = context.contextPath || '/';
    for (const mapping of this.routeMappings) {
      if (this.matchesPattern(contextPath, mapping)) {
        return mapping.sceneId;
      }
    }

    // Check if context specifies a scene directly
    if (context.sceneId) {
      return context.sceneId;
    }

    // Fallback to default scene
    return this.defaultSceneId;
  }

  /**
   * Set scene override for a context pattern
   */
  setSceneOverride(contextPattern: string, sceneId: string, priority: number = 0): void {
    this.contextOverrides.set(contextPattern, sceneId);
    
    // Rebuild route mappings with new override
    const existingIndex = this.routeMappings.findIndex(m => m.pattern === contextPattern);
    if (existingIndex >= 0) {
      this.routeMappings[existingIndex] = {
        pattern: contextPattern,
        sceneId,
        priority,
        isRegex: this.isRegexPattern(contextPattern)
      };
    } else {
      this.routeMappings.push({
        pattern: contextPattern,
        sceneId,
        priority,
        isRegex: this.isRegexPattern(contextPattern)
      });
    }

    // Sort by priority (highest first)
    this.routeMappings.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Remove scene override for a context pattern
   */
  removeSceneOverride(contextPattern: string): void {
    this.contextOverrides.delete(contextPattern);
    this.routeMappings = this.routeMappings.filter(m => m.pattern !== contextPattern);
  }

  /**
   * Get all scene overrides
   */
  getSceneOverrides(): Map<string, string> {
    return new Map(this.contextOverrides);
  }

  /**
   * Get default scene
   */
  getDefaultScene(): string {
    return this.defaultSceneId;
  }

  /**
   * Set default scene
   */
  setDefaultScene(sceneId: string): void {
    this.defaultSceneId = sceneId;
  }

  /**
   * Load route configuration from API/database
   */
  async loadConfiguration(config: {
    defaultSceneId: string;
    routes: Array<{ pattern: string; sceneId: string; priority?: number }>;
  }): Promise<void> {
    this.defaultSceneId = config.defaultSceneId;
    this.contextOverrides.clear();
    this.routeMappings = [];

    for (const route of config.routes) {
      this.setSceneOverride(route.pattern, route.sceneId, route.priority || 0);
    }
  }

  /**
   * Export current configuration
   */
  exportConfiguration(): {
    defaultSceneId: string;
    routes: Array<{ pattern: string; sceneId: string; priority: number }>;
  } {
    return {
      defaultSceneId: this.defaultSceneId,
      routes: this.routeMappings.map(m => ({
        pattern: m.pattern,
        sceneId: m.sceneId,
        priority: m.priority
      }))
    };
  }

  /**
   * Check if a context path matches a pattern
   */
  private matchesPattern(contextPath: string, mapping: SceneRouteMapping): boolean {
    if (mapping.isRegex) {
      try {
        const regex = new RegExp(mapping.pattern);
        return regex.test(contextPath);
      } catch (e) {
        console.warn(`Invalid regex pattern: ${mapping.pattern}`, e);
        return false;
      }
    }

    // Simple glob pattern matching
    const pattern = mapping.pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(contextPath);
  }

  /**
   * Check if pattern is a regex
   */
  private isRegexPattern(pattern: string): boolean {
    return pattern.startsWith('^') || pattern.includes('(') || pattern.includes('[');
  }

  /**
   * Build route mappings from context overrides
   */
  private buildRouteMappings(): void {
    this.routeMappings = Array.from(this.contextOverrides.entries()).map(([pattern, sceneId]) => ({
      pattern,
      sceneId,
      priority: 0,
      isRegex: this.isRegexPattern(pattern)
    }));
  }
}

// Singleton instance
export const sceneRouter = new SceneRouter();

