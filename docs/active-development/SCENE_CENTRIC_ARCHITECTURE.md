# Scene-Centric Architecture Refactoring

## Overview
This document outlines the refactoring to make **Scenes** the primary unit of content and presentation, with **Slides** and **Tweening** managed directly by the Scene System, while **Decks** serve purely as organizational containers.

## Core Principle
**Scenes are the atomic unit of presentation.** They fully manage their own slides, transitions, and tweening behavior. Decks are lightweight containers that group related scenes for optimized loading and navigation.

## Architectural Hierarchy

```
Deck (Organizational Container)
  └─ Scenes (Primary Unit - owns all presentation logic)
      ├─ Slides (managed by Scene)
      │   └─ SlideItems (node states per slide)
      ├─ SceneItems (nodes/content in the scene)
      ├─ Transitions & Tweening (managed by Scene)
      └─ Contexts (anchor points within the scene)
```

## Key Changes from Current Implementation

### 1. **Scene System Responsibilities** (EXPANDED)
Scenes now own and manage:
- ✅ Scene items (nodes, content)
- ✅ Slides (states of the scene over time)
- ✅ Slide transitions and tweening configuration
- ✅ Animation sequences between slides
- ✅ Context anchors within slides
- ✅ Scene-level navigation controls
- 🆕 Tweening orchestration for slide transitions
- 🆕 Slide lifecycle management
- 🆕 Slide-specific rendering configuration

### 2. **Deck System Responsibilities** (REDUCED)
Decks become lightweight organizational containers:
- ✅ Grouping related scenes for loading optimization
- ✅ Scene ordering and sequencing
- ✅ Loading strategy (preload, lazy-load, keep-warm)
- ✅ Deck-level metadata and permissions
- ❌ NO slide management
- ❌ NO transition configuration
- ❌ NO tweening logic

### 3. **Slide System** (SCENE-OWNED)
Slides are now a feature OF scenes, not a separate system:
- Slides belong to a single scene
- Slide configuration lives in Scene model
- Slide transitions defined by the scene
- No standalone "Slide System" - integrated into Scene

### 4. **Navigator System Responsibilities**
Navigator coordinates between systems but doesn't manage content:
- Scene-to-scene navigation (within or across decks)
- Slide-to-slide navigation (delegated to Scene)
- Context resolution and navigation
- Navigation history and tracks
- Event coordination between systems
- Tweening interface (coordinates with Scene tweening)

## Updated Model Structure

### Scene Model (Enhanced)
```php
class Scene extends Model
{
    protected $fillable = [
        // Existing fields
        'guid', 'name', 'slug', 'description', 'scene_type',
        'config', 'meta', 'style', 'is_active', 'is_public',
        'created_by', 'tenant_id', 'subgraph_id', 'published_at',
        
        // Enhanced slide configuration
        'slide_config',        // Slide behavior settings
        'transition_config',   // Default transitions between slides
        'tweening_config',     // Tweening settings for this scene
        'navigation_config',   // Scene-level navigation settings
    ];
    
    protected $casts = [
        'config' => 'array',
        'meta' => 'array',
        'style' => 'array',
        'slide_config' => 'array',      // NEW
        'transition_config' => 'array',  // NEW
        'tweening_config' => 'array',    // NEW
        'navigation_config' => 'array',  // NEW
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'published_at' => 'datetime',
    ];
    
    // Relationships
    public function slides(): HasMany;
    public function items(): HasMany;
    public function content(): HasMany;
    public function subgraph(): BelongsTo;
    public function contexts(): HasMany;
    public function decks(): BelongsToMany;  // Inverse of deck->scenes
    
    // Scene Slide Management
    public function getActiveSlide(): ?Slide;
    public function setActiveSlide(int $slideIndex): void;
    public function nextSlide(): ?Slide;
    public function previousSlide(): ?Slide;
    public function getSlideCount(): int;
    public function reorderSlides(array $slideOrder): void;
    
    // Tweening Management
    public function getTweeningConfig(): array;
    public function applyTweenBetweenSlides(Slide $from, Slide $to): array;
    public function getTransitionForSlides(Slide $from, Slide $to): array;
    
    // Navigation
    public function getNavigationConfig(): array;
    public function canNavigateToSlide(int $slideIndex): bool;
}
```

### Deck Model (Simplified)
```php
class Deck extends Model
{
    protected $fillable = [
        'guid', 'name', 'slug', 'description', 'type',
        'scene_ids',       // Ordered list of scene IDs
        'loading_strategy', // How to load scenes (preload, lazy, warm)
        'meta', 'is_active', 'is_public',
        'created_by', 'tenant_id',
    ];
    
    protected $casts = [
        'scene_ids' => 'array',
        'loading_strategy' => 'array',  // RENAMED from 'performance'
        'meta' => 'array',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
    ];
    
    // Relationships
    public function scenes(): BelongsToMany;
    public function contexts(): HasMany;
    
    // Scene Organization
    public function addScene(string $sceneId, int $order = null): void;
    public function removeScene(string $sceneId): void;
    public function reorderScenes(array $sceneIds): void;
    public function getSceneOrder(string $sceneId): ?int;
    
    // Loading Strategy
    public function getLoadingStrategy(): array;
    public function shouldPreloadScene(string $sceneId): bool;
    public function getScenesToKeepWarm(): array;
}
```

### Slide Model (Scene-Owned)
```php
class Slide extends Model
{
    protected $fillable = [
        'id', 'scene_id',  // MUST have scene_id, no standalone slides
        'name', 'description', 'slide_index',
        'is_active', 'transition_config', 'meta'
    ];
    
    // Always belongs to a scene
    public function scene(): BelongsTo;
    public function slideItems(): HasMany;
    
    // Slide cannot exist without a scene
    protected static function boot() {
        parent::boot();
        static::creating(function ($slide) {
            if (!$slide->scene_id) {
                throw new \Exception('Slide must belong to a scene');
            }
        });
    }
}
```

## Frontend Architecture

### Scene System (Frontend)
```typescript
// portal/src/systems/scene/SceneSystem.ts
export class SceneSystem {
  private currentScene: Scene | null = null;
  private currentSlideIndex: number = 0;
  private tweeningSystem: TweeningSystem;
  
  // Scene Management
  async loadScene(sceneId: string): Promise<void>;
  async unloadScene(): Promise<void>;
  
  // Slide Management (Scene-Owned)
  async navigateToSlide(slideIndex: number): Promise<void>;
  async nextSlide(): Promise<void>;
  async previousSlide(): Promise<void>;
  getCurrentSlide(): Slide | null;
  getSlideCount(): number;
  
  // Tweening (Scene-Managed)
  async transitionBetweenSlides(from: Slide, to: Slide): Promise<void>;
  getTweeningSystem(): TweeningSystem;
  
  // Scene Lifecycle
  async play(): Promise<void>;   // Auto-advance slides
  async pause(): Promise<void>;
  async reset(): Promise<void>;  // Go to first slide
}
```

### Navigator System (Coordinator)
```typescript
// portal/src/systems/navigator/NavigatorSystem.ts
export class NavigatorSystem {
  // Scene Navigation
  async navigateToScene(sceneId: string, slideIndex?: number): Promise<void>;
  async navigateToSlide(slideIndex: number): Promise<void>;  // Delegates to SceneSystem
  
  // Deck Navigation
  async navigateToDeck(deckId: string): Promise<void>;
  async nextSceneInDeck(): Promise<void>;
  async previousSceneInDeck(): Promise<void>;
  
  // Context Navigation
  async navigateToContext(contextId: string): Promise<void>;
  
  // Coordinate between systems, don't manage content
  private getSceneSystem(): SceneSystem;
  private getContextSystem(): ContextSystem;
}
```

### Tweening System (Scene-Integrated)
```typescript
// portal/src/systems/scene/TweeningSystem.ts
// Moves from systems/slide/ to systems/scene/
// Tweening is now a capability of scenes, not a separate system
export class TweeningSystem {
  // Used by SceneSystem to animate between slides
  async tween(
    nodeId: string,
    fromState: NodeState,
    toState: NodeState,
    config: TweeningConfig
  ): Promise<void>;
  
  // Batch tweening for slide transitions
  async tweenMultiple(transitions: TweenTransition[]): Promise<void>;
  
  // Controlled by Scene, not standalone
  private scene: Scene;
  constructor(scene: Scene);
}
```

## Migration Path

### Phase 1: Backend Model Enhancement
1. Add new fields to Scene model (slide_config, transition_config, tweening_config)
2. Create database migration for new Scene fields
3. Update Scene model with slide management methods
4. Simplify Deck model (remove navigation, keep loading_strategy)

### Phase 2: API Updates
1. Update SceneController with slide management endpoints
2. Add scene slide navigation endpoints
3. Update Slide endpoints to enforce scene ownership
4. Update Deck endpoints to remove slide-related logic

### Phase 3: Frontend Refactoring
1. Move TweeningSystem from systems/slide/ to systems/scene/
2. Create SceneSystem that owns slide and tweening logic
3. Update Navigator to delegate to SceneSystem
4. Update components to use SceneSystem instead of separate SlideSystem

### Phase 4: Integration & Testing
1. Update Scene Authoring UI to manage slides as part of scenes
2. Test slide transitions within scene context
3. Test deck loading and scene sequencing
4. Update documentation

## Benefits of This Approach

### 1. **Conceptual Clarity**
- Scenes are the atomic unit of presentation
- Clear ownership: Scene owns slides, deck organizes scenes
- No ambiguity about where logic lives

### 2. **Simpler Mental Model**
- Users think in terms of scenes, not slides
- "This scene has multiple states (slides)"
- "This deck contains these scenes"

### 3. **Better Encapsulation**
- Scene fully controls its presentation
- Tweening is a scene capability, not a separate system
- Decks are truly just organizational containers

### 4. **Easier to Reason About**
- Want to change a transition? Modify the scene.
- Want to reorder content? Reorder scenes in deck.
- Want to animate? Scene handles it.

### 5. **Flexible & Extensible**
- Each scene can have different tweening behavior
- Scenes can be reused across decks
- Scene types can have specialized slide behavior

## Example Usage

### Creating a Scene with Slides
```typescript
// Scene owns and manages its slides
const scene = await sceneSystem.createScene({
  name: "Introduction",
  scene_type: "card",
  slide_config: {
    auto_advance: false,
    loop: false,
    duration_per_slide: 5000
  },
  tweening_config: {
    default_duration: 1000,
    default_easing: "ease-in-out"
  }
});

// Add slides to the scene
await sceneSystem.addSlide(scene.id, {
  name: "Welcome",
  slide_index: 0,
  transition_config: { duration: 500, easing: "ease-in" }
});

await sceneSystem.addSlide(scene.id, {
  name: "Key Points",
  slide_index: 1,
  transition_config: { duration: 750, easing: "ease-out" }
});
```

### Navigating Within a Scene
```typescript
// Load a scene (loads all its slides)
await sceneSystem.loadScene(sceneId);

// Navigate between slides (scene handles tweening)
await sceneSystem.nextSlide();
await sceneSystem.previousSlide();
await sceneSystem.navigateToSlide(2);
```

### Deck as Scene Container
```typescript
// Create a deck to organize scenes
const deck = await deckSystem.createDeck({
  name: "Product Tour",
  loading_strategy: {
    preload: "first",  // Preload first scene
    keep_warm: ["scene1", "scene2"],  // Keep these ready
    lazy_load: true  // Lazy load others
  }
});

// Add scenes to deck
await deckSystem.addScene(deck.id, scene1.id, { order: 1 });
await deckSystem.addScene(deck.id, scene2.id, { order: 2 });

// Navigate deck sequences (Navigator coordinates)
await navigator.navigateToDeck(deck.id);
await navigator.nextSceneInDeck();  // Loads next scene, goes to its first slide
```

## Summary

This refactoring establishes **Scenes as the primary unit** with full control over their presentation, including slides and tweening. **Decks become pure organizational containers** for loading optimization. **Navigator coordinates** between systems without managing content. This creates a cleaner, more maintainable architecture that matches how users conceptually think about the system.

## Next Steps

1. ✅ Document the new architecture (this document)
2. ⏳ Create database migration for Scene enhancements
3. ⏳ Update Scene model with slide management
4. ⏳ Refactor frontend: Move TweeningSystem to SceneSystem
5. ⏳ Update Navigator to delegate to SceneSystem
6. ⏳ Update Scene Authoring UI
7. ⏳ Test and validate the new architecture

