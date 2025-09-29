// Stage types removed - Stage system has been completely removed

import { Scene } from '../types/scene';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Stage-related interfaces removed - Stage system has been completely removed

// Core Graph System Types
export interface CoreGraphNode {
  id: number;
  guid: string;
  node_type_id: number;
  label: string;
  description?: string;
  properties?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  node_type?: CoreGraphNodeType;
  outgoing_edges?: CoreGraphEdge[];
  incoming_edges?: CoreGraphEdge[];
}

export interface CoreGraphNodeType {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  icon?: string;
  icon_color?: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoreGraphEdge {
  id: number;
  guid: string;
  source_node_guid: string;
  target_node_guid: string;
  edge_type_id: number;
  label?: string;
  description?: string;
  properties?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  source_node?: CoreGraphNode;
  target_node?: CoreGraphNode;
  edge_type?: CoreGraphEdgeType;
}

export interface CoreGraphEdgeType {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  color?: string;
  style?: Record<string, any>;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNodeRequest {
  node_type_id: number;
  label: string;
  description?: string;
  properties?: Record<string, any>;
}

export interface CreateEdgeRequest {
  source_node_guid: string;
  target_node_guid: string;
  edge_type_id: number;
  label?: string;
  description?: string;
  properties?: Record<string, any>;
}

export interface CreateNodeTypeRequest {
  name: string;
  display_name: string;
  description?: string;
  icon?: string;
  icon_color?: string;
}

// Central Graph System Types
export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subgraph {
  id: number;
  guid: string;
  name: string;
  description?: string;
  tenant_id: number;
  created_by?: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  nodes?: CoreGraphNode[];
  scenes?: Scene[];
  created_by_user?: User;
}

export interface SceneItem {
  id: number;
  scene_id: number;
  item_type: 'node' | 'edge' | 'text' | 'image' | 'video' | 'other';
  item_id?: number;
  item_guid?: string;
  position?: { x: number; y: number; z: number };
  dimensions?: { width: number; height: number };
  style?: Record<string, any>;
  meta?: Record<string, any>;
  is_visible: boolean;
  z_index: number;
  created_at: string;
  updated_at: string;
  node?: CoreGraphNode;
  edge?: CoreGraphEdge;
}

export interface CreateSubgraphRequest {
  name: string;
  description?: string;
  tenant_id: number;
  is_public?: boolean;
  node_ids?: number[];
}

export interface CreateSceneItemRequest {
  scene_id: number;
  item_type: 'node' | 'edge' | 'text' | 'image' | 'video' | 'other';
  item_id?: number;
  item_guid?: string;
  position?: { x: number; y: number; z: number };
  dimensions?: { width: number; height: number };
  style?: Record<string, any>;
  meta?: Record<string, any>;
  is_visible?: boolean;
  z_index?: number;
}

export interface UpdateSceneItemRequest {
  position?: { x: number; y: number; z: number };
  dimensions?: { width: number; height: number };
  style?: Record<string, any>;
  meta?: Record<string, any>;
  is_visible?: boolean;
  z_index?: number;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

      constructor(baseUrl: string = 'http://protogen.local:8080/api') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestOptions: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Stage API methods removed - Stage system has been completely removed

  // Core Graph System API methods
  async getGraphNodes(params?: {
    node_type_id?: number;
    node_type_name?: string;
    search?: string;
  }): Promise<ApiResponse<CoreGraphNode[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.node_type_id) searchParams.append('node_type_id', params.node_type_id.toString());
    if (params?.node_type_name) searchParams.append('node_type_name', params.node_type_name);
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = `/graph/nodes${queryString ? `?${queryString}` : ''}`;
    
    return this.request<CoreGraphNode[]>(endpoint);
  }

  async getGraphNode(guid: string): Promise<ApiResponse<CoreGraphNode>> {
    return this.request<CoreGraphNode>(`/graph/nodes/${guid}`);
  }

  async createGraphNode(data: CreateNodeRequest): Promise<ApiResponse<CoreGraphNode>> {
    return this.request<CoreGraphNode>('/graph/nodes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGraphNode(guid: string, data: Partial<CreateNodeRequest>): Promise<ApiResponse<CoreGraphNode>> {
    return this.request<CoreGraphNode>(`/graph/nodes/${guid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGraphNode(guid: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/graph/nodes/${guid}`, {
      method: 'DELETE',
    });
  }

  async getGraphEdges(params?: {
    edge_type_id?: number;
    node_guid?: string;
  }): Promise<ApiResponse<CoreGraphEdge[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.edge_type_id) searchParams.append('edge_type_id', params.edge_type_id.toString());
    if (params?.node_guid) searchParams.append('node_guid', params.node_guid);

    const queryString = searchParams.toString();
    const endpoint = `/graph/edges${queryString ? `?${queryString}` : ''}`;
    
    return this.request<CoreGraphEdge[]>(endpoint);
  }

  async createGraphEdge(data: CreateEdgeRequest): Promise<ApiResponse<CoreGraphEdge>> {
    return this.request<CoreGraphEdge>('/graph/edges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteGraphEdge(guid: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/graph/edges/${guid}`, {
      method: 'DELETE',
    });
  }

  async getGraphNodeTypes(params?: {
    is_system?: boolean;
  }): Promise<ApiResponse<CoreGraphNodeType[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.is_system !== undefined) searchParams.append('is_system', params.is_system.toString());

    const queryString = searchParams.toString();
    const endpoint = `/graph/node-types${queryString ? `?${queryString}` : ''}`;
    
    return this.request<CoreGraphNodeType[]>(endpoint);
  }

  async createGraphNodeType(data: CreateNodeTypeRequest): Promise<ApiResponse<CoreGraphNodeType>> {
    return this.request<CoreGraphNodeType>('/graph/node-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getGraphEdgeTypes(params?: {
    is_system?: boolean;
  }): Promise<ApiResponse<CoreGraphEdgeType[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.is_system !== undefined) searchParams.append('is_system', params.is_system.toString());

    const queryString = searchParams.toString();
    const endpoint = `/graph/edge-types${queryString ? `?${queryString}` : ''}`;
    
    return this.request<CoreGraphEdgeType[]>(endpoint);
  }

  async getGraph(): Promise<ApiResponse<{
    nodes: CoreGraphNode[];
    edges: CoreGraphEdge[];
  }>> {
    return this.request('/graph');
  }

  // Subgraph API methods
  async getSubgraphs(params?: {
    tenant_id?: number;
  }): Promise<ApiResponse<Subgraph[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.tenant_id !== undefined) searchParams.append('tenant_id', params.tenant_id.toString());

    const queryString = searchParams.toString();
    const endpoint = `/subgraphs${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Subgraph[]>(endpoint);
  }

  async createSubgraph(data: CreateSubgraphRequest): Promise<ApiResponse<Subgraph>> {
    return this.request<Subgraph>('/subgraphs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSubgraph(id: number): Promise<ApiResponse<Subgraph>> {
    return this.request<Subgraph>(`/subgraphs/${id}`);
  }

  async updateSubgraph(id: number, data: Partial<CreateSubgraphRequest>): Promise<ApiResponse<Subgraph>> {
    return this.request<Subgraph>(`/subgraphs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubgraph(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/subgraphs/${id}`, {
      method: 'DELETE',
    });
  }

  async addNodeToSubgraph(subgraphId: number, nodeId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/subgraphs/${subgraphId}/nodes`, {
      method: 'POST',
      body: JSON.stringify({ node_id: nodeId }),
    });
  }

  async removeNodeFromSubgraph(subgraphId: number, nodeId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/subgraphs/${subgraphId}/nodes`, {
      method: 'DELETE',
      body: JSON.stringify({ node_id: nodeId }),
    });
  }

  async getSubgraphEdges(subgraphId: number): Promise<ApiResponse<CoreGraphEdge[]>> {
    return this.request<CoreGraphEdge[]>(`/subgraphs/${subgraphId}/edges`);
  }

  async getSubgraphNodes(subgraphId: number): Promise<ApiResponse<CoreGraphNode[]>> {
    return this.request<CoreGraphNode[]>(`/subgraphs/${subgraphId}/nodes`);
  }

  // Scene Items API methods
  async getSceneItems(params?: {
    scene_id?: number;
  }): Promise<ApiResponse<SceneItem[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.scene_id !== undefined) searchParams.append('scene_id', params.scene_id.toString());

    const queryString = searchParams.toString();
    const endpoint = `/scene-items${queryString ? `?${queryString}` : ''}`;
    
    return this.request<SceneItem[]>(endpoint);
  }

  async createSceneItem(data: CreateSceneItemRequest): Promise<ApiResponse<SceneItem>> {
    return this.request<SceneItem>('/scene-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSceneItem(id: number): Promise<ApiResponse<SceneItem>> {
    return this.request<SceneItem>(`/scene-items/${id}`);
  }

  async updateSceneItem(id: number, data: UpdateSceneItemRequest): Promise<ApiResponse<SceneItem>> {
    return this.request<SceneItem>(`/scene-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSceneItem(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/scene-items/${id}`, {
      method: 'DELETE',
    });
  }

  async updateSceneItemPosition(id: number, position: { x: number; y: number; z?: number }): Promise<ApiResponse<SceneItem>> {
    return this.request<SceneItem>(`/scene-items/${id}/position`, {
      method: 'PUT',
      body: JSON.stringify(position),
    });
  }

  async updateSceneItemDimensions(id: number, dimensions: { width: number; height: number }): Promise<ApiResponse<SceneItem>> {
    return this.request<SceneItem>(`/scene-items/${id}/dimensions`, {
      method: 'PUT',
      body: JSON.stringify(dimensions),
    });
  }

  async getSceneItemsByType(params: {
    scene_id: number;
    item_type: 'node' | 'edge' | 'text' | 'image' | 'video' | 'other';
  }): Promise<ApiResponse<SceneItem[]>> {
    const searchParams = new URLSearchParams();
    searchParams.append('scene_id', params.scene_id.toString());
    searchParams.append('item_type', params.item_type);

    const queryString = searchParams.toString();
    const endpoint = `/scene-items/by-type?${queryString}`;
    
    return this.request<SceneItem[]>(endpoint);
  }

  // Enhanced Scene API methods
  async createGraphScene(data: {
    name: string;
    slug: string;
    description?: string;
    tenant_id: number;
    node_ids?: number[];
  }): Promise<ApiResponse<Scene>> {
    return this.request<Scene>('/scenes/graph', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSceneNodes(sceneGuid: string): Promise<ApiResponse<CoreGraphNode[]>> {
    return this.request<CoreGraphNode[]>(`/scenes/${sceneGuid}/nodes`);
  }

  async getSceneEdges(sceneGuid: string): Promise<ApiResponse<CoreGraphEdge[]>> {
    return this.request<CoreGraphEdge[]>(`/scenes/${sceneGuid}/edges`);
  }

  async getSceneItems(sceneGuid: string): Promise<ApiResponse<SceneItem[]>> {
    return this.request<SceneItem[]>(`/scenes/${sceneGuid}/items`);
  }

  async addNodeToScene(sceneGuid: string, data: {
    node_id: number;
    position?: { x: number; y: number; z: number };
    dimensions?: { width: number; height: number };
    style?: Record<string, any>;
    meta?: Record<string, any>;
    z_index?: number;
  }): Promise<ApiResponse<SceneItem>> {
    return this.request<SceneItem>(`/scenes/${sceneGuid}/nodes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Utility methods
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
}

// Default instance
export const apiClient = new ApiClient(); 