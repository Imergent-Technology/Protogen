import { Stage, StageType } from '../types/stage';

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

export interface CreateStageRequest {
  name: string;
  slug?: string;
  description?: string;
  type: StageType;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  is_active?: boolean;
  sort_order?: number;
  relationships?: {
    load_after?: number[];
    child_of?: number[];
    related_to?: number[];
  };
}

export interface UpdateStageRequest extends Partial<CreateStageRequest> {
  id: number;
}

export interface FeedbackData {
  stage_id: number;
  content: string;
  rating?: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface Feedback {
  id: number;
  stage_id: number;
  content: string;
  rating?: number;
  category?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StageRelationship {
  id: number;
  source_stage_id: number;
  target_stage_id: number;
  type: 'load_after' | 'child_of' | 'related_to';
  label: string;
  is_active: boolean;
  source_stage?: Stage;
  target_stage?: Stage;
}

export interface StageStats {
  total_stages: number;
  active_stages: number;
  total_feedback: number;
  recent_activity: Array<{
    type: 'stage_created' | 'stage_updated' | 'feedback_received';
    stage_id: number;
    stage_name: string;
    timestamp: string;
  }>;
}

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

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

      constructor(baseUrl: string = 'http://progress.local:8080/api') {
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

  // Stage API methods
  async getStages(params?: {
    type?: StageType;
    active?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<Stage[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.type) searchParams.append('type', params.type);
    if (params?.active !== undefined) searchParams.append('active', params.active.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.page) searchParams.append('page', params.page.toString());

    const queryString = searchParams.toString();
    const endpoint = `/stages${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Stage[]>(endpoint);
  }

  async getStage(id: number): Promise<ApiResponse<Stage>> {
    return this.request<Stage>(`/stages/${id}`);
  }

  async createStage(data: CreateStageRequest): Promise<ApiResponse<Stage>> {
    return this.request<Stage>('/stages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStage(id: number, data: Partial<CreateStageRequest>): Promise<ApiResponse<Stage>> {
    return this.request<Stage>(`/stages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStage(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/stages/${id}`, {
      method: 'DELETE',
    });
  }

  async getStageRelationships(id: number): Promise<ApiResponse<StageRelationship[]>> {
    return this.request<StageRelationship[]>(`/stages/${id}/relationships`);
  }

  async getStageTypes(): Promise<ApiResponse<Record<StageType, { name: string; description: string; icon: string }>>> {
    return this.request('/stages/types');
  }

  // Feedback API methods
  async getStageFeedback(stageId: number): Promise<ApiResponse<Feedback[]>> {
    return this.request<Feedback[]>(`/stages/${stageId}/feedback`);
  }

  async submitFeedback(data: FeedbackData): Promise<ApiResponse<Feedback>> {
    return this.request<Feedback>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFeedback(id: number, data: Partial<FeedbackData>): Promise<ApiResponse<Feedback>> {
    return this.request<Feedback>(`/feedback/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFeedback(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/feedback/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics/Stats methods
  async getStageStats(): Promise<ApiResponse<StageStats>> {
    return this.request<StageStats>('/stages/stats');
  }

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