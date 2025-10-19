/**
 * Graph Data Service
 * 
 * Handles loading and managing graph data from the API.
 */

import { apiClient, CoreGraphNode, CoreGraphEdge, CoreGraphNodeType, Subgraph } from '../../../services/ApiClient';

export interface GraphData {
  nodes: CoreGraphNode[];
  edges: CoreGraphEdge[];
  nodeTypes: CoreGraphNodeType[];
  subgraphs: Subgraph[];
}

export interface SubgraphGraphData {
  nodes: CoreGraphNode[];
  edges: CoreGraphEdge[];
}

/**
 * Graph Data Service
 */
export class GraphDataService {
  /**
   * Load all core graph data
   */
  public static async loadCoreGraph(): Promise<GraphData> {
    const [nodeTypesResponse, subgraphsResponse, nodesResponse, edgesResponse] = await Promise.all([
      apiClient.getGraphNodeTypes(),
      apiClient.getSubgraphs(),
      apiClient.getGraphNodes(),
      apiClient.getGraphEdges(),
    ]);

    return {
      nodes: nodesResponse.success ? nodesResponse.data : [],
      edges: edgesResponse.success ? edgesResponse.data : [],
      nodeTypes: nodeTypesResponse.success ? nodeTypesResponse.data : [],
      subgraphs: subgraphsResponse.success ? subgraphsResponse.data : [],
    };
  }

  /**
   * Load a specific subgraph
   */
  public static async loadSubgraph(subgraphId: number | string): Promise<SubgraphGraphData> {
    const response = await apiClient.getSubgraph(Number(subgraphId));
    
    if (!response.success) {
      throw new Error(`Failed to load subgraph: ${subgraphId}`);
    }

    const subgraph = response.data;
    const nodeIds = subgraph.nodes?.map((n: CoreGraphNode) => n.id) || [];
    
    // Load edges between nodes in subgraph
    const edgesResponse = await apiClient.getGraphEdges();
    const allEdges = edgesResponse.success ? edgesResponse.data : [];
    
    // Filter edges to only those connecting nodes in this subgraph
    const nodeGuids = subgraph.nodes?.map((n: CoreGraphNode) => n.guid) || [];
    const edges = allEdges.filter((edge: CoreGraphEdge) =>
      nodeGuids.includes(edge.source_node_guid) &&
      nodeGuids.includes(edge.target_node_guid)
    );

    return {
      nodes: subgraph.nodes || [],
      edges,
    };
  }

  /**
   * Get nodes by type
   */
  public static filterNodesByType(
    nodes: CoreGraphNode[],
    nodeTypeName: string
  ): CoreGraphNode[] {
    return nodes.filter(node => node.node_type?.name === nodeTypeName);
  }

  /**
   * Get connected nodes
   */
  public static getConnectedNodes(
    nodeGuid: string,
    nodes: CoreGraphNode[],
    edges: CoreGraphEdge[]
  ): CoreGraphNode[] {
    const connectedGuids = new Set<string>();
    
    edges.forEach(edge => {
      if (edge.source_node_guid === nodeGuid) {
        connectedGuids.add(edge.target_node_guid);
      } else if (edge.target_node_guid === nodeGuid) {
        connectedGuids.add(edge.source_node_guid);
      }
    });

    return nodes.filter(node => connectedGuids.has(node.guid));
  }

  /**
   * Get isolated nodes (nodes with no connections)
   */
  public static getIsolatedNodes(
    nodes: CoreGraphNode[],
    edges: CoreGraphEdge[]
  ): CoreGraphNode[] {
    return nodes.filter(node => {
      const hasConnection = edges.some(edge =>
        edge.source_node_guid === node.guid || edge.target_node_guid === node.guid
      );
      return !hasConnection;
    });
  }

  /**
   * Search nodes by label
   */
  public static searchNodes(
    nodes: CoreGraphNode[],
    searchTerm: string
  ): CoreGraphNode[] {
    const term = searchTerm.toLowerCase();
    return nodes.filter(node =>
      node.label?.toLowerCase().includes(term) ||
      node.description?.toLowerCase().includes(term)
    );
  }
}

