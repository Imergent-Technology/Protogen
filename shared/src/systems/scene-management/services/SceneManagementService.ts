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
    return this.apiClient.get<SceneConfig[]>(url);
  }

  /**
   * Get a single scene by ID
   */
  async getScene(id: string): Promise<SceneConfig> {
    return this.apiClient.get<SceneConfig>(`${this.baseUrl}/${id}`);
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
    
    return this.apiClient.post<SceneConfig>(this.baseUrl, payload);
  }

  /**
   * Update an existing scene
   */
  async updateScene(id: string, input: UpdateSceneInput): Promise<SceneConfig> {
    return this.apiClient.put<SceneConfig>(`${this.baseUrl}/${id}`, input);
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
    return this.apiClient.post<SceneConfig>(`${this.baseUrl}/${id}/publish`, {});
  }

  /**
   * Unpublish a scene (make it inactive)
   */
  async unpublishScene(id: string): Promise<SceneConfig> {
    return this.apiClient.post<SceneConfig>(`${this.baseUrl}/${id}/unpublish`, {});
  }

  /**
   * Duplicate a scene
   */
  async duplicateScene(id: string, newName?: string): Promise<SceneConfig> {
    return this.apiClient.post<SceneConfig>(`${this.baseUrl}/${id}/duplicate`, {
      name: newName
    });
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
    return this.apiClient.post<SceneConfig>(`${this.baseUrl}/${id}/link-decks`, {
      deckIds
    });
  }

  /**
   * Unlink decks from a scene
   */
  async unlinkDecks(id: string, deckIds: string[]): Promise<SceneConfig> {
    return this.apiClient.post<SceneConfig>(`${this.baseUrl}/${id}/unlink-decks`, {
      deckIds
    });
  }
}

// Export singleton instance
export const sceneManagementService = new SceneManagementServiceClass();

