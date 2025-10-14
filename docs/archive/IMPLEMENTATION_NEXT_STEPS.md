# Implementation Next Steps - Scene-Centric Architecture

## ✅ Completed

1. **Architecture Design**
   - Scene-centric architecture documented
   - Slide animation system designed (entrance/exit only)
   - Animation framework decision (Framer Motion primary, GSAP strategic)

2. **Animation Framework**
   - ✅ Framer Motion installed in Portal
   - Consistent with Admin project
   - Ready for slide animations

3. **Initial Scene Authoring**
   - Scene Authoring page created (basic UI)
   - Scene Item API controller implemented
   - Sample data generation functions

## 🎯 Immediate Next Steps

### Phase 1: Backend Model Enhancement (PRIORITY)

#### 1.1 Database Migration - Scene Enhancements
Create migration to add slide animation fields to scenes:

```php
// api/database/migrations/YYYY_MM_DD_add_slide_animation_to_scenes.php
Schema::table('scenes', function (Blueprint $table) {
    $table->json('slide_config')->nullable()->after('style');
    $table->json('default_slide_animation')->nullable()->after('slide_config');
});
```

**Fields:**
- `slide_config`: Auto-advance, loop, duration settings
- `default_slide_animation`: Default entrance/exit animations

#### 1.2 Database Migration - Slide Enhancements
Update slides table to add animation overrides:

```php
// api/database/migrations/YYYY_MM_DD_add_animation_to_slides.php
Schema::table('slides', function (Blueprint $table) {
    $table->json('entrance_animation')->nullable()->after('transition_config');
    $table->json('exit_animation')->nullable()->after('entrance_animation');
});
```

**Fields:**
- `entrance_animation`: Override scene default entrance
- `exit_animation`: Override scene default exit

#### 1.3 Update Scene Model
Add to `api/app/Models/Scene.php`:

```php
protected $fillable = [
    // ... existing fields
    'slide_config',
    'default_slide_animation',
];

protected $casts = [
    // ... existing casts
    'slide_config' => 'array',
    'default_slide_animation' => 'array',
];

// Animation Management Methods
public function getDefaultAnimation(string $type = 'entrance'): array
{
    $defaults = $this->default_slide_animation ?? [];
    return $defaults[$type] ?? $this->getSystemDefaultAnimation($type);
}

private function getSystemDefaultAnimation(string $type): array
{
    return [
        'entrance' => [
            'type' => 'fade',
            'duration' => 300,
            'easing' => 'ease-in'
        ],
        'exit' => [
            'type' => 'fade',
            'duration' => 300,
            'easing' => 'ease-out'
        ]
    ][$type];
}

public function getSlideConfig(): array
{
    return $this->slide_config ?? [
        'auto_advance' => false,
        'loop' => false,
        'duration_per_slide' => 5000
    ];
}
```

#### 1.4 Update Slide Model
Add to `api/app/Models/Slide.php`:

```php
protected $fillable = [
    // ... existing fields
    'entrance_animation',
    'exit_animation',
];

protected $casts = [
    // ... existing casts
    'entrance_animation' => 'array',
    'exit_animation' => 'array',
];

// Get effective animation (override or scene default)
public function getEntranceAnimation(): array
{
    if ($this->entrance_animation) {
        return $this->entrance_animation;
    }
    return $this->scene->getDefaultAnimation('entrance');
}

public function getExitAnimation(): array
{
    if ($this->exit_animation) {
        return $this->exit_animation;
    }
    return $this->scene->getDefaultAnimation('exit');
}
```

### Phase 2: Frontend Scene System (NEXT)

#### 2.1 Create Slide Animation Types
File: `portal/src/systems/scene/types.ts`

```typescript
export interface SlideAnimation {
  type: 'fade' | 'slide' | 'expand';
  direction?: 'left' | 'right' | 'top' | 'bottom' | 'center';
  distance?: 'nearby' | 'edge';  // For slide type
  duration: number;  // milliseconds
  easing: string;    // CSS easing or cubic-bezier
}

export interface SlideConfig {
  auto_advance: boolean;
  loop: boolean;
  duration_per_slide: number; // milliseconds
}

export interface Scene {
  id: number;
  guid: string;
  name: string;
  slug: string;
  scene_type: string;
  slide_config?: SlideConfig;
  default_slide_animation?: {
    entrance: SlideAnimation;
    exit: SlideAnimation;
  };
  slides?: Slide[];
  // ... other fields
}

export interface Slide {
  id: number;
  scene_id: number;
  name: string;
  slide_index: number;
  entrance_animation?: SlideAnimation;
  exit_animation?: SlideAnimation;
  slide_items?: SlideItem[];
  // ... other fields
}
```

#### 2.2 Create SlideAnimator Component
File: `portal/src/systems/scene/SlideAnimator.tsx`

Uses Framer Motion for entrance/exit animations with cascade logic.

#### 2.3 Create SceneSystem Class
File: `portal/src/systems/scene/SceneSystem.ts`

Manages scene lifecycle, slide navigation, and animation orchestration.

#### 2.4 Create useScene Hook
File: `portal/src/systems/scene/useScene.ts`

React hook interface for SceneSystem.

### Phase 3: Update Scene Authoring UI

#### 3.1 Enhance Scene Creation
- Add slide_config form fields
- Add default_slide_animation editor
- Visual animation preview

#### 3.2 Slide Editor
- Override entrance/exit animations
- Visual preview of animations
- Animation presets (professional, smooth, dynamic, quick)

### Phase 4: Integration with Navigator

#### 4.1 Update Navigator Types
- Scene navigation with slide support
- Slide-aware context

#### 4.2 Navigator delegates to SceneSystem
- Scene-to-scene navigation
- Slide navigation within scene

## 📝 Implementation Order

```
Week 1: Backend Foundation
├── Day 1-2: Database migrations
├── Day 3-4: Model updates and methods
└── Day 5: API endpoint updates

Week 2: Frontend Core
├── Day 1-2: Scene System types and core logic
├── Day 3-4: SlideAnimator with Framer Motion
└── Day 5: useScene hook and integration

Week 3: UI & Integration
├── Day 1-3: Scene Authoring UI enhancements
├── Day 4-5: Navigator integration
└── Testing and refinement

Week 4: Polish & Documentation
├── Testing across scenarios
├── Performance optimization
├── Documentation updates
└── Sample scenes and demos
```

## 🎯 Success Criteria

### Backend
- [ ] Scenes have slide_config and default_slide_animation fields
- [ ] Slides have entrance_animation and exit_animation fields
- [ ] Animation cascade works (slide override → scene default → system default)
- [ ] API returns animation data correctly

### Frontend
- [ ] SlideAnimator animates slides using Framer Motion
- [ ] Fade, slide, and expand animations work correctly
- [ ] Direction-aware animations (forward/reverse)
- [ ] SceneSystem manages slide navigation
- [ ] useScene hook provides clean API

### Integration
- [ ] Scene Authoring UI allows setting animations
- [ ] Navigator properly delegates to SceneSystem
- [ ] Smooth transitions between slides
- [ ] Performance is acceptable (60fps)

### User Experience
- [ ] Animations feel natural and polished
- [ ] Easy to configure animations
- [ ] Presets available for common styles
- [ ] Preview animations before applying

## 🚀 Quick Start Commands

```bash
# Backend migrations
docker-compose exec api php artisan make:migration add_slide_animation_to_scenes
docker-compose exec api php artisan make:migration add_animation_to_slides
docker-compose exec api php artisan migrate

# Frontend development
cd portal
npm run dev

# Test scene authoring
# Navigate to http://localhost:3000 → Scene Authoring
```

## 📚 Reference Documents

- Architecture: `/docs/active-development/SCENE_CENTRIC_ARCHITECTURE.md`
- Animation Decision: `/docs/active-development/ANIMATION_FRAMEWORK_DECISION.md`
- Scene Authoring: `/portal/src/components/pages/SceneAuthoring.tsx`

## 🎨 Animation Presets to Implement

```typescript
export const ANIMATION_PRESETS = {
  professional: {
    entrance: { type: 'slide', direction: 'right', distance: 'edge', duration: 400, easing: 'ease-out' },
    exit: { type: 'fade', duration: 200, easing: 'ease-in' }
  },
  smooth: {
    entrance: { type: 'fade', duration: 300, easing: 'ease-in' },
    exit: { type: 'fade', duration: 300, easing: 'ease-out' }
  },
  dynamic: {
    entrance: { type: 'expand', direction: 'center', duration: 500, easing: 'ease-out' },
    exit: { type: 'slide', direction: 'top', distance: 'nearby', duration: 300, easing: 'ease-in' }
  },
  quick: {
    entrance: { type: 'slide', direction: 'bottom', distance: 'nearby', duration: 250, easing: 'ease-out' },
    exit: { type: 'slide', direction: 'top', distance: 'nearby', duration: 250, easing: 'ease-in' }
  }
};
```

## Next Immediate Action

**Start with Phase 1.1**: Create the database migration for Scene enhancements.

Would you like me to:
1. Create the database migrations now?
2. Start with frontend types and SlideAnimator?
3. Something else?

