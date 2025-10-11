/**
 * Graph Query and Traversal Types
 * 
 * TypeScript types for the Protogen Graph System fluent query API.
 */

export interface GraphNode {
  id: number;
  guid: string;
  label: string;
  description?: string;
  node_type_id: number;
  properties?: Record<string, any>;
  position?: {
    x: number;
    y: number;
    z?: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  nodeType?: NodeType;
}

export interface GraphEdge {
  id: number;
  guid: string;
  source_node_id: number;
  target_node_id: number;
  source_node_guid: string;
  target_node_guid: string;
  edge_type_id: number;
  label?: string;
  description?: string;
  weight: number;
  properties?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  edgeType?: EdgeType;
}

export interface NodeType {
  id: number;
  name: string;
  description?: string;
  properties_schema?: Record<string, any>;
  is_system: boolean;
}

export interface EdgeType {
  id: number;
  name: string;
  description?: string;
  properties_schema?: Record<string, any>;
  is_system: boolean;
}

/**
 * Graph Query Request Types
 */

export type TraversalDirection = 'out' | 'in' | 'both';
export type ExecutionStrategy = 'sql' | 'memory';

export interface GraphQueryStep {
  type: TraversalDirection;
  edge_types?: string[];
}

export interface GraphQueryFilter {
  type: 'node_type' | 'property' | 'label';
  values?: string[];
  property?: string;
  value?: any;
  operator?: '=' | '!=' | '>' | '>=' | '<' | '<=';
  pattern?: string;
}

export interface GraphQueryRequest {
  start_nodes: (number | string)[]; // IDs or GUIDs
  steps?: GraphQueryStep[];
  filters?: GraphQueryFilter[];
  depth?: {
    min?: number;
    max?: number;
  };
  limit?: number;
  unique?: boolean;
  strategy?: ExecutionStrategy;
}

export interface GraphQueryResponse {
  success: boolean;
  data: GraphNode[];
  meta?: {
    strategy: ExecutionStrategy;
    execution_time_ms: number;
    node_count: number;
    cache_hit?: boolean;
  };
}

/**
 * Graph Query Plan
 */

export interface GraphQueryPlan {
  strategy: ExecutionStrategy;
  estimated_nodes: number;
  steps: number;
  filters: number;
  depth: {
    min: number | null;
    max: number | null;
  };
  reasoning: string;
}

/**
 * Traversal Request Types
 */

export interface TraverseRequest extends GraphQueryRequest {
  // Extends base query request
}

export interface RecommendRequest {
  node_id: number | string;
  context?: Record<string, any>;
  limit?: number;
  algorithm?: 'rwr' | 'shortest_path' | 'similarity';
  params?: {
    restart_probability?: number;
    weights?: Record<string, number>;
  };
}

export interface RecommendResponse {
  success: boolean;
  data: {
    nodes: GraphNode[];
    scores: Record<string, number>;
    explanations?: Record<string, string>;
  };
}

export interface ShortestPathRequest {
  source_node: number | string;
  target_node: number | string;
  max_depth?: number;
}

export interface ShortestPathResponse {
  success: boolean;
  data: {
    path: GraphNode[];
    distance: number;
    edges: GraphEdge[];
  } | null;
}

export interface EgoNetRequest {
  node_id: number | string;
  depth?: number;
  edge_types?: string[];
}

export interface EgoNetResponse {
  success: boolean;
  data: {
    center: GraphNode;
    nodes: GraphNode[];
    edges: GraphEdge[];
    depth: number;
  };
}

/**
 * Fluent Query Builder (client-side)
 */

export interface FluentGraphQueryBuilder {
  start(nodeIds: number[] | string[]): FluentGraphQueryBuilder;
  out(edgeTypes?: string | string[]): FluentGraphQueryBuilder;
  in(edgeTypes?: string | string[]): FluentGraphQueryBuilder;
  both(edgeTypes?: string | string[]): FluentGraphQueryBuilder;
  hasType(nodeTypes: string | string[]): FluentGraphQueryBuilder;
  has(property: string, value: any, operator?: string): FluentGraphQueryBuilder;
  hasLabel(pattern: string): FluentGraphQueryBuilder;
  depth(min: number, max?: number): FluentGraphQueryBuilder;
  unique(): FluentGraphQueryBuilder;
  limit(limit: number): FluentGraphQueryBuilder;
  useStrategy(strategy: ExecutionStrategy): FluentGraphQueryBuilder;
  execute(): Promise<GraphNode[]>;
  executeIds(): Promise<number[]>;
  executeGuids(): Promise<string[]>;
  explain(): Promise<GraphQueryPlan>;
  toRequest(): GraphQueryRequest;
}

