// Export all services
export * from './SceneAuthoringService';
export * from './NodeMetadataService';
export * from './PermissionService';

// M1 Week 3-4: Authoring Overlay Services
export { SelectionEngine, selectionEngine } from './SelectionEngine';
export type { SelectionState, SelectionMode, HitTestResult, SelectionChangedPayload } from './SelectionEngine';

export { HitTestLayer, hitTestLayer } from './HitTestLayer';
export type { Point, SceneType, HitTestHandler } from './HitTestLayer';

// M1 Week 5: Preview Service
export { PreviewService, previewService } from './PreviewService';
export { ThumbnailGenerator } from './ThumbnailGenerator';
export { PreviewCache } from './PreviewCache';
export { PreviewQueue } from './PreviewQueue';
