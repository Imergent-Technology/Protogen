# Protogen Context System Architecture

## Overview
The Protogen Context System provides a unified way to create anchors and coordinates within scenes, documents, and other content types. Contexts enable precise navigation, linking, and reference systems across the entire Protogen platform.

## Core Concepts

### Context Types
1. **Scene Contexts** - Coordinates within graph scenes (x, y, z positions)
2. **Slide Contexts** - Positions within scene slides (slide indices, node states)
3. **Document Contexts** - Anchors within text documents (paragraph positions, text selections)
4. **Coordinate Contexts** - Custom coordinate systems for specialized use cases

### Coordinate Systems
- **Graph Coordinates**: 2D/3D positions within scenes
- **Document Coordinates**: Text positions, line numbers, character offsets
- **Slide Coordinates**: Slide indices, node states, transition positions
- **Custom Coordinates**: User-defined coordinate systems

## Architecture

### Context Model
```php
class Context extends Model
{
    // Core fields
    protected $fillable = [
        'guid', 'name', 'slug', 'description',
        'context_type', 'target_scene_id', 'target_slide_id',
        'coordinates', 'anchor_data', 'meta',
        'is_active', 'is_public', 'created_by'
    ];
    
    // Coordinate validation and resolution
    public function validateCoordinates(): bool
    public function resolveTarget(): ?array
}
```

### Coordinate Validation
Each context type has specific coordinate validation rules:

```php
// Scene/Coordinate contexts require x, y coordinates
case 'scene':
case 'coordinate':
    return isset($coordinates['x']) && isset($coordinates['y']) &&
           is_numeric($coordinates['x']) && is_numeric($coordinates['y']);

// Document contexts require position
case 'document':
    return isset($coordinates['position']) && is_numeric($coordinates['position']);

// Slide contexts require index
case 'slide':
    return isset($coordinates['index']) && is_numeric($coordinates['index']);
```

### Context Resolution
Contexts resolve to their target coordinates and provide navigation information:

```php
public function resolveTarget(): ?array
{
    if ($this->isSceneContext() && $this->target_scene_id) {
        return [
            'type' => 'scene',
            'id' => $this->target_scene_id,
            'coordinates' => $this->coordinates,
            'anchor_data' => $this->anchor_data
        ];
    }
    // ... other context types
}
```

## Database Schema

### Contexts Table
```sql
CREATE TABLE contexts (
    id BIGSERIAL PRIMARY KEY,
    guid UUID UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    context_type VARCHAR(50) DEFAULT 'coordinate',
    target_scene_id BIGINT REFERENCES scenes(id) ON DELETE CASCADE,
    target_slide_id BIGINT REFERENCES slides(id) ON DELETE CASCADE,
    coordinates JSONB,
    anchor_data JSONB,
    meta JSONB,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_contexts_type_active ON contexts(context_type, is_active);
CREATE INDEX idx_contexts_scene_active ON contexts(target_scene_id, is_active);
CREATE INDEX idx_contexts_slide_active ON contexts(target_slide_id, is_active);
CREATE INDEX idx_contexts_creator_active ON contexts(created_by, is_active);
CREATE INDEX idx_contexts_slug_active ON contexts(slug, is_active);
```

## API Endpoints

### Context Management
```
GET    /api/contexts              # List contexts with filtering
POST   /api/contexts              # Create new context
GET    /api/contexts/{guid}       # Get specific context
PUT    /api/contexts/{guid}       # Update context
DELETE /api/contexts/{guid}       # Delete context
```

### Context Resolution
```
GET    /api/contexts/{guid}/resolve    # Resolve context to coordinates
GET    /api/contexts/scene/{slug}      # Get contexts for scene
GET    /api/contexts/slide/{slug}       # Get contexts for slide
```

### Context Statistics
```
GET    /api/contexts/stats        # Get context statistics
```

## Use Cases

### 1. Graph Navigation
```typescript
// Create a context for a specific node position
const nodeContext = {
    name: "Important Node Position",
    context_type: "scene",
    target_scene_id: sceneId,
    coordinates: { x: 150, y: 200, z: 0 },
    anchor_data: { node_id: "node-123", description: "Key concept location" }
};
```

### 2. Document Anchors
```typescript
// Create a context for a specific text position
const textContext = {
    name: "Introduction Section",
    context_type: "document",
    coordinates: { position: 1250, line: 45 },
    anchor_data: { 
        text: "Introduction",
        selection: { start: 1250, end: 1263 }
    }
};
```

### 3. Slide Navigation
```typescript
// Create a context for a specific slide position
const slideContext = {
    name: "Key Concept Slide",
    context_type: "slide",
    target_slide_id: slideId,
    coordinates: { index: 3, node_state: "highlighted" },
    anchor_data: { slide_title: "Core Concepts", duration: 120 }
};
```

### 4. Custom Coordinates
```typescript
// Create a context for a custom coordinate system
const customContext = {
    name: "Timeline Position",
    context_type: "coordinate",
    coordinates: { 
        timeline_position: 0.75, 
        importance: 0.9,
        category: "milestone"
    },
    anchor_data: { 
        event: "Product Launch",
        date: "2024-01-15"
    }
};
```

## Integration Points

### Scene Integration
- Contexts can reference specific positions within scenes
- Enable precise navigation to graph elements
- Support for both core and phantom node references

### Slide Integration
- Contexts can reference specific positions within slides
- Enable slide-based navigation within scenes
- Support for node state transitions and animations

### Document Integration
- Contexts can reference specific text positions
- Enable precise document navigation
- Support for text selection and annotation

### Navigation System
- Contexts provide unified navigation targets
- Enable cross-content linking and references
- Support for context-aware routing

## Slide System Architecture

### Overview
The Slide System enables nodes within scenes to transition between different states and appearances. Slides are associated with scenes rather than decks, allowing for rich animations and state transitions within individual scenes.

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

## Implementation Guidelines

### 1. Context Creation
- Always validate coordinates based on context type
- Ensure target references are valid
- Generate unique slugs for context identification

### 2. Context Resolution
- Implement fallback mechanisms for invalid contexts
- Provide meaningful error messages
- Cache resolved contexts for performance

### 3. Context Validation
- Validate coordinate structure based on type
- Ensure target entities exist and are accessible
- Validate metadata against registry schemas

### 4. Performance Considerations
- Index frequently queried coordinate fields
- Implement coordinate caching for repeated lookups
- Use efficient JSON queries for coordinate data

## Future Enhancements

### 1. Advanced Coordinate Systems
- Support for polar coordinates
- 3D coordinate systems with rotation
- Time-based coordinate systems

### 2. Context Relationships
- Hierarchical context structures
- Context inheritance and composition
- Context dependency management

### 3. Context Analytics
- Usage tracking and analytics
- Context performance metrics
- User behavior analysis

### 4. Context Sharing
- Public context sharing
- Context collaboration features
- Context versioning and history

## Migration Strategy

### 1. Legacy Anchor Support
- Maintain compatibility with existing anchor systems
- Provide migration tools for legacy anchors
- Gradual transition to new context system

### 2. Data Migration
- Convert existing anchor data to contexts
- Preserve coordinate information
- Maintain backward compatibility

### 3. API Evolution
- Deprecate old anchor endpoints
- Provide migration guides for API consumers
- Implement feature flags for gradual rollout

## Testing Strategy

### 1. Unit Tests
- Context model validation
- Coordinate validation logic
- Context resolution methods

### 2. Integration Tests
- Context API endpoints
- Database operations
- Coordinate system integration

### 3. End-to-End Tests
- Context creation workflows
- Context resolution workflows
- Cross-system context usage

### 4. Performance Tests
- Coordinate validation performance
- Context resolution performance
- Database query performance

## Security Considerations

### 1. Access Control
- Context visibility controls
- User permission validation
- Public/private context management

### 2. Input Validation
- Coordinate data validation
- Metadata sanitization
- SQL injection prevention

### 3. Rate Limiting
- Context creation limits
- API endpoint protection
- Abuse prevention measures

## Conclusion

The Context System provides a powerful foundation for precise navigation and reference systems across the Protogen platform. By unifying coordinate systems and providing robust validation and resolution, contexts enable new levels of content interconnectivity and user experience.

The system is designed to be extensible, allowing for future coordinate systems and use cases while maintaining backward compatibility and performance. Through careful implementation and testing, the Context System will become a core component of the Protogen architecture.
