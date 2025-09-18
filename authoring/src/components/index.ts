// Export all authoring components
export { default as NodeSelectionInterface } from './NodeSelectionInterface';
export type { NodeMetadata, NodeSelectionOptions, NodeSelectionProps } from './NodeSelectionInterface';

export { default as GraphSceneAuthoring } from './GraphSceneAuthoring';
export type { GraphSceneData, GraphEdge, GraphSceneAuthoringProps } from './GraphSceneAuthoring';

export { default as CardSceneAuthoring } from './CardSceneAuthoring';
export type { CardSceneData, CardSlide, CardSceneAuthoringProps } from './CardSceneAuthoring';

export { default as DocumentSceneAuthoring } from './DocumentSceneAuthoring';
export type { DocumentSceneData, DocumentMedia, DocumentLink, DocumentSceneAuthoringProps } from './DocumentSceneAuthoring';

export { default as SceneTypeManager } from './SceneTypeManager';
export type { SceneType, SceneTypeManagerProps } from './SceneTypeManager';
