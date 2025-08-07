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

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = 'http://localhost:8080/api') {
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