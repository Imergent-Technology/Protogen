# Protogen Context System Architecture

## Overview
The Protogen Context System provides a unified way to create anchors and coordinates within scenes, documents, and other content types. Contexts enable precise navigation, linking, and reference systems across the entire Protogen platform.

## Core Concepts

### Context Types
1. **Scene Contexts** - Coordinates within graph scenes (x, y, z positions)
2. **Deck Contexts** - Positions within presentation decks (slide numbers, flow positions)
3. **Document Contexts** - Anchors within text documents (paragraph positions, text selections)
4. **Coordinate Contexts** - Custom coordinate systems for specialized use cases

### Coordinate Systems
- **Graph Coordinates**: 2D/3D positions within scenes
- **Document Coordinates**: Text positions, line numbers, character offsets
- **Deck Coordinates**: Slide indices, flow positions, navigation points
- **Custom Coordinates**: User-defined coordinate systems

## Architecture

### Context Model
```php
class Context extends Model
{
    // Core fields
    protected $fillable = [
        'guid', 'name', 'slug', 'description',
        'context_type', 'target_scene_id', 'target_deck_id',
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

// Deck contexts require index
case 'deck':
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
    target_deck_id BIGINT REFERENCES decks(id) ON DELETE CASCADE,
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
CREATE INDEX idx_contexts_deck_active ON contexts(target_deck_id, is_active);
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
GET    /api/contexts/deck/{slug}       # Get contexts for deck
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

### 3. Presentation Flow
```typescript
// Create a context for a specific deck position
const deckContext = {
    name: "Key Concept Slide",
    context_type: "deck",
    target_deck_id: deckId,
    coordinates: { index: 3, flow_position: "concept-introduction" },
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

### Deck Integration
- Contexts can reference specific positions within decks
- Enable presentation flow navigation
- Support for slide transitions and flow control

### Document Integration
- Contexts can reference specific text positions
- Enable precise document navigation
- Support for text selection and annotation

### Navigation System
- Contexts provide unified navigation targets
- Enable cross-content linking and references
- Support for context-aware routing

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
