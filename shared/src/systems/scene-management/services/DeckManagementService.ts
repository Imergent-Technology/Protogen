// @ts-nocheck
/**
 * Deck Management Service
 * 
 * Handles CRUD operations for decks.
 */

import { ApiClient } from '../../../services/ApiClient';
import type {
  DeckConfig,
  CreateDeckInput,
  UpdateDeckInput,
  DeckPermissions
} from '../types/deck-config';

export class DeckManagementServiceClass {
  private apiClient: ApiClient;
  private readonly baseUrl = '/decks';

  constructor() {
    this.apiClient = new ApiClient();
  }

  /**
   * Get all decks (with optional filtering)
   */
  async getDecks(params?: {
    type?: string;
    sceneId?: string;
    search?: string;
  }): Promise<DeckConfig[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.sceneId) queryParams.append('scene_id', params.sceneId);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get<DeckConfig[]>(url);
  }

  /**
   * Get a single deck by ID
   */
  async getDeck(id: string): Promise<DeckConfig> {
    return this.apiClient.get<DeckConfig>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new deck
   */
  async createDeck(input: CreateDeckInput): Promise<DeckConfig> {
    return this.apiClient.post<DeckConfig>(this.baseUrl, input);
  }

  /**
   * Update an existing deck
   */
  async updateDeck(id: string, input: UpdateDeckInput): Promise<DeckConfig> {
    return this.apiClient.put<DeckConfig>(`${this.baseUrl}/${id}`, input);
  }

  /**
   * Delete a deck
   */
  async deleteDeck(id: string): Promise<void> {
    return this.apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Reorder slides in a deck
   */
  async reorderSlides(id: string, slideOrder: string[]): Promise<DeckConfig> {
    return this.apiClient.post<DeckConfig>(`${this.baseUrl}/${id}/reorder-slides`, {
      slideOrder
    });
  }

  /**
   * Duplicate a deck
   */
  async duplicateDeck(id: string, newName?: string): Promise<DeckConfig> {
    return this.apiClient.post<DeckConfig>(`${this.baseUrl}/${id}/duplicate`, {
      name: newName
    });
  }

  /**
   * Get deck permissions for current user
   */
  async getDeckPermissions(id: string): Promise<DeckPermissions> {
    return this.apiClient.get<DeckPermissions>(`${this.baseUrl}/${id}/permissions`);
  }

  /**
   * Link scenes to a deck
   */
  async linkScenes(id: string, sceneIds: string[]): Promise<DeckConfig> {
    return this.apiClient.post<DeckConfig>(`${this.baseUrl}/${id}/link-scenes`, {
      sceneIds
    });
  }

  /**
   * Unlink scenes from a deck
   */
  async unlinkScenes(id: string, sceneIds: string[]): Promise<DeckConfig> {
    return this.apiClient.post<DeckConfig>(`${this.baseUrl}/${id}/unlink-scenes`, {
      sceneIds
    });
  }
}

// Export singleton instance
export const deckManagementService = new DeckManagementServiceClass();

