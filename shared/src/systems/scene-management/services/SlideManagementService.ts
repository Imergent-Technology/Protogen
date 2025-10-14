// @ts-nocheck
/**
 * Slide Management Service
 * 
 * Handles CRUD operations for slides.
 */

import { ApiClient } from '../../../services/ApiClient';
import type {
  SlideConfig,
  CreateSlideInput,
  UpdateSlideInput,
  SlidePermissions
} from '../types/slide-config';

export class SlideManagementServiceClass {
  private apiClient: ApiClient;
  private readonly baseUrl = '/slides';

  constructor() {
    this.apiClient = new ApiClient();
  }

  /**
   * Get all slides for a deck
   */
  async getSlidesByDeck(deckId: string): Promise<SlideConfig[]> {
    return this.apiClient.get<SlideConfig[]>(`${this.baseUrl}?deck_id=${deckId}`);
  }

  /**
   * Get all slides for a scene
   */
  async getSlidesByScene(sceneId: string): Promise<SlideConfig[]> {
    return this.apiClient.get<SlideConfig[]>(`${this.baseUrl}?scene_id=${sceneId}`);
  }

  /**
   * Get a single slide by ID
   */
  async getSlide(id: string): Promise<SlideConfig> {
    return this.apiClient.get<SlideConfig>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new slide
   */
  async createSlide(input: CreateSlideInput): Promise<SlideConfig> {
    return this.apiClient.post<SlideConfig>(this.baseUrl, input);
  }

  /**
   * Update an existing slide
   */
  async updateSlide(id: string, input: UpdateSlideInput): Promise<SlideConfig> {
    return this.apiClient.put<SlideConfig>(`${this.baseUrl}/${id}`, input);
  }

  /**
   * Delete a slide
   */
  async deleteSlide(id: string): Promise<void> {
    return this.apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Duplicate a slide
   */
  async duplicateSlide(id: string): Promise<SlideConfig> {
    return this.apiClient.post<SlideConfig>(`${this.baseUrl}/${id}/duplicate`, {});
  }

  /**
   * Reorder a slide within its deck
   */
  async reorderSlide(id: string, newOrder: number): Promise<SlideConfig> {
    return this.apiClient.post<SlideConfig>(`${this.baseUrl}/${id}/reorder`, {
      order: newOrder
    });
  }

  /**
   * Get slide permissions for current user
   */
  async getSlidePermissions(id: string): Promise<SlidePermissions> {
    return this.apiClient.get<SlidePermissions>(`${this.baseUrl}/${id}/permissions`);
  }

  /**
   * Upload media for a slide
   */
  async uploadMedia(id: string, file: File): Promise<{ url: string; thumbnail?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    // Note: This uses a different method since it's multipart/form-data
    const response = await fetch(`${this.apiClient.baseURL}${this.baseUrl}/${id}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('oauth_token')}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Media upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete media from a slide
   */
  async deleteMedia(id: string, mediaId: string): Promise<void> {
    return this.apiClient.delete(`${this.baseUrl}/${id}/media/${mediaId}`);
  }
}

// Export singleton instance
export const slideManagementService = new SlideManagementServiceClass();

