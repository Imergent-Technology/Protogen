/**
 * Slide Configuration Types
 * 
 * Defines the structure for individual slides within decks.
 */

export type SlideContentType = 'card' | 'graph' | 'document' | 'custom';
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'flip' | 'none';
export type SlideLayout = 'single-column' | 'two-column' | 'media-focused' | 'split';

export interface SlideConfig {
  id: string;
  sceneId: string;
  deckId: string;
  order: number;
  title?: string;
  content: SlideContent;
  style: SlideStyle;
  transition: TransitionConfig;
  metadata: SlideMetadata;
  created_at: string;
  updated_at: string;
  created_by?: number;
}

export interface SlideContent {
  type: SlideContentType;
  layout?: SlideLayout;
  data: SlideContentData;
}

export interface SlideContentData {
  // Card content
  heading?: string;
  body?: string;
  media?: SlideMedia[];
  
  // Graph content
  nodeIds?: string[];
  edgeIds?: string[];
  focusNodeId?: string;
  
  // Document content
  documentId?: string;
  sections?: DocumentSection[];
  
  // Custom content
  [key: string]: any;
}

export interface SlideMedia {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  alt?: string;
  caption?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'background' | 'inline';
}

export interface DocumentSection {
  id: string;
  title?: string;
  content: string;
  order: number;
}

export interface SlideStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: string;
  padding?: string;
  alignment?: 'left' | 'center' | 'right';
  customCSS?: string;
}

export interface TransitionConfig {
  type: TransitionType;
  duration?: number; // in milliseconds
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface SlideMetadata {
  thumbnail?: string;
  notes?: string;
  speakerNotes?: string;
  duration?: number; // expected duration in seconds
  [key: string]: any;
}

export interface CreateSlideInput {
  sceneId: string;
  deckId: string;
  order?: number;
  title?: string;
  content: SlideContent;
  style?: Partial<SlideStyle>;
  transition?: Partial<TransitionConfig>;
  metadata?: Partial<SlideMetadata>;
}

export interface UpdateSlideInput {
  order?: number;
  title?: string;
  content?: Partial<SlideContent>;
  style?: Partial<SlideStyle>;
  transition?: Partial<TransitionConfig>;
  metadata?: Partial<SlideMetadata>;
}

export interface SlidePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReorder: boolean;
  canChangeTransition: boolean;
}

