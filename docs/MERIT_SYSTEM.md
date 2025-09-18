# Merit System Architecture

## Overview

The Merit System is a comprehensive user progression and permission framework that tracks user contributions, expertise, and community leadership to determine access levels and resource allocation. This system replaces the simple reputation system with a sophisticated multi-dimensional scoring approach.

## Core Concepts

### Merit Score
A composite score (0-100) that combines participation, expertise, and leadership metrics to determine a user's overall community contribution level.

### Trust Score  
A reliability metric (0-100) that measures user trustworthiness and community standing, replacing the legacy "reputation" field.

### Access Levels
Progressive access levels that unlock features and resources based on Merit + Trust scores:
- **Visitor** (0-20 merit): Basic viewing
- **Member** (21-40 merit): Content creation
- **Contributor** (41-60 merit): Advanced authoring
- **Expert** (61-80 merit): Graph operations
- **Leader** (81-95 merit): Community leadership
- **Architect** (96-100 merit): System architecture

## Merit Components

### Participation Merit
Tracks user engagement and contribution frequency:
- Content created (scenes, decks, contexts)
- Feedback given and received
- Discussion participation
- Collaboration activities
- Time spent in community
- Consistency over time
- Quality of contributions

### Expertise Merit
Measures domain knowledge and technical skills:
- Domain-specific expertise scores
- Technical skill assessments
- Content quality ratings
- Peer recognition
- Mentorship activities
- Innovation contributions

### Leadership Merit
Evaluates community influence and guidance:
- Community influence metrics
- Content curation activities
- Moderation contributions
- Mentorship of others
- Innovation leadership
- Vision and direction setting

## Trust System

### Trust Score Calculation
Trust is calculated based on:
- Content quality and consistency
- Community feedback and ratings
- Moderation history
- Reliability in commitments
- Long-term participation
- Peer endorsements

### Trust-Based Permissions
High-trust users gain access to:
- Core graph modifications
- Content moderation tools
- Advanced authoring features
- System administration
- Sensitive operations

## Progressive Visibility

Users see different levels of their merit breakdown based on their access level:

- **Visitor**: Basic participation metrics
- **Member**: Participation + basic expertise
- **Contributor**: Participation + expertise + basic leadership
- **Expert**: Full merit breakdown
- **Leader**: Merit + rewards + resource allocation
- **Architect**: Complete system visibility

## Resource Allocation

### Automatic Resource Assignment
Based on merit level, users receive:
- **Storage quotas**: Increased cloud storage
- **Bandwidth limits**: Higher API call limits
- **Feature access**: Advanced authoring tools
- **Priority support**: Faster response times
- **Custom domains**: Personal tenant access

### Rewards System
- **Badges**: Recognition for achievements
- **Titles**: Community status indicators
- **Benefits**: Access to premium features
- **Resources**: Additional storage/bandwidth
- **Influence**: Voting power in community decisions

## Implementation Phases

### Phase 5A: Merit Foundation (Current Phase)
- [ ] Create MeritScore model and database schema
- [ ] Implement basic merit calculation service
- [ ] Add trust score calculation
- [ ] Create access level determination
- [ ] Update user model with merit fields

### Phase 5B: Permission Integration
- [ ] Integrate merit system with scene authoring library
- [ ] Add permission hooks to all authoring components
- [ ] Implement trust-based restrictions
- [ ] Create progressive UI based on access levels
- [ ] Add merit display to user profiles

### Phase 6: Advanced Features
- [ ] Implement progressive visibility system
- [ ] Add resource allocation based on merit
- [ ] Create rewards and benefits system
- [ ] Add merit-based content recommendations
- [ ] Implement community leadership tools

### Phase 7: Analytics & Insights
- [ ] Add merit analytics dashboard
- [ ] Create community health metrics
- [ ] Implement merit-based content curation
- [ ] Add predictive merit scoring
- [ ] Create community growth insights

## Database Schema

### Users Table Updates
```sql
-- Rename reputation to trust
ALTER TABLE users RENAME COLUMN reputation TO trust;

-- Add merit system fields
ALTER TABLE users ADD COLUMN merit_score FLOAT DEFAULT 0.0;
ALTER TABLE users ADD COLUMN trust_score FLOAT DEFAULT 0.5;
ALTER TABLE users ADD COLUMN access_level VARCHAR(20) DEFAULT 'visitor';
ALTER TABLE users ADD COLUMN merit_breakdown JSON;
ALTER TABLE users ADD COLUMN visible_metrics JSON;
ALTER TABLE users ADD COLUMN rewards JSON;
ALTER TABLE users ADD COLUMN resource_allocation JSON;
```

### Merit Scores Table
```sql
CREATE TABLE merit_scores (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    
    -- Merit components
    participation JSON NOT NULL,
    expertise JSON NOT NULL,
    leadership JSON NOT NULL,
    
    -- Calculated scores
    merit_score FLOAT NOT NULL,
    trust_score FLOAT NOT NULL,
    access_level VARCHAR(20) NOT NULL,
    
    -- Progression
    visible_metrics JSON,
    next_level VARCHAR(20),
    progress_to_next FLOAT,
    
    -- Rewards and resources
    rewards JSON,
    resource_allocation JSON,
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    UNIQUE(user_id, tenant_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

## API Integration

### Merit Service
```php
class MeritService {
    public function calculateMerit(User $user, Tenant $tenant): MeritScore
    public function updateParticipation(User $user, string $action, float $value = 1.0): void
    public function updateExpertise(User $user, string $domain, float $score): void
    public function updateLeadership(User $user, string $metric, float $score): void
    public function getVisibleMetrics(AccessLevel $level): array
    public function calculateRewards(AccessLevel $level): array
    public function calculateResourceAllocation(AccessLevel $level): array
}
```

### Permission Hooks
```typescript
export const useAuthoringPermissions = (): AuthoringPermissions => {
  const { user, tenant } = useAuth();
  const { meritScore } = useMerit();
  
  return {
    canCreateScene: (type) => meritScore.merit >= getRequiredMerit('create', type),
    canUseCardAuthoring: () => meritScore.level >= 'member',
    canCreateNode: () => meritScore.level >= 'expert',
    canModifyCoreGraph: () => meritScore.trust >= 0.8 && meritScore.level >= 'expert',
    canModerateContent: () => meritScore.trust >= 0.9 && meritScore.leadership.moderation >= 0.7,
  };
};
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

This merit system provides a comprehensive framework for user progression that will grow with your community while maintaining security and encouraging quality participation.
