# Scene Authoring Library Strategy

## Overview

This document outlines the strategic approach for extracting and evolving the scene authoring tools into a separate library, integrated with the Standing system and permissions architecture. This approach enables multi-tenant authoring capabilities while maintaining security and encouraging community participation.

## Strategic Objectives

### 1. Scene Authoring Library Extraction
- **Extract Now**: Current authoring tools are mature enough for extraction
- **Modular Architecture**: Clean separation of concerns for reusability
- **Multi-Tenant Ready**: Library supports tenant-specific authoring
- **Permission Integration**: Built-in permission hooks for security

### 2. Standing System Integration
- **Progressive Access**: Features unlock based on standing levels
- **Trust-Based Security**: Sensitive operations require high trust
- **Community Building**: Standing encourages quality participation
- **Resource Allocation**: Automatic benefits based on standing

### 3. Permissions Architecture
- **Granular Control**: Fine-grained permissions for specific features
- **Standing-Based**: Permissions determined by user standing and trust
- **Multi-Tenant**: Tenant-specific permission models
- **Scalable**: System grows with community needs

## Implementation Phases

### Phase 5A: Foundation (Current Phase)
**Timeline**: Weeks 1-2

#### Scene Authoring Library
- [ ] Create `@protogen/authoring` package structure
- [ ] Move existing authoring components to library
- [ ] Add shared hooks and services
- [ ] Create comprehensive TypeScript types
- [ ] Update imports in admin/portal projects

#### Standing System Foundation
- [ ] Create StandingScore model and database schema
- [ ] Implement basic standing calculation service
- [ ] Add trust score calculation (replacing reputation)
- [ ] Create access level determination
- [ ] Update user model with standing fields

#### Permissions Architecture
- [ ] Create permission database schema
- [ ] Implement PermissionService
- [ ] Add standing-based permission checks
- [ ] Create permission hooks for frontend
- [ ] Update scene authoring library with permissions

### Phase 5B: Integration (Weeks 3-4)
**Timeline**: Weeks 3-4

#### Advanced Authoring Tools
- [ ] Complete Document Scene Authoring
- [ ] Finish Graph Scene Authoring
- [ ] Add Node Selection Interface
- [ ] Implement Graph Studio Integration
- [ ] Add comprehensive authoring tests

#### Standing System Enhancement
- [ ] Implement progressive visibility system
- [ ] Add resource allocation based on standing
- [ ] Create cosmetic system and benefits
- [ ] Add standing-based content recommendations
- [ ] Implement community leadership tools

#### Permission Integration
- [ ] Add tenant-specific permission overrides
- [ ] Implement permission inheritance
- [ ] Add permission auditing and logging
- [ ] Create permission management UI
- [ ] Add permission-based feature toggles

### Phase 5C: Portal Integration (Weeks 5-6)
**Timeline**: Weeks 5-6

#### Portal Authoring
- [ ] Integrate authoring library into portal
- [ ] Add user-facing authoring capabilities
- [ ] Implement permission-based access controls
- [ ] Add standing display to user profiles
- [ ] Create user progression interface

#### Advanced Features
- [ ] Add standing-based content curation
- [ ] Implement community leadership tools
- [ ] Create standing analytics dashboard
- [ ] Add cross-tenant standing recognition
- [ ] Implement mentorship networks

## Technical Architecture

### Scene Authoring Library Structure
```
@protogen/authoring/
├── components/
│   ├── CardSceneAuthoring.tsx
│   ├── GraphSceneAuthoring.tsx
│   ├── DocumentSceneAuthoring.tsx
│   ├── NodeSelectionInterface.tsx
│   └── SceneTypeManager.tsx
├── hooks/
│   ├── useSceneAuthoring.ts
│   ├── useNodeSelection.ts
│   ├── useSceneValidation.ts
│   └── useAuthoringPermissions.ts
├── services/
│   ├── SceneAuthoringService.ts
│   ├── NodeMetadataService.ts
│   └── PermissionService.ts
├── types/
│   └── authoring.ts
└── index.ts
```

### Standing System Integration
```typescript
// Permission hooks for scene authoring
export const useAuthoringPermissions = (): AuthoringPermissions => {
  const { user, tenant } = useAuth();
  const { standingScore } = useStanding();
  
  return {
    canCreateScene: (type) => standingScore.standing >= getRequiredStanding('create', type),
    canUseCardAuthoring: () => standingScore.level >= 'collaborator',
    canUseGraphAuthoring: () => standingScore.level >= 'steward',
    canCreateNode: () => standingScore.level >= 'curator',
    canModifyCoreGraph: () => standingScore.trust >= 0.8 && standingScore.level >= 'curator',
    canModerateContent: () => standingScore.trust >= 0.9 && standingScore.reputation.moderation >= 0.7,
  };
};
```

### Database Schema Updates
```sql
-- Update users table
ALTER TABLE users RENAME COLUMN reputation TO trust;
ALTER TABLE users ADD COLUMN standing_score FLOAT DEFAULT 0.0;
ALTER TABLE users ADD COLUMN trust_score FLOAT DEFAULT 0.5;
ALTER TABLE users ADD COLUMN access_level VARCHAR(20) DEFAULT 'contributor';

-- Create standing_scores table
CREATE TABLE standing_scores (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    reputation JSON NOT NULL,
    engagement JSON NOT NULL,
    affinity JSON NOT NULL,
    standing_score FLOAT NOT NULL,
    trust_score FLOAT NOT NULL,
    access_level VARCHAR(20) NOT NULL,
    visible_metrics JSON,
    next_level VARCHAR(20),
    progress_to_next FLOAT,
    rewards JSON,
    resource_allocation JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, tenant_id)
);

-- Create permissions table
CREATE TABLE permissions (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    scope VARCHAR(20) NOT NULL,
    level VARCHAR(20) NOT NULL,
    dependencies JSON,
    metadata JSON
);
```

## Benefits

### For Users
- **Clear Progression**: Understand how to advance in the community
- **Meaningful Rewards**: Standing unlocks real benefits and features
- **Recognition**: Community standing based on contributions
- **Transparency**: See progress and next steps

### For Community
- **Quality Control**: Trust-based permissions ensure quality
- **Engagement**: Standing system encourages participation
- **Leadership**: Natural leaders emerge through standing
- **Growth**: Progressive system scales with community

### For System
- **Security**: Trust-based access to sensitive operations
- **Resource Management**: Automatic allocation based on standing
- **Scalability**: System grows with community needs
- **Analytics**: Rich data for community insights

## Risk Mitigation

### Technical Risks
- **Extraction Complexity**: Mitigated by current modular architecture
- **Permission Conflicts**: Resolved through comprehensive testing
- **Performance Impact**: Minimized through efficient permission checks

### Community Risks
- **Standing Gaming**: Prevented through trust-based security
- **Permission Abuse**: Mitigated through auditing and monitoring
- **Community Fragmentation**: Addressed through cross-tenant standing recognition

## Success Metrics

### Technical Metrics
- **Library Adoption**: Usage across admin and portal
- **Permission Accuracy**: Correct access control implementation
- **Performance**: Minimal impact on system performance
- **Security**: No unauthorized access incidents

### Community Metrics
- **User Engagement**: Increased participation and content creation
- **Standing Progression**: Users advancing through standing levels
- **Quality Improvement**: Higher quality content and contributions
- **Leadership Emergence**: Natural leaders identified through standing

## Future Enhancements

### Advanced Standing Features
- **Domain Expertise**: Specialized standing in specific knowledge areas
- **Cross-Tenant Standing**: Standing recognition across multiple communities
- **Mentorship Networks**: Standing for teaching and guiding others
- **Innovation Tracking**: Standing for new ideas and contributions

### Community Features
- **Standing-Based Voting**: Influence proportional to standing
- **Leadership Elections**: Community leaders chosen by standing
- **Resource Sharing**: Standing-based resource allocation
- **Collaboration**: Standing encourages working together

## Conclusion

This strategic approach provides a comprehensive framework for evolving the scene authoring system into a sophisticated, standing-based platform that will grow with your community while maintaining security and encouraging quality participation. The phased implementation ensures manageable development while delivering immediate value.

The integration of the Standing system, permissions architecture, and scene authoring library creates a powerful foundation for community-driven knowledge synthesis that aligns with your vision for Protogen's evolution toward Endogen and Ethosphere.
