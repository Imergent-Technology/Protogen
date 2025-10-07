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
        'slide_config',           // Slide behavior settings (auto-advance, loop, etc.)
        'default_slide_animation', // Default entrance/exit animations for slides
    ];
    
    protected $casts = [
        'config' => 'array',
        'meta' => 'array',
        'style' => 'array',
        'slide_config' => 'array',             // NEW
        'default_slide_animation' => 'array',  // NEW
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'published_at' => 'datetime',
    ];
    
    // Default slide animation structure
    // 'default_slide_animation' => [
    //     'entrance' => [
    //         'type' => 'fade',  // fade, slide, expand
    //         'direction' => 'right',  // left, right, top, bottom, center
    //         'distance' => 'edge',  // nearby, edge (only for slide type)
    //         'duration' => 300,  // milliseconds
    //         'easing' => 'ease-in-out'
    //     ],
    //     'exit' => [
    //         'type' => 'fade',
    //         'direction' => 'left',
    //         'distance' => 'edge',
    //         'duration' => 300,
    //         'easing' => 'ease-in-out'
    //     ]
    // ]
    
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
    
    // Animation Management
    public function getDefaultAnimation(string $direction = 'forward'): array;
    public function getAnimationForSlide(Slide $slide, string $direction): array;
    
    // Navigation
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
        'is_active', 
        'entrance_animation',  // Override scene default entrance
        'exit_animation',      // Override scene default exit
        'meta'
    ];
    
    protected $casts = [
        'entrance_animation' => 'array',  // NULL = use scene default
        'exit_animation' => 'array',      // NULL = use scene default
        'is_active' => 'boolean',
        'meta' => 'array',
    ];
    
    // Animation structure (same as scene default)
    // 'entrance_animation' => [
    //     'type' => 'slide',  // fade, slide, expand
    //     'direction' => 'right',  // left, right, top, bottom, center
    //     'distance' => 'nearby',  // nearby, edge (only for slide type)
    //     'duration' => 500,
    //     'easing' => 'ease-out'
    // ]
    
    // Always belongs to a scene
    public function scene(): BelongsTo;
    public function slideItems(): HasMany;
    
    // Get effective animation (use override or fall back to scene default)
    public function getEntranceAnimation(string $direction = 'forward'): array;
    public function getExitAnimation(string $direction = 'forward'): array;
    
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
  private slideAnimator: SlideAnimator;
  
  // Scene Management
  async loadScene(sceneId: string): Promise<void>;
  async unloadScene(): Promise<void>;
  
  // Slide Management (Scene-Owned)
  async navigateToSlide(slideIndex: number, direction?: 'forward' | 'reverse'): Promise<void>;
  async nextSlide(): Promise<void>;
  async previousSlide(): Promise<void>;
  getCurrentSlide(): Slide | null;
  getSlideCount(): number;
  
  // Animation (Scene-Managed)
  async animateSlideTransition(
    fromSlide: Slide | null, 
    toSlide: Slide, 
    direction: 'forward' | 'reverse'
  ): Promise<void>;
  
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

### Slide Animator (Scene-Integrated)
```typescript
// portal/src/systems/scene/SlideAnimator.ts
// Simple slide entrance/exit animations
export class SlideAnimator {
  // Animation types
  async fade(element: HTMLElement, config: AnimationConfig): Promise<void>;
  async slide(element: HTMLElement, config: AnimationConfig): Promise<void>;
  async expand(element: HTMLElement, config: AnimationConfig): Promise<void>;
  
  // Main animation method
  async animate(
    element: HTMLElement,
    animation: SlideAnimation,
    type: 'entrance' | 'exit'
  ): Promise<void>;
  
  // Get system default animation
  static getSystemDefault(): SlideAnimation;
}

// Animation configuration types
interface SlideAnimation {
  type: 'fade' | 'slide' | 'expand';
  direction?: 'left' | 'right' | 'top' | 'bottom' | 'center';
  distance?: 'nearby' | 'edge';  // For slide type
  duration: number;  // milliseconds
  easing: string;    // CSS easing function
}

interface AnimationConfig {
  direction: string;
  distance?: string;
  duration: number;
  easing: string;
}
```

## Migration Path

### Phase 1: Backend Model Enhancement
1. Add new fields to Scene model (slide_config, default_slide_animation)
2. Add animation fields to Slide model (entrance_animation, exit_animation)
3. Create database migration for new Scene and Slide fields
4. Update Scene model with slide management and animation methods
5. Update Slide model with animation override methods
6. Simplify Deck model (remove navigation, keep loading_strategy)

### Phase 2: API Updates
1. Update SceneController with slide management endpoints
2. Add scene slide navigation endpoints
3. Update Slide endpoints to enforce scene ownership
4. Update Deck endpoints to remove slide-related logic

### Phase 3: Frontend Refactoring
1. Create SlideAnimator for simple entrance/exit animations
2. Create SceneSystem that owns slide and animation logic
3. Update Navigator to delegate to SceneSystem
4. Update components to use SceneSystem instead of separate SlideSystem
5. Keep TweeningSystem for node state transitions (separate concern)

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

## Slide Animation System

### Animation Types

#### 1. **Fade**
Simple opacity transition, no directional movement.
```typescript
{
  type: 'fade',
  duration: 300,
  easing: 'ease-in-out'
}
```

#### 2. **Slide**
Content slides in from a direction.
```typescript
{
  type: 'slide',
  direction: 'right',  // left, right, top, bottom
  distance: 'edge',    // 'nearby' (50px) or 'edge' (100vw/vh)
  duration: 400,
  easing: 'ease-out'
}
```

#### 3. **Expand**
Content expands from center (or direction).
```typescript
{
  type: 'expand',
  direction: 'center',  // center, or left/right/top/bottom
  duration: 350,
  easing: 'ease-in-out'
}
```

### Animation Hierarchy (Cascade)

1. **System Default** (fallback if nothing specified)
   ```typescript
   {
     entrance: { type: 'fade', duration: 300, easing: 'ease-in' },
     exit: { type: 'fade', duration: 300, easing: 'ease-out' }
   }
   ```

2. **Scene Default** (applies to all slides in scene)
   ```typescript
   scene.default_slide_animation = {
     entrance: { type: 'slide', direction: 'right', distance: 'edge', duration: 400, easing: 'ease-out' },
     exit: { type: 'slide', direction: 'left', distance: 'edge', duration: 400, easing: 'ease-in' }
   }
   ```

3. **Slide Override** (specific to individual slide)
   ```typescript
   slide.entrance_animation = { type: 'expand', direction: 'center', duration: 500, easing: 'ease-out' }
   slide.exit_animation = null  // Use scene default
   ```

### Animation Resolution Logic

```typescript
function getSlideAnimation(slide: Slide, scene: Scene, type: 'entrance' | 'exit', direction: 'forward' | 'reverse'): SlideAnimation {
  // 1. Check slide override
  if (type === 'entrance' && slide.entrance_animation) {
    return slide.entrance_animation;
  }
  if (type === 'exit' && slide.exit_animation) {
    return slide.exit_animation;
  }
  
  // 2. Check scene default
  if (scene.default_slide_animation) {
    return scene.default_slide_animation[type];
  }
  
  // 3. Fall back to system default
  return SlideAnimator.getSystemDefault()[type];
}
```

### Direction-Aware Animations

When navigating **forward** (next slide):
- Exit current slide (typically to left)
- Enter next slide (typically from right)

When navigating **reverse** (previous slide):
- Exit current slide (typically to right)
- Enter previous slide (typically from left)

The animation configuration can be direction-aware, but starts with simple bidirectional animations.

### Example Animations

```typescript
// Professional presentation style
{
  entrance: { type: 'slide', direction: 'right', distance: 'edge', duration: 400, easing: 'ease-out' },
  exit: { type: 'fade', duration: 200, easing: 'ease-in' }
}

// Smooth fade style
{
  entrance: { type: 'fade', duration: 300, easing: 'ease-in' },
  exit: { type: 'fade', duration: 300, easing: 'ease-out' }
}

// Dynamic expand style
{
  entrance: { type: 'expand', direction: 'center', duration: 500, easing: 'ease-out' },
  exit: { type: 'slide', direction: 'top', distance: 'nearby', duration: 300, easing: 'ease-in' }
}

// Quick slide style
{
  entrance: { type: 'slide', direction: 'bottom', distance: 'nearby', duration: 250, easing: 'ease-out' },
  exit: { type: 'slide', direction: 'top', distance: 'nearby', duration: 250, easing: 'ease-in' }
}
```

## Example Usage

### Creating a Scene with Slides
```typescript
// Scene owns and manages its slides with default animations
const scene = await sceneSystem.createScene({
  name: "Introduction",
  scene_type: "card",
  slide_config: {
    auto_advance: false,
    loop: false,
    duration_per_slide: 5000
  },
  default_slide_animation: {
    entrance: { 
      type: 'slide', 
      direction: 'right', 
      distance: 'edge', 
      duration: 400, 
      easing: 'ease-out' 
    },
    exit: { 
      type: 'fade', 
      duration: 300, 
      easing: 'ease-in' 
    }
  }
});

// Add slides to the scene (uses scene default animations)
await sceneSystem.addSlide(scene.id, {
  name: "Welcome",
  slide_index: 0
  // No animation override - uses scene default
});

// This slide overrides the entrance animation
await sceneSystem.addSlide(scene.id, {
  name: "Key Points",
  slide_index: 1,
  entrance_animation: { 
    type: 'expand', 
    direction: 'center', 
    duration: 600, 
    easing: 'ease-out' 
  }
  // Exit animation not specified - uses scene default
});
```

### Navigating Within a Scene
```typescript
// Load a scene (loads all its slides)
await sceneSystem.loadScene(sceneId);

// Navigate between slides (scene handles animations)
await sceneSystem.nextSlide();       // Uses 'forward' animations
await sceneSystem.previousSlide();   // Uses 'reverse' animations
await sceneSystem.navigateToSlide(2); // Determines direction automatically

// The SceneSystem handles:
// 1. Determining the current and target slides
// 2. Resolving animations (slide override -> scene default -> system default)
// 3. Animating the exit of current slide
// 4. Animating the entrance of target slide
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

## Important Distinction: Slide Animations vs Node Tweening

### Slide Animations (SlideAnimator)
- **Purpose**: Whole-slide entrance/exit transitions
- **Scope**: Slides entering/exiting the viewport
- **Animations**: Fade, slide, expand (simple, fast)
- **Owned by**: Scene System

### Node Tweening (TweeningSystem - SEPARATE CONCERN)
- **Purpose**: Animate individual nodes/elements within a scene
- **Scope**: Node position, scale, opacity, rotation changes
- **Animations**: Complex property interpolation over time
- **Owned by**: Still exists separately, may be coordinated by Navigator

**Example**: A scene with 3 slides might have:
- Slide 1: Shows nodes A, B, C at positions X, Y, Z
- Slide 2: Shows same nodes at different positions (tweened by TweeningSystem)
- Slide 3: Different nodes entirely

When transitioning Slide 1 → Slide 2:
1. Slide 1 exits (handled by SlideAnimator)
2. Slide 2 enters (handled by SlideAnimator)
3. Nodes A, B, C animate to new positions (handled by TweeningSystem)

These are **complementary systems**, not replacements.

## Summary

This refactoring establishes **Scenes as the primary unit** with full control over their presentation, including slides and slide animations. **Decks become pure organizational containers** for loading optimization. **Navigator coordinates** between systems without managing content. **Slide animations (entrance/exit) are separate from node tweening** (position/property changes). This creates a cleaner, more maintainable architecture that matches how users conceptually think about the system.

## Next Steps

1. ✅ Document the new architecture (this document)
2. ⏳ Create database migration for Scene enhancements
3. ⏳ Update Scene model with slide management
4. ⏳ Refactor frontend: Move TweeningSystem to SceneSystem
5. ⏳ Update Navigator to delegate to SceneSystem
6. ⏳ Update Scene Authoring UI
7. ⏳ Test and validate the new architecture

