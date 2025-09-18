import { SceneData, ExportOptions, ExportResult, ImportOptions, ImportResult } from '../types';

/**
 * Service for managing scene authoring operations
 */
export class SceneAuthoringService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = 'http://protogen.local:8080/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Save scene data to the backend
   */
  async saveScene<T extends SceneData>(scene: T): Promise<T> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(scene)
      });

      if (!response.ok) {
        throw new Error(`Failed to save scene: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving scene:', error);
      throw error;
    }
  }

  /**
   * Update existing scene
   */
  async updateScene<T extends SceneData>(sceneId: string, scene: T): Promise<T> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scenes/${sceneId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(scene)
      });

      if (!response.ok) {
        throw new Error(`Failed to update scene: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating scene:', error);
      throw error;
    }
  }

  /**
   * Delete scene
   */
  async deleteScene(sceneId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scenes/${sceneId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete scene: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting scene:', error);
      throw error;
    }
  }

  /**
   * Get scene by ID
   */
  async getScene<T extends SceneData>(sceneId: string): Promise<T> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scenes/${sceneId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get scene: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting scene:', error);
      throw error;
    }
  }

  /**
   * List scenes with optional filtering
   */
  async listScenes(filters?: {
    type?: string;
    tenantId?: string;
    limit?: number;
    offset?: number;
  }): Promise<SceneData[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.tenantId) params.append('tenant_id', filters.tenantId);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`${this.apiBaseUrl}/scenes?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to list scenes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing scenes:', error);
      throw error;
    }
  }

  /**
   * Export scene data
   */
  async exportScene<T extends SceneData>(
    scene: T, 
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scenes/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          scene,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to export scene: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error exporting scene:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  /**
   * Import scene data
   */
  async importScene(
    data: any, 
    options: ImportOptions
  ): Promise<ImportResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scenes/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          data,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to import scene: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error importing scene:', error);
      return {
        success: false,
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Import failed',
          code: 'IMPORT_ERROR'
        }]
      };
    }
  }

  /**
   * Generate preview URL for scene
   */
  generatePreviewUrl(sceneId: string): string {
    return `${this.apiBaseUrl}/scenes/${sceneId}/preview`;
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string {
    return localStorage.getItem('oauth_token') || '';
  }
}

// Create default instance
export const sceneAuthoringService = new SceneAuthoringService();
