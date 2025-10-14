// @ts-nocheck
/**
 * Graph Query Hooks
 * 
 * React hooks for interacting with the Protogen Graph System.
 */

import { useState, useEffect, useCallback } from 'react';
import { graphQueryService } from '../services/GraphQueryService';
import {
  GraphNode,
  GraphQueryRequest,
  RecommendRequest,
  ShortestPathRequest,
  EgoNetRequest,
} from '../types/graph';

/**
 * Hook for graph traversal queries
 */
export function useGraphQuery(request: GraphQueryRequest | null, autoExecute: boolean = true) {
  const [data, setData] = useState<GraphNode[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async (req?: GraphQueryRequest) => {
    const queryRequest = req || request;
    
    if (!queryRequest) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await graphQueryService.traverse(queryRequest);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [request]);
  
  useEffect(() => {
    if (autoExecute && request) {
      execute();
    }
  }, [autoExecute, request, execute]);
  
  return { data, loading, error, execute };
}

/**
 * Hook for graph traversal with fluent API
 */
export function useGraphTraversal() {
  const [data, setData] = useState<GraphNode[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const query = useCallback(() => {
    return graphQueryService.query();
  }, []);
  
  const execute = useCallback(async (builder: ReturnType<typeof graphQueryService.query>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await builder.execute();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { query, execute, data, loading, error };
}

/**
 * Hook for node recommendations
 */
export function useRecommendations(nodeId?: number | string, options?: Partial<RecommendRequest>) {
  const [data, setData] = useState<ReturnType<typeof graphQueryService.recommend> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetch = useCallback(async (id?: number | string, opts?: Partial<RecommendRequest>) => {
    const requestNodeId = id || nodeId;
    
    if (!requestNodeId) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await graphQueryService.recommend({
        node_id: requestNodeId,
        ...options,
        ...opts,
      });
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [nodeId, options]);
  
  useEffect(() => {
    if (nodeId) {
      fetch();
    }
  }, [nodeId, fetch]);
  
  return { data, loading, error, fetch };
}

/**
 * Hook for shortest path queries
 */
export function useShortestPath(
  sourceNode?: number | string,
  targetNode?: number | string,
  options?: Partial<ShortestPathRequest>
) {
  const [data, setData] = useState<ReturnType<typeof graphQueryService.shortestPath> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const find = useCallback(async (
    source?: number | string,
    target?: number | string,
    opts?: Partial<ShortestPathRequest>
  ) => {
    const src = source || sourceNode;
    const tgt = target || targetNode;
    
    if (!src || !tgt) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await graphQueryService.shortestPath({
        source_node: src,
        target_node: tgt,
        ...options,
        ...opts,
      });
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [sourceNode, targetNode, options]);
  
  useEffect(() => {
    if (sourceNode && targetNode) {
      find();
    }
  }, [sourceNode, targetNode, find]);
  
  return { data, loading, error, find };
}

/**
 * Hook for ego network queries
 */
export function useEgoNet(nodeId?: number | string, options?: Partial<EgoNetRequest>) {
  const [data, setData] = useState<ReturnType<typeof graphQueryService.egoNet> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetch = useCallback(async (id?: number | string, opts?: Partial<EgoNetRequest>) => {
    const requestNodeId = id || nodeId;
    
    if (!requestNodeId) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await graphQueryService.egoNet({
        node_id: requestNodeId,
        depth: 1,
        ...options,
        ...opts,
      });
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [nodeId, options]);
  
  useEffect(() => {
    if (nodeId) {
      fetch();
    }
  }, [nodeId, fetch]);
  
  return { data, loading, error, fetch };
}

/**
 * Hook for managing graph query cache
 */
export function useGraphCache() {
  const clearCache = useCallback(async () => {
    // TODO: Implement cache clearing endpoint
    console.warn('Cache clearing not yet implemented');
  }, []);
  
  return { clearCache };
}

