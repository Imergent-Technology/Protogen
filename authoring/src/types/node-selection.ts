// Node selection interface types
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

export interface NodeSelectionOptions {
  mode: 'single' | 'multi';
  viewMode: 'graph' | 'list' | 'cards';
  searchEnabled: boolean;
  filterEnabled: boolean;
  showMetadata: boolean;
  allowCreate: boolean;
}

export interface NodeSelectionProps {
  nodes: NodeMetadata[];
  selectedNodes: string[];
  onSelectionChange: (nodeIds: string[]) => void;
  onNodeCreate?: () => void;
  options?: Partial<NodeSelectionOptions>;
  className?: string;
}

// Node selection filter types
export interface NodeFilter {
  type?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  properties?: Record<string, any>;
}

// Node selection search types
export interface NodeSearchResult {
  node: NodeMetadata;
  score: number;
  highlights: string[];
}

export interface NodeSearchOptions {
  query: string;
  filters?: NodeFilter;
  limit?: number;
  includeMetadata?: boolean;
}
