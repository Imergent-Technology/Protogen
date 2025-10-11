/**
 * Graph Query Service
 * 
 * Client-side service for interacting with the Protogen Graph System API.
 * Provides fluent query builder and direct API methods.
 */

import { apiClient } from './ApiClient';
import {
  GraphNode,
  GraphQueryRequest,
  GraphQueryResponse,
  GraphQueryPlan,
  RecommendRequest,
  RecommendResponse,
  ShortestPathRequest,
  ShortestPathResponse,
  EgoNetRequest,
  EgoNetResponse,
  TraversalDirection,
  ExecutionStrategy,
  FluentGraphQueryBuilder,
} from '../types/graph';

class GraphQueryService {
  /**
   * Execute a graph traversal query
   */
  async traverse(request: GraphQueryRequest): Promise<GraphNode[]> {
    const response = await apiClient.post<GraphQueryResponse>('/graph/traverse', request);
    
    if (!response.data.success) {
      throw new Error('Graph traversal failed');
    }
    
    return response.data.data;
  }
  
  /**
   * Get recommendations for a node
   */
  async recommend(request: RecommendRequest): Promise<RecommendResponse['data']> {
    const response = await apiClient.post<RecommendResponse>('/graph/recommend', request);
    
    if (!response.data.success) {
      throw new Error('Recommendation request failed');
    }
    
    return response.data.data;
  }
  
  /**
   * Find shortest path between two nodes
   */
  async shortestPath(request: ShortestPathRequest): Promise<ShortestPathResponse['data']> {
    const response = await apiClient.post<ShortestPathResponse>('/graph/shortest-path', request);
    
    if (!response.data.success) {
      throw new Error('Shortest path request failed');
    }
    
    return response.data.data;
  }
  
  /**
   * Get ego network for a node
   */
  async egoNet(request: EgoNetRequest): Promise<EgoNetResponse['data']> {
    const response = await apiClient.get<EgoNetResponse>(`/graph/ego-net`, {
      params: request,
    });
    
    if (!response.data.success) {
      throw new Error('Ego network request failed');
    }
    
    return response.data.data;
  }
  
  /**
   * Create a fluent query builder
   */
  query(): FluentGraphQuery {
    return new FluentGraphQuery(this);
  }
}

/**
 * Fluent Query Builder Implementation
 */
class FluentGraphQuery implements FluentGraphQueryBuilder {
  private request: GraphQueryRequest = {
    start_nodes: [],
  };
  
  constructor(private service: GraphQueryService) {}
  
  start(nodeIds: number[] | string[]): FluentGraphQueryBuilder {
    this.request.start_nodes = nodeIds;
    return this;
  }
  
  out(edgeTypes?: string | string[]): FluentGraphQueryBuilder {
    if (!this.request.steps) {
      this.request.steps = [];
    }
    this.request.steps.push({
      type: 'out' as TraversalDirection,
      edge_types: edgeTypes ? (Array.isArray(edgeTypes) ? edgeTypes : [edgeTypes]) : undefined,
    });
    return this;
  }
  
  in(edgeTypes?: string | string[]): FluentGraphQueryBuilder {
    if (!this.request.steps) {
      this.request.steps = [];
    }
    this.request.steps.push({
      type: 'in' as TraversalDirection,
      edge_types: edgeTypes ? (Array.isArray(edgeTypes) ? edgeTypes : [edgeTypes]) : undefined,
    });
    return this;
  }
  
  both(edgeTypes?: string | string[]): FluentGraphQueryBuilder {
    if (!this.request.steps) {
      this.request.steps = [];
    }
    this.request.steps.push({
      type: 'both' as TraversalDirection,
      edge_types: edgeTypes ? (Array.isArray(edgeTypes) ? edgeTypes : [edgeTypes]) : undefined,
    });
    return this;
  }
  
  hasType(nodeTypes: string | string[]): FluentGraphQueryBuilder {
    if (!this.request.filters) {
      this.request.filters = [];
    }
    this.request.filters.push({
      type: 'node_type',
      values: Array.isArray(nodeTypes) ? nodeTypes : [nodeTypes],
    });
    return this;
  }
  
  has(property: string, value: any, operator: string = '='): FluentGraphQueryBuilder {
    if (!this.request.filters) {
      this.request.filters = [];
    }
    this.request.filters.push({
      type: 'property',
      property,
      value,
      operator: operator as any,
    });
    return this;
  }
  
  hasLabel(pattern: string): FluentGraphQueryBuilder {
    if (!this.request.filters) {
      this.request.filters = [];
    }
    this.request.filters.push({
      type: 'label',
      pattern,
    });
    return this;
  }
  
  depth(min: number, max?: number): FluentGraphQueryBuilder {
    this.request.depth = { min, max };
    return this;
  }
  
  unique(): FluentGraphQueryBuilder {
    this.request.unique = true;
    return this;
  }
  
  limit(limit: number): FluentGraphQueryBuilder {
    this.request.limit = limit;
    return this;
  }
  
  useStrategy(strategy: ExecutionStrategy): FluentGraphQueryBuilder {
    this.request.strategy = strategy;
    return this;
  }
  
  async execute(): Promise<GraphNode[]> {
    return this.service.traverse(this.request);
  }
  
  async executeIds(): Promise<number[]> {
    const nodes = await this.execute();
    return nodes.map(n => n.id);
  }
  
  async executeGuids(): Promise<string[]> {
    const nodes = await this.execute();
    return nodes.map(n => n.guid);
  }
  
  async explain(): Promise<GraphQueryPlan> {
    // TODO: Implement explain endpoint
    throw new Error('Explain not yet implemented');
  }
  
  toRequest(): GraphQueryRequest {
    return { ...this.request };
  }
}

// Export singleton instance
export const graphQueryService = new GraphQueryService();

// Export class for testing
export { GraphQueryService, FluentGraphQuery };

