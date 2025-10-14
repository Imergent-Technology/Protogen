/**
 * URLSyncService
 * 
 * Synchronizes Navigator state with browser URL
 * Enables deep linking to scenes, contexts, slides, and even nodes
 * 
 * M1 Enhancement: Supports authoring mode and item-level navigation
 */

import type { CurrentContext, NavigationLocus, NavigationMode, ItemType } from '../types';

export interface URLSyncConfig {
  enabled: boolean;
  baseUrl?: string;
  format: 'path' | 'hash' | 'search';
  syncCoordinates?: boolean; // Sync node coordinates in URL
  syncSlides?: boolean; // Sync current slide
}

export class URLSyncService {
  private config: URLSyncConfig = {
    enabled: true,
    format: 'path',
    syncCoordinates: true,
    syncSlides: true
  };

  private ignoreNextPopState = false;

  constructor(config?: Partial<URLSyncConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Listen to browser back/forward buttons
    if (this.config.enabled && typeof window !== 'undefined') {
      window.addEventListener('popstate', this.handlePopState.bind(this));
    }
  }

  /**
   * Convert current context to URL
   */
  contextToURL(context: CurrentContext): string {
    const { format } = this.config;

    // Build path segments
    const segments: string[] = [];

    // Scene
    if (context.sceneSlug) {
      segments.push('s', context.sceneSlug);
    } else if (context.sceneId) {
      segments.push('s', context.sceneId);
    }

    // Deck (optional)
    if (context.deckSlug) {
      segments.push('d', context.deckSlug);
    } else if (context.deckId) {
      segments.push('d', context.deckId);
    }

    // Slide (optional)
    if (this.config.syncSlides && context.slideId) {
      segments.push('slide', context.slideId);
    }

    // Coordinates (for node focus)
    const params = new URLSearchParams();
    if (this.config.syncCoordinates && context.coordinates) {
      params.set('x', context.coordinates.x.toString());
      params.set('y', context.coordinates.y.toString());
      if (context.coordinates.z !== undefined) {
        params.set('z', context.coordinates.z.toString());
      }
    }

    // Context path (if present)
    if (context.contextPath && !context.sceneSlug && !context.sceneId) {
      // Use context path directly if no scene specified
      return this.buildURL(context.contextPath, params, format);
    }

    // Build URL based on format
    const path = segments.length > 0 ? `/${segments.join('/')}` : '/';
    return this.buildURL(path, params, format);
  }

  /**
   * Parse URL to context
   */
  urlToContext(url?: string): Partial<CurrentContext> {
    const urlStr = url || (typeof window !== 'undefined' ? window.location.href : '');
    const urlObj = new URL(urlStr, window?.location.origin || 'http://localhost');

    const { format } = this.config;
    const context: Partial<CurrentContext> = {};

    let pathToParse: string;

    if (format === 'hash') {
      pathToParse = urlObj.hash.slice(1); // Remove #
    } else if (format === 'search') {
      const params = urlObj.searchParams;
      if (params.has('scene')) context.sceneSlug = params.get('scene')!;
      if (params.has('deck')) context.deckSlug = params.get('deck')!;
      if (params.has('slide')) context.slideId = params.get('slide')!;
      if (params.has('x') && params.has('y')) {
        context.coordinates = {
          x: parseFloat(params.get('x')!),
          y: parseFloat(params.get('y')!),
          z: params.has('z') ? parseFloat(params.get('z')!) : undefined
        };
      }
      return context;
    } else {
      // path format
      pathToParse = urlObj.pathname;
    }

    // Parse path segments
    const segments = pathToParse.split('/').filter(s => s.length > 0);
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const nextSegment = segments[i + 1];

      if (segment === 's' && nextSegment) {
        context.sceneSlug = nextSegment;
        i++; // Skip next segment
      } else if (segment === 'd' && nextSegment) {
        context.deckSlug = nextSegment;
        i++; // Skip next segment
      } else if (segment === 'slide' && nextSegment) {
        context.slideId = nextSegment;
        i++; // Skip next segment
      }
    }

    // Parse coordinates from query params
    const params = urlObj.searchParams;
    if (params.has('x') && params.has('y')) {
      context.coordinates = {
        x: parseFloat(params.get('x')!),
        y: parseFloat(params.get('y')!),
        z: params.has('z') ? parseFloat(params.get('z')!) : undefined
      };
    }

    // Store full context path
    context.contextPath = pathToParse;

    return context;
  }

  /**
   * Update browser URL to match context
   */
  syncContextToURL(context: CurrentContext, replace: boolean = false): void {
    if (!this.config.enabled || typeof window === 'undefined') {
      return;
    }

    const url = this.contextToURL(context);
    const currentURL = window.location.href;

    // Only update if URL has changed
    if (url !== currentURL) {
      this.ignoreNextPopState = true;
      
      if (replace) {
        window.history.replaceState({ context }, '', url);
      } else {
        window.history.pushState({ context }, '', url);
      }
    }
  }

  /**
   * Handle browser back/forward buttons
   */
  private handlePopState(event: PopStateEvent): void {
    if (this.ignoreNextPopState) {
      this.ignoreNextPopState = false;
      return;
    }

    // Parse URL and emit navigation event
    const context = this.urlToContext();
    
    // Emit custom event that Navigator can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('navigator:url-changed', {
        detail: { context, state: event.state }
      }));
    }
  }

  /**
   * Build URL based on format
   */
  private buildURL(path: string, params: URLSearchParams, format: string): string {
    const baseUrl = this.config.baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const paramsStr = params.toString();

    if (format === 'hash') {
      return `${baseUrl}/#${path}${paramsStr ? `?${paramsStr}` : ''}`;
    } else if (format === 'search') {
      return `${baseUrl}/?scene=${path}${paramsStr ? `&${paramsStr}` : ''}`;
    } else {
      // path format (default)
      return `${baseUrl}${path}${paramsStr ? `?${paramsStr}` : ''}`;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<URLSyncConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): URLSyncConfig {
    return { ...this.config };
  }

  /**
   * Enable/disable URL sync
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', this.handlePopState.bind(this));
    }
  }

  // ============================================================================
  // M1 ENHANCEMENTS: Authoring Mode & Item Navigation
  // ============================================================================

  /**
   * Build URL from enhanced navigation state (M1)
   * Supports: /author/deck/:deckId/scenes/:sceneId/items/:itemId?zoom=50
   */
  buildEnhancedURL(params: {
    mode: NavigationMode;
    locus: NavigationLocus;
    zoomLevel?: number;
  }): string {
    const { mode, locus, zoomLevel } = params;
    let path = '/';

    // Mode prefix
    if (mode === 'author') {
      path += 'author/';
    }

    // Deck
    if (locus.deckId) {
      path += `deck/${locus.deckId}/`;
    }

    // Scene
    if (locus.sceneId) {
      path += `scenes/${locus.sceneId}/`;
    }

    // Item
    if (locus.itemId) {
      path += `items/${locus.itemId}`;
    }

    // Query params
    const queryParams = new URLSearchParams();
    if (zoomLevel && zoomLevel !== 0) {
      queryParams.set('zoom', zoomLevel.toString());
    }
    if (locus.coordinate) {
      queryParams.set('x', locus.coordinate.x.toString());
      queryParams.set('y', locus.coordinate.y.toString());
      if (locus.coordinate.z !== undefined) {
        queryParams.set('z', locus.coordinate.z.toString());
      }
    }

    const search = queryParams.toString();
    const url = search ? `${path}?${search}` : path;

    return url;
  }

  /**
   * Parse enhanced URL to navigation state (M1)
   * Parses: /author/deck/:deckId/scenes/:sceneId/items/:itemId?zoom=50
   */
  parseEnhancedURL(url?: string): {
    mode: NavigationMode;
    locus: NavigationLocus;
    zoomLevel: number;
    focusLevel: 'overview' | 'scene' | 'item';
  } {
    const urlStr = url || (typeof window !== 'undefined' ? window.location.href : '');
    const urlObj = new URL(urlStr, window?.location.origin || 'http://localhost');

    const parts = urlObj.pathname.split('/').filter(Boolean);
    const params = new URLSearchParams(urlObj.search);

    const result: {
      mode: NavigationMode;
      locus: NavigationLocus;
      zoomLevel: number;
      focusLevel: 'overview' | 'scene' | 'item';
    } = {
      mode: 'view',
      locus: {},
      zoomLevel: parseInt(params.get('zoom') || '0'),
      focusLevel: 'overview'
    };

    // Check for author mode prefix
    const offset = parts[0] === 'author' ? 1 : 0;
    if (parts[0] === 'author') {
      result.mode = 'author';
    }

    // Parse path (accounting for optional 'author' prefix)
    if (parts[offset] === 'deck' && parts[offset + 1]) {
      result.locus.deckId = parts[offset + 1];
      result.focusLevel = 'overview';
    }

    if (parts[offset + 2] === 'scenes' && parts[offset + 3]) {
      result.locus.sceneId = parts[offset + 3];
      result.focusLevel = 'scene';
    }

    if (parts[offset + 4] === 'items' && parts[offset + 5]) {
      result.locus.itemId = parts[offset + 5];
      result.locus.itemType = this.inferItemType(result.locus.sceneId);
      result.focusLevel = 'item';
    }

    // Parse coordinates
    if (params.has('x') && params.has('y')) {
      result.locus.coordinate = {
        x: parseFloat(params.get('x')!),
        y: parseFloat(params.get('y')!),
        z: params.has('z') ? parseFloat(params.get('z')!) : undefined
      };
    }

    return result;
  }

  /**
   * Sync enhanced navigation state to URL (M1)
   */
  syncEnhancedStateToURL(params: {
    mode: NavigationMode;
    locus: NavigationLocus;
    zoomLevel?: number;
  }, replace: boolean = false): void {
    if (!this.config.enabled || typeof window === 'undefined') {
      return;
    }

    const url = this.buildEnhancedURL(params);
    const currentPath = window.location.pathname + window.location.search;

    // Only update if URL has changed
    if (url !== currentPath) {
      this.ignoreNextPopState = true;

      if (replace) {
        window.history.replaceState({ ...params }, '', url);
      } else {
        window.history.pushState({ ...params }, '', url);
      }
    }
  }

  /**
   * Infer item type from scene ID (temporary helper)
   * TODO: Replace with actual scene type lookup in M1 Week 7-8
   */
  private inferItemType(sceneId?: string): ItemType {
    // For now, default to 'slide'
    // In production, this will query the scene system for the scene type
    // and return the appropriate item type (slide for Card, page for Document, etc.)
    return 'slide';
  }
}

// Singleton instance
export const urlSyncService = new URLSyncService();

