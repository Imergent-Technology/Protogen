// Scene authoring types
export type SceneType = 'graph' | 'card' | 'document' | 'dashboard' | 'custom';

// Base scene interface
export interface BaseSceneData {
  id?: string;
  name: string;
  description?: string;
  type: SceneType;
  metadata: {
    title?: string;
    subtitle?: string;
    author?: string;
    version?: string;
    tags?: string[];
  };
  style: {
    theme?: string;
    [key: string]: any;
  };
  config: {
    [key: string]: any;
  };
}

// Graph Scene Types
export interface GraphSceneData extends BaseSceneData {
  type: 'graph';
  nodes: string[]; // Node IDs
  edges: GraphEdge[];
  style: {
    theme?: string;
    layout?: string;
    nodeStyles?: Record<string, any>;
    edgeStyles?: Record<string, any>;
  };
  config: {
    showLabels?: boolean;
    showEdges?: boolean;
    allowInteraction?: boolean;
    autoLayout?: boolean;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  style?: Record<string, any>;
  visible?: boolean;
}

// Card Scene Types
export interface CardSceneData extends BaseSceneData {
  type: 'card';
  slides: CardSlide[];
  layout: {
    aspectRatio: '16:9' | '4:3' | '1:1' | 'custom';
    customWidth?: number;
    customHeight?: number;
    responsive: boolean;
  };
  style: {
    globalFont?: string;
    globalColors?: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
  };
  config: {
    autoAdvance: boolean;
    autoAdvanceDelay: number;
    loopPresentation: boolean;
    showProgress: boolean;
    allowNavigation: boolean;
    transitionEffect: 'fade' | 'slide' | 'zoom' | 'flip' | 'none';
    fullScreenMode: boolean;
  };
}

export interface CardSlide {
  id: string;
  title?: string;
  background: {
    type: 'image' | 'video' | 'color' | 'gradient';
    source?: string;
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      direction?: string;
    };
    fit: 'fill' | 'fit' | 'center' | 'tile';
  };
  text: {
    content: string;
    position: {
      x: number;
      y: number;
    };
    style: {
      fontSize: number;
      fontFamily: string;
      color: string;
      backgroundColor?: string;
      padding: number;
      borderRadius: number;
      shadow: {
        enabled: boolean;
        color: string;
        blur: number;
        offsetX: number;
        offsetY: number;
      };
      contrast: 'auto' | 'dark' | 'light' | 'custom';
    };
    animation?: {
      delay: number;
      duration: number;
      fadeIn: boolean;
      fadeOut: boolean;
    };
  };
  callToAction?: {
    type: 'button' | 'fullscreen' | 'timed';
    text: string;
    position: {
      x: number;
      y: number;
    };
    style: {
      backgroundColor: string;
      textColor: string;
      padding: number;
      borderRadius: number;
      fontSize: number;
    };
    timing?: {
      showAfter: number;
      duration?: number;
    };
    pulse?: boolean;
    action?: {
      type: 'navigate' | 'external' | 'modal';
      target?: string;
      url?: string;
    };
  };
}

// Document Scene Types
export interface DocumentSceneData extends BaseSceneData {
  type: 'document';
  content: {
    html: string;
    markdown?: string;
    media: DocumentMedia[];
    links: DocumentLink[];
  };
  style: {
    theme?: string;
    typography?: {
      fontFamily?: string;
      fontSize?: string;
      lineHeight?: string;
    };
    layout?: {
      maxWidth?: string;
      padding?: string;
      margin?: string;
    };
  };
  config: {
    showTableOfContents?: boolean;
    enableSearch?: boolean;
    allowComments?: boolean;
    autoSave?: boolean;
  };
}

export interface DocumentMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  fullscreen?: boolean;
  autoplay?: boolean;
  controls?: boolean;
}

export interface DocumentLink {
  id: string;
  type: 'external' | 'internal' | 'node';
  url?: string;
  text: string;
  target?: '_blank' | '_self';
  nodeId?: string;
  sceneId?: string;
  deckId?: string;
  contextId?: string;
}

// Dashboard Scene Types
export interface DashboardSceneData extends BaseSceneData {
  type: 'dashboard';
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    rows: number;
    gap: number;
  };
  config: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    allowCustomization?: boolean;
  };
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text' | 'custom';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: Record<string, any>;
  data?: any;
}

// Union type for all scene data
export type SceneData = GraphSceneData | CardSceneData | DocumentSceneData | DashboardSceneData;

// Scene authoring props
export interface SceneAuthoringProps<T extends SceneData = SceneData> {
  scene?: T;
  availableNodes: NodeMetadata[];
  onSave: (scene: T) => void;
  onPreview: (scene: T) => void;
  onCancel: () => void;
  className?: string;
  permissions?: AuthoringPermissions;
}

// Node selection types (imported from node-selection.ts)
export interface NodeMetadata {
  id: string;
  name: string;
  type: string;
  description?: string;
  tags?: string[];
  properties?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
