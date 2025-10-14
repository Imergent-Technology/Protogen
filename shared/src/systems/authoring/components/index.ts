// Export all authoring components
export { default as NodeSelectionInterface } from './NodeSelectionInterface';
export { default as GraphSceneAuthoring } from './GraphSceneAuthoring';
export { default as CardSceneAuthoring } from './CardSceneAuthoring';
export { default as DocumentSceneAuthoring } from './DocumentSceneAuthoring';
export { default as SceneTypeManager } from './SceneTypeManager';

// M1 Week 3-4: Authoring Overlay Components
export { default as AuthoringOverlay } from './AuthoringOverlay';
export type { AuthoringOverlayProps } from './AuthoringOverlay';

export { default as SelectionHighlight } from './SelectionHighlight';
export type { SelectionHighlightProps } from './SelectionHighlight';

export { default as InlineEditor } from './InlineEditor';
export type { InlineEditorProps } from './InlineEditor';

export { default as EditingHandles } from './EditingHandles';
export type { EditingHandlesProps } from './EditingHandles';

// M1 Week 6: ToC Components
export * from './ToC';

// M1 Week 6: Carousel Component
export { default as PreviewCarousel } from './Carousel/PreviewCarousel';
export type { PreviewCarouselProps } from './Carousel/PreviewCarousel';

// M1 Week 7-8: Card Scene Components
export * from './CardScene';

// Re-export types for convenience
export type { NodeMetadata, NodeSelectionProps, NodeSelectionOptions } from '../types/node-selection';
export type { SceneType, SceneTypeManagerProps } from '../types/common';
export type { CardSceneData, CardSlide, CardSceneAuthoringProps } from '../types/scene';
export type { GraphSceneData, GraphEdge, GraphSceneAuthoringProps } from '../types/scene';
export type { DocumentSceneData, DocumentMedia, DocumentLink, DocumentSceneAuthoringProps } from '../types/scene';
