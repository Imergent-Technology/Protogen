// Export all authoring components
export { default as NodeSelectionInterface } from './NodeSelectionInterface';
export { default as GraphSceneAuthoring } from './GraphSceneAuthoring';
export { default as CardSceneAuthoring } from './CardSceneAuthoring';
export { default as DocumentSceneAuthoring } from './DocumentSceneAuthoring';
export { default as SceneTypeManager } from './SceneTypeManager';

// Re-export types for convenience
export type { NodeMetadata, NodeSelectionProps, NodeSelectionOptions } from '../types/node-selection';
export type { SceneType, SceneTypeManagerProps } from '../types/common';
export type { CardSceneData, CardSlide, CardSceneAuthoringProps } from '../types/scene';
export type { GraphSceneData, GraphEdge, GraphSceneAuthoringProps } from '../types/scene';
export type { DocumentSceneData, DocumentMedia, DocumentLink, DocumentSceneAuthoringProps } from '../types/scene';
