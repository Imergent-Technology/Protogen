// Permission types for scene authoring
export interface AuthoringPermissions {
  // Scene Type Permissions
  canCreateScene: (type: string) => boolean;
  canEditScene: (sceneId: string, type: string) => boolean;
  canDeleteScene: (sceneId: string) => boolean;
  
  // Authoring Tool Permissions
  canUseCardAuthoring: () => boolean;
  canUseGraphAuthoring: () => boolean;
  canUseDocumentAuthoring: () => boolean;
  canUseNodeSelection: () => boolean;
  
  // Graph Operation Permissions
  canCreateNode: () => boolean;
  canCreateEdge: () => boolean;
  canModifyCoreGraph: () => boolean;
  canAccessNodeMetadata: () => boolean;
  
  // Content Management Permissions
  canPublishScene: (sceneId: string) => boolean;
  canShareContent: (contentId: string) => boolean;
  canExportContent: (contentId: string) => boolean;
  
  // Resource Permissions
  canUseStorage: (size: number) => boolean;
  canUseBandwidth: (amount: number) => boolean;
  canMakeApiCalls: (count: number) => boolean;
}

// Permission categories
export type PermissionCategory = 
  | 'content'      // Scene/deck creation, editing
  | 'authoring'    // Scene authoring tools
  | 'graph'        // Core graph operations
  | 'tenant'       // Tenant management
  | 'system'       // Admin/system operations
  | 'analytics'    // Data access and insights
  | 'sharing'      // Content sharing and collaboration
  | 'resources';   // Storage, bandwidth, API limits

export type PermissionScope = 
  | 'global'       // System-wide permissions
  | 'tenant'       // Tenant-specific permissions
  | 'scene'        // Scene-specific permissions
  | 'user';        // User-specific permissions

export type PermissionLevel = 
  | 'view'         // Read-only access
  | 'create'       // Create new content
  | 'edit'         // Modify existing content
  | 'delete'       // Remove content
  | 'admin';       // Full administrative access

// Merit-based access levels
export type AccessLevel = 
  | 'visitor'      // 0-20 merit: Basic viewing
  | 'member'       // 21-40 merit: Content creation
  | 'contributor'  // 41-60 merit: Advanced authoring
  | 'expert'       // 61-80 merit: Graph operations
  | 'leader'       // 81-95 merit: Community leadership
  | 'architect';   // 96-100 merit: System architecture

// Merit score interface
export interface MeritScore {
  userId: number;
  tenantId: number;
  
  // Core Merit Components
  participation: ParticipationMerit;
  expertise: ExpertiseMerit;
  leadership: LeadershipMerit;
  
  // Calculated Scores
  merit: number;        // 0-100, overall merit score
  trust: number;         // 0-100, trust and reliability score
  level: AccessLevel;    // Derived from merit + trust
  
  // Visibility & Progression
  visibleMetrics: string[];  // What user can see
  nextLevel: AccessLevel;    // Next level to achieve
  progress: number;          // Progress to next level (0-100)
  
  // Rewards & Benefits
  rewards: Reward[];
  resourceAllocation: ResourceAllocation;
  
  lastUpdated: string;
}

export interface ParticipationMerit {
  contentCreated: number;
  feedbackGiven: number;
  discussionsParticipated: number;
  collaborations: number;
  timeSpent: number;
  consistency: number;  // Regular participation over time
  quality: number;      // Quality of contributions
}

export interface ExpertiseMerit {
  domainKnowledge: Record<string, number>;  // Per-domain expertise
  technicalSkills: Record<string, number>;
  contentQuality: number;
  peerRecognition: number;
  mentorship: number;
  innovation: number;
}

export interface LeadershipMerit {
  communityInfluence: number;
  contentCuration: number;
  moderation: number;
  mentorship: number;
  innovation: number;
  vision: number;        // Ability to guide community direction
}

export interface Reward {
  id: string;
  type: 'badge' | 'title' | 'benefit' | 'resource';
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ResourceAllocation {
  storage: number;      // MB
  bandwidth: number;    // MB per month
  apiCalls: number;     // Calls per month
  features: string[];   // Available features
}
