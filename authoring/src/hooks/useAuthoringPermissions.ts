import { useMemo } from 'react';
import { AuthoringPermissions, AccessLevel, MeritScore } from '../types';

// Mock merit service - will be replaced with actual implementation
const useMerit = () => {
  // This will be replaced with actual merit service integration
  return {
    meritScore: {
      merit: 50,
      trust: 0.7,
      level: 'contributor' as AccessLevel,
      participation: { contentCreated: 10, feedbackGiven: 5, discussionsParticipated: 3, collaborations: 2, timeSpent: 100, consistency: 0.8, quality: 0.9 },
      expertise: { domainKnowledge: {}, technicalSkills: {}, contentQuality: 0.8, peerRecognition: 0.7, mentorship: 0.6, innovation: 0.5 },
      leadership: { communityInfluence: 0.6, contentCuration: 0.7, moderation: 0.5, mentorship: 0.6, innovation: 0.5, vision: 0.4 },
      visibleMetrics: ['participation', 'expertise'],
      nextLevel: 'expert' as AccessLevel,
      progress: 60,
      rewards: [],
      resourceAllocation: { storage: 1000, bandwidth: 5000, apiCalls: 10000, features: ['basic_authoring'] },
      lastUpdated: new Date().toISOString()
    } as MeritScore
  };
};

// Permission requirements for different features
const PERMISSION_REQUIREMENTS = {
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

// Access level hierarchy
const ACCESS_LEVEL_HIERARCHY: Record<AccessLevel, number> = {
  visitor: 0,
  member: 1,
  contributor: 2,
  expert: 3,
  leader: 4,
  architect: 5,
};

// Check if user has required level
const hasRequiredLevel = (userLevel: AccessLevel, requiredLevel: AccessLevel): boolean => {
  return ACCESS_LEVEL_HIERARCHY[userLevel] >= ACCESS_LEVEL_HIERARCHY[requiredLevel];
};

// Check if user has required trust
const hasRequiredTrust = (userTrust: number, requiredTrust: number): boolean => {
  return userTrust >= requiredTrust;
};

// Get permission for a specific feature
const getPermissionForFeature = (feature: string): { level: AccessLevel; trust: number } => {
  return PERMISSION_REQUIREMENTS[feature as keyof typeof PERMISSION_REQUIREMENTS] || { level: 'architect', trust: 1.0 };
};

/**
 * Hook for managing authoring permissions based on merit and trust
 */
export const useAuthoringPermissions = (): AuthoringPermissions => {
  const { meritScore } = useMerit();
  
  const permissions = useMemo((): AuthoringPermissions => {
    const hasPermission = (permission: string): boolean => {
      const requirement = getPermissionForFeature(permission);
      return hasRequiredLevel(meritScore.level, requirement.level) && 
             hasRequiredTrust(meritScore.trust, requirement.trust);
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
        const hasPermission = hasRequiredLevel(meritScore.level, 'member') && hasRequiredTrust(meritScore.trust, 0.3);
        if (!hasPermission) return false;
        
        // Check if user has enough storage allocation
        const availableStorage = meritScore.resourceAllocation.storage * 1024 * 1024; // Convert MB to bytes
        return size <= availableStorage;
      },
      canUseBandwidth: (amount: number) => {
        const hasPermission = hasRequiredLevel(meritScore.level, 'contributor') && hasRequiredTrust(meritScore.trust, 0.5);
        if (!hasPermission) return false;
        
        // Check if user has enough bandwidth allocation
        const availableBandwidth = meritScore.resourceAllocation.bandwidth * 1024 * 1024; // Convert MB to bytes
        return amount <= availableBandwidth;
      },
      canMakeApiCalls: (count: number) => {
        const hasPermission = hasRequiredLevel(meritScore.level, 'member') && hasRequiredTrust(meritScore.trust, 0.3);
        if (!hasPermission) return false;
        
        // Check if user has enough API call allocation
        return count <= meritScore.resourceAllocation.apiCalls;
      },
    };
  }, [meritScore]);
  
  return permissions;
};

/**
 * Hook for checking specific permissions
 */
export const usePermission = (permission: string): boolean => {
  const permissions = useAuthoringPermissions();
  
  // Map permission strings to permission functions
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
    'content.publish': (sceneId: string) => permissions.canPublishScene(sceneId),
    'content.share': (contentId: string) => permissions.canShareContent(contentId),
    'content.export': (contentId: string) => permissions.canExportContent(contentId),
  };
  
  const permissionFunction = permissionMap[permission];
  return permissionFunction ? permissionFunction() : false;
};

/**
 * Hook for getting user's merit information
 */
export const useMeritInfo = () => {
  const { meritScore } = useMerit();
  
  return {
    meritScore,
    canSeeMeritBreakdown: meritScore.level !== 'visitor',
    canSeeRewards: ['leader', 'architect'].includes(meritScore.level),
    canSeeResourceAllocation: ['expert', 'leader', 'architect'].includes(meritScore.level),
    nextLevelProgress: meritScore.progress,
    nextLevel: meritScore.nextLevel,
  };
};
