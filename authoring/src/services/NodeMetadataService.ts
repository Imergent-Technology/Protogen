import { NodeMetadata, NodeSearchOptions, NodeSearchResult } from '../types';

/**
 * Service for managing node metadata operations
 */
export class NodeMetadataService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = 'http://protogen.local:8080/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Get all available nodes
   */
  async getNodes(filters?: {
    type?: string;
    tenantId?: string;
    limit?: number;
    offset?: number;
  }): Promise<NodeMetadata[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.tenantId) params.append('tenant_id', filters.tenantId);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`${this.apiBaseUrl}/nodes?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get nodes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting nodes:', error);
      throw error;
    }
  }

  /**
   * Get node by ID
   */
  async getNode(nodeId: string): Promise<NodeMetadata> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/nodes/${nodeId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get node: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting node:', error);
      throw error;
    }
  }

  /**
   * Search nodes with advanced options
   */
  async searchNodes(options: NodeSearchOptions): Promise<NodeSearchResult[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/nodes/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`Failed to search nodes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching nodes:', error);
      throw error;
    }
  }

  /**
   * Get node types
   */
  async getNodeTypes(): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/nodes/types`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get node types: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting node types:', error);
      throw error;
    }
  }

  /**
   * Get node tags
   */
  async getNodeTags(): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/nodes/tags`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get node tags: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting node tags:', error);
      throw error;
    }
  }

  /**
   * Create new node
   */
  async createNode(nodeData: Partial<NodeMetadata>): Promise<NodeMetadata> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(nodeData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create node: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating node:', error);
      throw error;
    }
  }

  /**
   * Update node
   */
  async updateNode(nodeId: string, nodeData: Partial<NodeMetadata>): Promise<NodeMetadata> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/nodes/${nodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(nodeData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update node: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating node:', error);
      throw error;
    }
  }

  /**
   * Delete node
   */
  async deleteNode(nodeId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/nodes/${nodeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete node: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting node:', error);
      throw error;
    }
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string {
    return localStorage.getItem('oauth_token') || '';
  }
}

// Create default instance
export const nodeMetadataService = new NodeMetadataService();
