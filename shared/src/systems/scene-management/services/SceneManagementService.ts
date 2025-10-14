// @ts-nocheck
/**
 * Scene Management Service
 * 
 * Handles CRUD operations for scenes.
 */

import { ApiClient } from '../../../services/ApiClient';
import type {
  SceneConfig,
  CreateSceneInput,
  UpdateSceneInput,
  ScenePermissions
} from '../types/scene-config';

export class SceneManagementServiceClass {
  private apiClient: ApiClient;
  private readonly baseUrl = '/scenes';

  constructor() {
    this.apiClient = new ApiClient();
  }

  /**
   * Get all scenes (with optional filtering)
   */
  async getScenes(params?: {
    type?: string;
    is_public?: boolean;
    is_active?: boolean;
    search?: string;
  }): Promise<SceneConfig[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.is_public !== undefined) queryParams.append('is_public', String(params.is_public));
    if (params?.is_active !== undefined) queryParams.append('is_active', String(params.is_active));
    if (params?.search) queryParams.append('search', params.search);

    const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.apiClient.get<any[]>(url);
    
    // ApiClient returns {data: {success, data, message}}
    // Unwrap to get actual scenes array
    const rawScenes = response.data?.data || response.data || response;
    
    // Transform API response to SceneConfig (use guid as id)
    return Array.isArray(rawScenes) ? rawScenes.map(s => this.transformSceneResponse(s)) : [];
  }

  /**
   * Get a single scene by ID (guid)
   */
  async getScene(id: string): Promise<SceneConfig> {
    const response = await this.apiClient.get<any>(`${this.baseUrl}/${id}`);
    // Unwrap nested response
    const rawScene = response.data?.data || response.data || response;
    return this.transformSceneResponse(rawScene);
  }

  /**
   * Transform API scene response to SceneConfig
   * Maps guid to id field
   */
  private transformSceneResponse(apiScene: any): SceneConfig {
    return {
      id: apiScene.guid || apiScene.id?.toString(), // Use guid as id
      name: apiScene.name,
      slug: apiScene.slug,
      type: apiScene.scene_type || apiScene.type,
      description: apiScene.description,
      is_active: apiScene.is_active,
      is_public: apiScene.is_public,
      deckIds: apiScene.deck_ids || [],
      metadata: apiScene.meta || apiScene.metadata || {},
      created_at: apiScene.created_at,
      updated_at: apiScene.updated_at,
      created_by: apiScene.created_by
    };
  }

  /**
   * Get a scene by slug
   */
  async getSceneBySlug(slug: string): Promise<SceneConfig> {
    return this.apiClient.get<SceneConfig>(`${this.baseUrl}/slug/${slug}`);
  }

  /**
   * Create a new scene
   */
  async createScene(input: CreateSceneInput): Promise<SceneConfig> {
    // Transform frontend data to match backend API expectations
    const payload = {
      name: input.name,
      slug: input.slug,
      scene_type: input.type, // Backend expects 'scene_type', not 'type'
      description: input.description,
      is_active: input.is_active ?? true, // Default to active if not specified
      is_public: input.is_public ?? false,
      config: input.config || {},
      meta: input.meta || {},
      style: input.style || {},
    };
    
    const rawScene = await this.apiClient.post<any>(this.baseUrl, payload);
    return this.transformSceneResponse(rawScene);
  }

  /**
   * Update an existing scene
   */
  async updateScene(id: string, input: UpdateSceneInput): Promise<SceneConfig> {
    const rawScene = await this.apiClient.put<any>(`${this.baseUrl}/${id}`, input);
    return this.transformSceneResponse(rawScene);
  }

  /**
   * Delete a scene
   */
  async deleteScene(id: string): Promise<void> {
    return this.apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Publish a scene (make it active and public)
   */
  async publishScene(id: string): Promise<SceneConfig> {
    const rawScene = await this.apiClient.post<any>(`${this.baseUrl}/${id}/publish`, {});
    return this.transformSceneResponse(rawScene);
  }

  /**
   * Unpublish a scene (make it inactive)
   */
  async unpublishScene(id: string): Promise<SceneConfig> {
    const rawScene = await this.apiClient.post<any>(`${this.baseUrl}/${id}/unpublish`, {});
    return this.transformSceneResponse(rawScene);
  }

  /**
   * Duplicate a scene
   */
  async duplicateScene(id: string, newName?: string): Promise<SceneConfig> {
    const rawScene = await this.apiClient.post<any>(`${this.baseUrl}/${id}/duplicate`, {
      name: newName
    });
    return this.transformSceneResponse(rawScene);
  }

  /**
   * Get scene permissions for current user
   */
  async getScenePermissions(id: string): Promise<ScenePermissions> {
    return this.apiClient.get<ScenePermissions>(`${this.baseUrl}/${id}/permissions`);
  }

  /**
   * Link decks to a scene
   */
  async linkDecks(id: string, deckIds: string[]): Promise<SceneConfig> {
    const rawScene = await this.apiClient.post<any>(`${this.baseUrl}/${id}/link-decks`, {
      deckIds
    });
    return this.transformSceneResponse(rawScene);
  }

  /**
   * Unlink decks from a scene
   */
  async unlinkDecks(id: string, deckIds: string[]): Promise<SceneConfig> {
    const rawScene = await this.apiClient.post<any>(`${this.baseUrl}/${id}/unlink-decks`, {
      deckIds
    });
    return this.transformSceneResponse(rawScene);
  }
}

// Export singleton instance
export const sceneManagementService = new SceneManagementServiceClass();

