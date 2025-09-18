import { AuthoringPermissions, MeritScore, AccessLevel } from '../types';

/**
 * Service for managing permissions and merit system integration
 */
export class PermissionService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = 'http://protogen.local:8080/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Get user's merit score
   */
  async getMeritScore(userId: number, tenantId: number): Promise<MeritScore> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users/${userId}/merit?tenant_id=${tenantId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get merit score: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting merit score:', error);
      // Return default merit score for development
      return this.getDefaultMeritScore();
    }
  }

  /**
   * Get user's permissions for authoring
   */
  async getAuthoringPermissions(userId: number, tenantId: number): Promise<AuthoringPermissions> {
    try {
      const meritScore = await this.getMeritScore(userId, tenantId);
      return this.calculatePermissions(meritScore);
    } catch (error) {
      console.error('Error getting authoring permissions:', error);
      // Return default permissions for development
      return this.getDefaultPermissions();
    }
  }

  /**
   * Check if user can perform specific action
   */
  async canPerformAction(
    userId: number, 
    tenantId: number, 
    action: string, 
    context?: any
  ): Promise<boolean> {
    try {
      const permissions = await this.getAuthoringPermissions(userId, tenantId);
      
      // Map action strings to permission functions
      const permissionMap: Record<string, () => boolean> = {
        'scene.create.card': () => permissions.canCreateScene('card'),
        'scene.create.graph': () => permissions.canCreateScene('graph'),
        'scene.create.document': () => permissions.canCreateScene('document'),
        'scene.create.dashboard': () => permissions.canCreateScene('dashboard'),
        'authoring.card': permissions.canUseCardAuthoring,
        'authoring.graph': permissions.canUseGraphAuthoring,
        'authoring.document': permissions.canUseDocumentAuthoring,
        'graph.node.create': permissions.canCreateNode,
        'graph.edge.create': permissions.canCreateEdge,
        'graph.modify.core': permissions.canModifyCoreGraph,
        'graph.metadata.access': permissions.canAccessNodeMetadata,
        'content.publish': () => permissions.canPublishScene(context?.sceneId || ''),
        'content.share': () => permissions.canShareContent(context?.contentId || ''),
        'content.export': () => permissions.canExportContent(context?.contentId || ''),
      };

      const permissionFunction = permissionMap[action];
      return permissionFunction ? permissionFunction() : false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Calculate permissions based on merit score
   */
  private calculatePermissions(meritScore: MeritScore): AuthoringPermissions {
    const hasPermission = (permission: string): boolean => {
      const requirement = this.getPermissionRequirement(permission);
      return this.hasRequiredLevel(meritScore.level, requirement.level) && 
             this.hasRequiredTrust(meritScore.trust, requirement.trust);
    };

    return {
      // Scene Type Permissions
      canCreateScene: (type: string) => hasPermission(`scene.create.${type}`),
      canEditScene: (sceneId: string, type: string) => hasPermission(`scene.edit.any`),
      canDeleteScene: (sceneId: string) => hasPermission(`scene.delete.any`),
      
      // Authoring Tool Permissions
      canUseCardAuthoring: () => hasPermission('authoring.card'),
      canUseGraphAuthoring: () => hasPermission('authoring.graph'),
      canUseDocumentAuthoring: () => hasPermission('authoring.document'),
      canUseNodeSelection: () => hasPermission('graph.metadata.access'),
      
      // Graph Operation Permissions
      canCreateNode: () => hasPermission('graph.node.create'),
      canCreateEdge: () => hasPermission('graph.edge.create'),
      canModifyCoreGraph: () => hasPermission('graph.modify.core'),
      canAccessNodeMetadata: () => hasPermission('graph.metadata.access'),
      
      // Content Management Permissions
      canPublishScene: (sceneId: string) => hasPermission('content.publish'),
      canShareContent: (contentId: string) => hasPermission('content.share'),
      canExportContent: (contentId: string) => hasPermission('content.export'),
      
      // Resource Permissions
      canUseStorage: (size: number) => {
        const hasPermission = this.hasRequiredLevel(meritScore.level, 'member') && 
                             this.hasRequiredTrust(meritScore.trust, 0.3);
        if (!hasPermission) return false;
        
        const availableStorage = meritScore.resourceAllocation.storage * 1024 * 1024;
        return size <= availableStorage;
      },
      canUseBandwidth: (amount: number) => {
        const hasPermission = this.hasRequiredLevel(meritScore.level, 'contributor') && 
                             this.hasRequiredTrust(meritScore.trust, 0.5);
        if (!hasPermission) return false;
        
        const availableBandwidth = meritScore.resourceAllocation.bandwidth * 1024 * 1024;
        return amount <= availableBandwidth;
      },
      canMakeApiCalls: (count: number) => {
        const hasPermission = this.hasRequiredLevel(meritScore.level, 'member') && 
                             this.hasRequiredTrust(meritScore.trust, 0.3);
        if (!hasPermission) return false;
        
        return count <= meritScore.resourceAllocation.apiCalls;
      },
    };
  }

  /**
   * Get permission requirement for a feature
   */
  private getPermissionRequirement(permission: string): { level: AccessLevel; trust: number } {
    const requirements: Record<string, { level: AccessLevel; trust: number }> = {
      'scene.create.card': { level: 'member', trust: 0.3 },
      'scene.create.graph': { level: 'contributor', trust: 0.5 },
      'scene.create.document': { level: 'member', trust: 0.3 },
      'scene.create.dashboard': { level: 'expert', trust: 0.7 },
      'scene.edit.own': { level: 'member', trust: 0.3 },
      'scene.edit.any': { level: 'expert', trust: 0.7 },
      'scene.delete.own': { level: 'member', trust: 0.5 },
      'scene.delete.any': { level: 'leader', trust: 0.8 },
      'authoring.card': { level: 'member', trust: 0.3 },
      'authoring.graph': { level: 'contributor', trust: 0.5 },
      'authoring.document': { level: 'member', trust: 0.3 },
      'authoring.advanced': { level: 'expert', trust: 0.7 },
      'graph.node.create': { level: 'expert', trust: 0.7 },
      'graph.edge.create': { level: 'expert', trust: 0.7 },
      'graph.modify.core': { level: 'expert', trust: 0.8 },
      'graph.metadata.access': { level: 'contributor', trust: 0.5 },
      'content.publish': { level: 'member', trust: 0.5 },
      'content.share': { level: 'member', trust: 0.3 },
      'content.export': { level: 'contributor', trust: 0.5 },
      'resources.storage': { level: 'member', trust: 0.3 },
      'resources.bandwidth': { level: 'contributor', trust: 0.5 },
      'resources.api': { level: 'member', trust: 0.3 },
    };

    return requirements[permission] || { level: 'architect', trust: 1.0 };
  }

  /**
   * Check if user has required level
   */
  private hasRequiredLevel(userLevel: AccessLevel, requiredLevel: AccessLevel): boolean {
    const hierarchy: Record<AccessLevel, number> = {
      visitor: 0,
      member: 1,
      contributor: 2,
      expert: 3,
      leader: 4,
      architect: 5,
    };

    return hierarchy[userLevel] >= hierarchy[requiredLevel];
  }

  /**
   * Check if user has required trust
   */
  private hasRequiredTrust(userTrust: number, requiredTrust: number): boolean {
    return userTrust >= requiredTrust;
  }

  /**
   * Get default merit score for development
   */
  private getDefaultMeritScore(): MeritScore {
    return {
      userId: 1,
      tenantId: 1,
      merit: 50,
      trust: 0.7,
      level: 'contributor',
      participation: {
        contentCreated: 10,
        feedbackGiven: 5,
        discussionsParticipated: 3,
        collaborations: 2,
        timeSpent: 100,
        consistency: 0.8,
        quality: 0.9
      },
      expertise: {
        domainKnowledge: {},
        technicalSkills: {},
        contentQuality: 0.8,
        peerRecognition: 0.7,
        mentorship: 0.6,
        innovation: 0.5
      },
      leadership: {
        communityInfluence: 0.6,
        contentCuration: 0.7,
        moderation: 0.5,
        mentorship: 0.6,
        innovation: 0.5,
        vision: 0.4
      },
      visibleMetrics: ['participation', 'expertise'],
      nextLevel: 'expert',
      progress: 60,
      rewards: [],
      resourceAllocation: {
        storage: 1000,
        bandwidth: 5000,
        apiCalls: 10000,
        features: ['basic_authoring']
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get default permissions for development
   */
  private getDefaultPermissions(): AuthoringPermissions {
    return {
      canCreateScene: () => true,
      canEditScene: () => true,
      canDeleteScene: () => true,
      canUseCardAuthoring: () => true,
      canUseGraphAuthoring: () => true,
      canUseDocumentAuthoring: () => true,
      canUseNodeSelection: () => true,
      canCreateNode: () => true,
      canCreateEdge: () => true,
      canModifyCoreGraph: () => true,
      canAccessNodeMetadata: () => true,
      canPublishScene: () => true,
      canShareContent: () => true,
      canExportContent: () => true,
      canUseStorage: () => true,
      canUseBandwidth: () => true,
      canMakeApiCalls: () => true,
    };
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string {
    return localStorage.getItem('oauth_token') || '';
  }
}

// Create default instance
export const permissionService = new PermissionService();
