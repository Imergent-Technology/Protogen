/**
 * Preview Service Types - M1 Week 5
 * 
 * Type definitions for preview generation system
 * Based on Spec 07: Preview Service Specification
 */

// ============================================================================
// Preview Targets
// ============================================================================

export type PreviewTarget =
  | ScenePreviewTarget
  | SlidePreviewTarget
  | PagePreviewTarget
  | NodePreviewTarget;

export interface ScenePreviewTarget {
  type: 'scene';
  sceneId: string;
  variant?: 'default' | 'poster' | 'thumbnail';
}

export interface SlidePreviewTarget {
  type: 'slide';
  sceneId: string;
  slideId: string;
}

export interface PagePreviewTarget {
  type: 'page';
  sceneId: string;
  pageId: string;
  includeHeader?: boolean;
}

export interface NodePreviewTarget {
  type: 'node';
  sceneId: string;
  nodeId: string;
  includeNeighbors?: boolean;
}

// ============================================================================
// Preview Sizes
// ============================================================================

export type PreviewSize = 'xs' | 'sm' | 'md';

export type PreviewPriority = 'high' | 'normal' | 'low';

export const PREVIEW_DIMENSIONS: Record<PreviewSize, { width: number; height: number }> = {
  xs: { width: 80, height: 60 },      // ToC thumbnails
  sm: { width: 160, height: 120 },    // Carousel items
  md: { width: 320, height: 240 }     // Overview boards
};

export const PREVIEW_QUALITY: Record<PreviewSize, number> = {
  xs: 0.6,   // Lower quality for small size
  sm: 0.8,   // Medium quality
  md: 0.9    // High quality
};

// ============================================================================
// Preview Metadata
// ============================================================================

export interface PreviewMetadata {
  targetType: string;
  targetId: string;
  size: PreviewSize;
  hash: string;
  width: number;
  height: number;
  generatedAt: number;
  dataUrl: string;
}

export interface CachedPreview extends PreviewMetadata {
  accessedAt: number;
  accessCount: number;
}

// ============================================================================
// Generation Options
// ============================================================================

export interface GenerateOptions {
  priority?: PreviewPriority;
  skipCache?: boolean;
  quality?: number;
  skipEvents?: boolean;
  timeout?: number;
}

// ============================================================================
// Queue Item
// ============================================================================

export interface QueueItem {
  target: PreviewTarget;
  size: PreviewSize;
  options?: GenerateOptions;
  priority: PreviewPriority;
  addedAt?: number;
  attempts?: number;
}

// ============================================================================
// Cache Statistics
// ============================================================================

export interface CacheStats {
  size: number;
  maxSize: number;
  hitCount: number;
  missCount: number;
  evictionCount: number;
  hitRate: number;
}

// ============================================================================
// Events
// ============================================================================

export interface PreviewGeneratingPayload {
  targetType: string;
  targetId: string;
  size: PreviewSize;
  estimatedTime: number;
}

export interface PreviewReadyPayload extends PreviewMetadata {}

export interface PreviewFailedPayload {
  targetId: string;
  size: PreviewSize;
  error: any;
  retryable: boolean;
}

