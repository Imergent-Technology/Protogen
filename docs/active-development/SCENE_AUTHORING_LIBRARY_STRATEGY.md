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

## Slide System Architecture

### Overview
The Slide System enables nodes within scenes to transition between different states and appearances. Slides are associated with scenes rather than decks, allowing for rich animations and state transitions within individual scenes. This system is fundamental to creating dynamic, interactive presentations within the Protogen platform.

### Core Concepts

#### **Slides and Scene Items**
- **Slides**: Define states for nodes within a scene, allowing transitions between different positions and appearances
- **Scene Items**: Represent nodes in a scene with an optional `slide_id` field
- **Slide Items**: One slide item per slide per node, defining the node's state for that specific slide
- **Tweening System**: Orchestrates smooth transitions between slide states

#### **Scene Item Enhancement**
```typescript
interface SceneItem {
  id: string;
  scene_id: string;
  item_type: 'node' | 'edge' | 'text' | 'image' | 'video' | 'other';
  item_id: number;
  item_guid: string;
  position: { x: number; y: number; z?: number };
  dimensions: { width: number; height: number };
  style: Record<string, any>;
  meta: Record<string, any>;
  is_visible: boolean;
  z_index: number;
  slide_id?: string; // Optional slide association
  created_at: string;
  updated_at: string;
}
```

#### **Slide Items**
```typescript
interface SlideItem {
  id: string;
  slide_id: string;
  scene_item_id: string;
  position: { x: number; y: number; z?: number };
  dimensions: { width: number; height: number };
  style: Record<string, any>;
  meta: Record<string, any>;
  is_visible: boolean;
  z_index: number;
  transition_duration?: number;
  transition_easing?: string;
  created_at: string;
  updated_at: string;
}
```

#### **Slides**
```typescript
interface Slide {
  id: string;
  scene_id: string;
  name: string;
  description?: string;
  order: number;
  duration?: number;
  transition_type?: 'fade' | 'slide' | 'zoom' | 'custom';
  transition_duration?: number;
  transition_easing?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Database Schema

#### **Slides Table**
```sql
CREATE TABLE slides (
    id BIGSERIAL PRIMARY KEY,
    scene_id BIGINT NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    duration INTEGER, -- in milliseconds
    transition_type VARCHAR(50),
    transition_duration INTEGER,
    transition_easing VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Slide Items Table**
```sql
CREATE TABLE slide_items (
    id BIGSERIAL PRIMARY KEY,
    slide_id BIGINT NOT NULL REFERENCES slides(id) ON DELETE CASCADE,
    scene_item_id BIGINT NOT NULL REFERENCES scene_items(id) ON DELETE CASCADE,
    position JSONB,
    dimensions JSONB,
    style JSONB,
    meta JSONB,
    is_visible BOOLEAN DEFAULT true,
    z_index INTEGER DEFAULT 0,
    transition_duration INTEGER,
    transition_easing VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(slide_id, scene_item_id)
);
```

#### **Scene Items Enhancement**
```sql
-- Add slide_id to existing scene_items table
ALTER TABLE scene_items ADD COLUMN slide_id BIGINT REFERENCES slides(id) ON DELETE SET NULL;
CREATE INDEX idx_scene_items_slide_id ON scene_items(slide_id);
```

### Tweening System

#### **Transition Logic**
1. **Default State**: Scene items without `slide_id` render consistently across all slides
2. **Slide-Specific State**: When a slide contains a `slide_item` for a node, that node transitions to the slide's defined state
3. **State Persistence**: Nodes maintain their last slide state until encountering a new slide with different `slide_item` data
4. **Smooth Transitions**: The tweening system orchestrates smooth transitions between states

#### **Transition Types**
- **Position**: Smooth movement between coordinates
- **Scale**: Size changes with easing
- **Rotation**: Angular transitions
- **Opacity**: Fade in/out effects
- **Style**: Color, border, and other CSS property transitions

#### **Tweening Configuration**
```typescript
interface TweeningConfig {
  duration: number; // milliseconds
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';
  delay?: number; // milliseconds
  repeat?: number; // -1 for infinite
  yoyo?: boolean; // reverse animation
}
```

### Deck System Evolution

#### **New Deck Purpose**
Decks are now focused on grouping highly related scenes together for optimization:
- **Scene Grouping**: Group related scenes for efficient loading
- **Code Optimization**: Load scene-specific code blobs in the right sequence
- **Presentation Optimization**: Optimize presentation of included scenes
- **Future Extensibility**: Support for advanced deck features

#### **Deck-Scene Relationship**
```typescript
interface Deck {
  id: string;
  name: string;
  description?: string;
  scene_ids: string[]; // Ordered list of scene IDs
  loading_strategy: 'sequential' | 'parallel' | 'lazy';
  preload_scenes: number; // Number of scenes to preload
  optimization_config: {
    bundle_scenes: boolean;
    shared_dependencies: string[];
    cache_strategy: 'aggressive' | 'conservative';
  };
  created_at: string;
  updated_at: string;
}
```

### API Endpoints

#### **Slide Management**
```
GET    /api/slides                    # List slides for a scene
POST   /api/slides                    # Create new slide
GET    /api/slides/{id}               # Get specific slide
PUT    /api/slides/{id}               # Update slide
DELETE /api/slides/{id}               # Delete slide
```

#### **Slide Items Management**
```
GET    /api/slides/{id}/items        # Get slide items for a slide
POST   /api/slides/{id}/items         # Create slide item
PUT    /api/slide-items/{id}          # Update slide item
DELETE /api/slide-items/{id}          # Delete slide item
```

#### **Scene Item Enhancement**
```
PUT    /api/scene-items/{id}/slide    # Associate scene item with slide
DELETE /api/scene-items/{id}/slide    # Remove slide association
```

### Use Cases

#### **1. Node State Transitions**
```typescript
// Create a slide that highlights specific nodes
const highlightSlide = {
  name: "Key Concepts Highlight",
  scene_id: sceneId,
  order: 1,
  duration: 3000,
  transition_type: "fade",
  items: [
    {
      scene_item_id: "node-1",
      position: { x: 100, y: 200 },
      style: { backgroundColor: "#ff6b6b", scale: 1.2 },
      transition_duration: 500
    }
  ]
};
```

#### **2. Progressive Disclosure**
```typescript
// Create slides that progressively reveal content
const progressiveSlides = [
  {
    name: "Overview",
    order: 1,
    items: [
      { scene_item_id: "title", is_visible: true },
      { scene_item_id: "subtitle", is_visible: true },
      { scene_item_id: "details", is_visible: false }
    ]
  },
  {
    name: "Details",
    order: 2,
    items: [
      { scene_item_id: "details", is_visible: true, transition_duration: 800 }
    ]
  }
];
```

#### **3. Animation Sequences**
```typescript
// Create complex animation sequences
const animationSequence = {
  slides: [
    {
      name: "Initial State",
      order: 1,
      items: [
        { scene_item_id: "node-1", position: { x: 0, y: 0 }, scale: 1.0 }
      ]
    },
    {
      name: "Movement",
      order: 2,
      items: [
        { 
          scene_item_id: "node-1", 
          position: { x: 200, y: 100 }, 
          scale: 1.5,
          transition_duration: 1000,
          transition_easing: "ease-in-out"
        }
      ]
    }
  ]
};
```

### Integration with Other Systems

#### **Navigator System Integration**
- **Slide Navigation**: Navigator handles slide transitions and state management
- **Context Awareness**: Navigator tracks current slide and slide history
- **Transition Coordination**: Navigator orchestrates slide transitions with scene navigation

#### **Orchestrator System Integration**
- **Scene Lifecycle**: Orchestrator manages slide states during scene loading/unloading
- **State Management**: Orchestrator coordinates slide state with scene state
- **Performance Optimization**: Orchestrator optimizes slide loading and caching

#### **Context System Integration**
- **Slide Contexts**: Context system supports slide-specific coordinate systems
- **Navigation Anchors**: Slide positions can be used as navigation anchors
- **Cross-Slide References**: Context system enables linking between slides

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
