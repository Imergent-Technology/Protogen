# Scene Authoring Library Strategy

## Overview

This document outlines the strategic approach for extracting and evolving the scene authoring tools into a separate library, integrated with the Merit system and permissions architecture. This approach enables multi-tenant authoring capabilities while maintaining security and encouraging community participation.

## Strategic Objectives

### 1. Scene Authoring Library Extraction
- **Extract Now**: Current authoring tools are mature enough for extraction
- **Modular Architecture**: Clean separation of concerns for reusability
- **Multi-Tenant Ready**: Library supports tenant-specific authoring
- **Permission Integration**: Built-in permission hooks for security

### 2. Merit System Integration
- **Progressive Access**: Features unlock based on merit levels
- **Trust-Based Security**: Sensitive operations require high trust
- **Community Building**: Merit encourages quality participation
- **Resource Allocation**: Automatic benefits based on merit

### 3. Permissions Architecture
- **Granular Control**: Fine-grained permissions for specific features
- **Merit-Based**: Permissions determined by user merit and trust
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

#### Merit System Foundation
- [ ] Create MeritScore model and database schema
- [ ] Implement basic merit calculation service
- [ ] Add trust score calculation (replacing reputation)
- [ ] Create access level determination
- [ ] Update user model with merit fields

#### Permissions Architecture
- [ ] Create permission database schema
- [ ] Implement PermissionService
- [ ] Add merit-based permission checks
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

#### Merit System Enhancement
- [ ] Implement progressive visibility system
- [ ] Add resource allocation based on merit
- [ ] Create rewards and benefits system
- [ ] Add merit-based content recommendations
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
- [ ] Add merit display to user profiles
- [ ] Create user progression interface

#### Advanced Features
- [ ] Add merit-based content curation
- [ ] Implement community leadership tools
- [ ] Create merit analytics dashboard
- [ ] Add cross-tenant merit recognition
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

### Merit System Integration
```typescript
// Permission hooks for scene authoring
export const useAuthoringPermissions = (): AuthoringPermissions => {
  const { user, tenant } = useAuth();
  const { meritScore } = useMerit();
  
  return {
    canCreateScene: (type) => meritScore.merit >= getRequiredMerit('create', type),
    canUseCardAuthoring: () => meritScore.level >= 'member',
    canUseGraphAuthoring: () => meritScore.level >= 'contributor',
    canCreateNode: () => meritScore.level >= 'expert',
    canModifyCoreGraph: () => meritScore.trust >= 0.8 && meritScore.level >= 'expert',
    canModerateContent: () => meritScore.trust >= 0.9 && meritScore.leadership.moderation >= 0.7,
  };
};
```

### Database Schema Updates
```sql
-- Update users table
ALTER TABLE users RENAME COLUMN reputation TO trust;
ALTER TABLE users ADD COLUMN merit_score FLOAT DEFAULT 0.0;
ALTER TABLE users ADD COLUMN trust_score FLOAT DEFAULT 0.5;
ALTER TABLE users ADD COLUMN access_level VARCHAR(20) DEFAULT 'visitor';

-- Create merit_scores table
CREATE TABLE merit_scores (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    participation JSON NOT NULL,
    expertise JSON NOT NULL,
    leadership JSON NOT NULL,
    merit_score FLOAT NOT NULL,
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
- **Meaningful Rewards**: Merit unlocks real benefits and features
- **Recognition**: Community standing based on contributions
- **Transparency**: See progress and next steps

### For Community
- **Quality Control**: Trust-based permissions ensure quality
- **Engagement**: Merit system encourages participation
- **Leadership**: Natural leaders emerge through merit
- **Growth**: Progressive system scales with community

### For System
- **Security**: Trust-based access to sensitive operations
- **Resource Management**: Automatic allocation based on merit
- **Scalability**: System grows with community needs
- **Analytics**: Rich data for community insights

## Risk Mitigation

### Technical Risks
- **Extraction Complexity**: Mitigated by current modular architecture
- **Permission Conflicts**: Resolved through comprehensive testing
- **Performance Impact**: Minimized through efficient permission checks

### Community Risks
- **Merit Gaming**: Prevented through trust-based security
- **Permission Abuse**: Mitigated through auditing and monitoring
- **Community Fragmentation**: Addressed through cross-tenant merit recognition

## Success Metrics

### Technical Metrics
- **Library Adoption**: Usage across admin and portal
- **Permission Accuracy**: Correct access control implementation
- **Performance**: Minimal impact on system performance
- **Security**: No unauthorized access incidents

### Community Metrics
- **User Engagement**: Increased participation and content creation
- **Merit Progression**: Users advancing through merit levels
- **Quality Improvement**: Higher quality content and contributions
- **Leadership Emergence**: Natural leaders identified through merit

## Future Enhancements

### Advanced Merit Features
- **Domain Expertise**: Specialized merit in specific knowledge areas
- **Cross-Tenant Merit**: Merit recognition across multiple communities
- **Mentorship Networks**: Merit for teaching and guiding others
- **Innovation Tracking**: Merit for new ideas and contributions

### Community Features
- **Merit-Based Voting**: Influence proportional to merit
- **Leadership Elections**: Community leaders chosen by merit
- **Resource Sharing**: Merit-based resource allocation
- **Collaboration**: Merit encourages working together

## Conclusion

This strategic approach provides a comprehensive framework for evolving the scene authoring system into a sophisticated, merit-based platform that will grow with your community while maintaining security and encouraging quality participation. The phased implementation ensures manageable development while delivering immediate value.

The integration of the Merit system, permissions architecture, and scene authoring library creates a powerful foundation for community-driven knowledge synthesis that aligns with your vision for Protogen's evolution toward Endogen and Ethosphere.
