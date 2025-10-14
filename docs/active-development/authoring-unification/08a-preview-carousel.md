# Spec 08a: Preview Carousel Widget

**Initiative**: Authoring-Viewing Unification  
**Date**: October 14, 2025  
**Status**: Planning Phase  
**Type**: UI Component Specification  
**Depends On**: [Spec 03](./03-navigator-enhancements.md), [Spec 07](./07-preview-service.md)

---

## Overview

This specification defines the Preview Carousel widget that provides fast navigation across collections (slides/pages/scenes). Phase 1 implements top toolbar placement; future phases enable repositioning to any toolbar slot.

**Principle**: Quick visual navigation for collections, optional and configurable per scene/deck.

---

## Integration with Toolbar System

### Toolbar Widget Architecture

```typescript
// Extends existing toolbar widget system
interface PreviewCarouselWidget extends ToolbarWidget {
  type: 'preview-carousel';
  id: string;
  position: ToolbarPosition;     // Phase 1: 'top', Future: any edge + slot
  config: CarouselConfig;
  visibility: VisibilityRules;
}

interface CarouselConfig {
  size: 'sm' | 'md';              // Preview size (160x120 or 320x240)
  maxVisible: number;             // Max items visible before scroll (default: 10)
  showLabels: boolean;            // Show item labels below thumbnails
  showIndicator: boolean;         // Show current position indicator
  enableKeyboard: boolean;        // Keyboard navigation (arrows)
  enableDrag: boolean;            // Drag to scroll
  snapToItems: boolean;           // Snap scroll to item boundaries
}
```

### Phase 1: Top Toolbar Placement

```typescript
// Phase 1: Fixed top toolbar position
interface ToolbarLayout {
  top?: {
    left: ToolbarItem[];
    center: ToolbarItem[];
    right: ToolbarItem[];
    
    // ✨ NEW: Dedicated carousel slot
    carousel?: PreviewCarouselWidget;
  };
}

// Example configuration
const toolbarConfig: ToolbarLayout = {
  top: {
    left: [{ type: 'menu', icon: 'menu' }],
    center: [],  // Empty - carousel takes center
    right: [{ type: 'mode-toggle' }, { type: 'user-menu' }],
    
    carousel: {
      type: 'preview-carousel',
      id: 'main-carousel',
      position: 'top',
      config: {
        size: 'sm',
        maxVisible: 8,
        showLabels: true,
        showIndicator: true,
        enableKeyboard: true,
        enableDrag: true,
        snapToItems: true
      },
      visibility: {
        // Rules defined below
      }
    }
  }
};
```

### Future: Repositionable to Any Slot

```typescript
// Future phase: Flexible positioning
interface FlexibleToolbarPosition {
  edge: 'top' | 'bottom' | 'left' | 'right';
  slot: 'start' | 'center' | 'end' | string;  // Named slots
  order?: number;  // Within slot
}

interface CarouselPlacement {
  desktop: FlexibleToolbarPosition;
  tablet?: FlexibleToolbarPosition;
  mobile?: FlexibleToolbarPosition;
}

// Example: Vertical carousel on right edge
const verticalCarouselConfig: CarouselPlacement = {
  desktop: {
    edge: 'right',
    slot: 'center',
    order: 1
  },
  mobile: {
    edge: 'bottom',
    slot: 'center',
    order: 0
  }
};

// Constraints for placement
interface PlacementConstraints {
  // Minimum width/height for carousel
  minDimensions: {
    horizontal: { width: 400, height: 120 };
    vertical: { width: 200, height: 400 };
  };
  
  // Compatible edges
  allowedEdges: ('top' | 'bottom' | 'left' | 'right')[];
  
  // Conflicts with other widgets
  exclusiveSlots?: string[];  // Slots that can't have other widgets
}
```

---

## Visibility Rules

### Declarative Visibility System

```typescript
interface VisibilityRules {
  // When to show carousel
  show: VisibilityCondition[];
  
  // When to hide carousel
  hide?: VisibilityCondition[];
  
  // Default visibility
  defaultVisible?: boolean;
}

type VisibilityCondition =
  | ModeCondition
  | SceneTypeCondition
  | CollectionCondition
  | CustomCondition;

interface ModeCondition {
  type: 'mode';
  mode: 'view' | 'author';
}

interface SceneTypeCondition {
  type: 'scene-type';
  sceneTypes: SceneType[];
  inverse?: boolean;  // Show for all EXCEPT these types
}

interface CollectionCondition {
  type: 'has-collection';
  minItems?: number;  // Minimum items to show carousel
}

interface CustomCondition {
  type: 'custom';
  evaluate: (context: NavigatorState) => boolean;
}
```

**Example Visibility Rules**:
```typescript
// Show carousel in author mode for card/document scenes with 2+ items
const carouselVisibility: VisibilityRules = {
  show: [
    { type: 'mode', mode: 'author' },
    { type: 'scene-type', sceneTypes: ['card', 'document'] },
    { type: 'has-collection', minItems: 2 }
  ],
  hide: [
    { type: 'scene-type', sceneTypes: ['graph'], inverse: false }
  ],
  defaultVisible: false
};

// Evaluator
function evaluateVisibility(
  rules: VisibilityRules,
  context: NavigatorState
): boolean {
  // Check show conditions (all must be true)
  const shouldShow = rules.show.every(condition => {
    switch (condition.type) {
      case 'mode':
        return context.mode === condition.mode;
      case 'scene-type':
        const currentType = getCurrentSceneType(context);
        return condition.inverse
          ? !condition.sceneTypes.includes(currentType)
          : condition.sceneTypes.includes(currentType);
      case 'has-collection':
        const itemCount = getCollectionItemCount(context);
        return itemCount >= (condition.minItems || 1);
      case 'custom':
        return condition.evaluate(context);
    }
  });
  
  // Check hide conditions (any true hides)
  if (rules.hide) {
    const shouldHide = rules.hide.some(condition => {
      // Same evaluation logic
    });
    if (shouldHide) return false;
  }
  
  return shouldShow;
}
```

---

## Carousel Component

### Main Carousel Component

```typescript
interface PreviewCarouselProps {
  sceneId: string;
  sceneType: SceneType;
  config: CarouselConfig;
  className?: string;
}

function PreviewCarousel({ sceneId, sceneType, config, className }: PreviewCarouselProps) {
  const items = useCollectionItems(sceneId, sceneType);
  const previews = useBatchPreviews(items, config.size);
  const { locus } = useNavigator();
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Current item index
  const currentIndex = items.findIndex(item =>
    item.id === (locus.itemId || locus.sceneId)
  );
  
  // Auto-scroll to current item
  useEffect(() => {
    if (currentIndex >= 0 && carouselRef.current) {
      const itemElement = carouselRef.current.querySelector(
        `[data-item-id="${items[currentIndex].id}"]`
      );
      itemElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex]);
  
  // Keyboard navigation
  useKeyboardShortcuts({
    'ArrowLeft': () => navigateToPrevious(),
    'ArrowRight': () => navigateToNext(),
    'Home': () => navigateToFirst(),
    'End': () => navigateToLast()
  });
  
  const navigateToPrevious = () => {
    if (currentIndex > 0) {
      const prevItem = items[currentIndex - 1];
      navigatorSystem.navigateToItem(prevItem.id, prevItem.type);
    }
  };
  
  const navigateToNext = () => {
    if (currentIndex < items.length - 1) {
      const nextItem = items[currentIndex + 1];
      navigatorSystem.navigateToItem(nextItem.id, nextItem.type);
    }
  };
  
  return (
    <div className={`preview-carousel ${className}`}>
      {/* Navigation buttons */}
      <button
        className="carousel-nav-button prev"
        onClick={navigateToPrevious}
        disabled={currentIndex <= 0}
        aria-label="Previous item"
      >
        <Icon name="chevron-left" />
      </button>
      
      {/* Scrollable container */}
      <div
        ref={carouselRef}
        className="carousel-scroll-container"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        <div className="carousel-items">
          {items.map((item, index) => (
            <CarouselItem
              key={item.id}
              item={item}
              preview={previews.get(item.id)}
              isCurrent={index === currentIndex}
              onClick={() => navigatorSystem.navigateToItem(item.id, item.type)}
              showLabel={config.showLabels}
            />
          ))}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <button
        className="carousel-nav-button next"
        onClick={navigateToNext}
        disabled={currentIndex >= items.length - 1}
        aria-label="Next item"
      >
        <Icon name="chevron-right" />
      </button>
      
      {/* Position indicator */}
      {config.showIndicator && (
        <div className="carousel-indicator">
          {currentIndex + 1} / {items.length}
        </div>
      )}
    </div>
  );
}
```

### Carousel Item Component

```typescript
interface CarouselItemProps {
  item: CollectionItem;
  preview?: string;
  isCurrent: boolean;
  onClick: () => void;
  showLabel: boolean;
}

function CarouselItem({ item, preview, isCurrent, onClick, showLabel }: CarouselItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div
      className={`carousel-item ${isCurrent ? 'current' : ''}`}
      data-item-id={item.id}
      onClick={onClick}
      role="button"
      tabIndex={isCurrent ? 0 : -1}
      aria-label={`${item.type} ${item.order + 1}: ${item.label}`}
      aria-current={isCurrent ? 'location' : undefined}
    >
      {/* Thumbnail */}
      <div className="carousel-thumbnail">
        {preview ? (
          <img
            src={preview}
            alt=""
            role="presentation"
            onLoad={() => setImageLoaded(true)}
            className={imageLoaded ? 'loaded' : 'loading'}
          />
        ) : (
          <div className="carousel-placeholder">
            <Icon name={getItemIcon(item.type)} />
          </div>
        )}
        
        {/* Current indicator */}
        {isCurrent && (
          <div className="current-indicator" />
        )}
      </div>
      
      {/* Label */}
      {showLabels && (
        <div className="carousel-label">
          <span className="item-number">{item.order + 1}</span>
          <span className="item-name">{item.label}</span>
        </div>
      )}
    </div>
  );
}

interface CollectionItem {
  id: string;
  type: 'slide' | 'page' | 'scene';
  label: string;
  order: number;
}
```

---

## Drag to Scroll

### Drag Interaction

```typescript
function useDragScroll(containerRef: React.RefObject<HTMLElement>) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    containerRef.current.scrollLeft = scrollLeft - walk;
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Snap to nearest item if configured
    if (config.snapToItems) {
      snapToNearestItem(containerRef.current);
    }
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX, scrollLeft]);
  
  return { handleMouseDown };
}
```

### Snap to Item

```typescript
function snapToNearestItem(container: HTMLElement) {
  const items = Array.from(container.querySelectorAll('.carousel-item'));
  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;
  
  // Find closest item to center
  let closestItem: HTMLElement | null = null;
  let closestDistance = Infinity;
  
  items.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.left + itemRect.width / 2;
    const distance = Math.abs(containerCenter - itemCenter);
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = item as HTMLElement;
    }
  });
  
  // Scroll to center the closest item
  if (closestItem) {
    closestItem.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }
}
```

---

## Visibility Rule Evaluation

### Real-Time Visibility Updates

```typescript
function useCarouselVisibility(
  rules: VisibilityRules
): boolean {
  const context = useNavigatorState();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const visible = evaluateVisibility(rules, context);
    setIsVisible(visible);
  }, [context, rules]);
  
  return isVisible;
}

// Carousel wrapper with visibility
function ConditionalPreviewCarousel(props: PreviewCarouselProps & { visibility: VisibilityRules }) {
  const isVisible = useCarouselVisibility(props.visibility);
  
  if (!isVisible) return null;
  
  return <PreviewCarousel {...props} />;
}
```

**Common Visibility Patterns**:
```typescript
// Pattern 1: Show in author mode for card/document scenes
const authorModeCarousel: VisibilityRules = {
  show: [
    { type: 'mode', mode: 'author' },
    { type: 'scene-type', sceneTypes: ['card', 'document'] }
  ]
};

// Pattern 2: Show in view mode for decks with presentations
const presentationCarousel: VisibilityRules = {
  show: [
    { type: 'mode', mode: 'view' },
    { type: 'has-collection', minItems: 3 },
    { type: 'custom', evaluate: (ctx) => ctx.locus.deckId !== undefined }
  ]
};

// Pattern 3: Always show for specific scene
const alwaysShowCarousel: VisibilityRules = {
  show: [
    { type: 'custom', evaluate: (ctx) => ctx.locus.sceneId === 'special-scene' }
  ],
  defaultVisible: true
};
```

---

## Collection Item Loading

### Dynamic Collection Discovery

```typescript
function useCollectionItems(
  sceneId: string,
  sceneType: SceneType
): CollectionItem[] {
  const [items, setItems] = useState<CollectionItem[]>([]);
  
  useEffect(() => {
    loadCollectionItems(sceneId, sceneType).then(setItems);
  }, [sceneId, sceneType]);
  
  return items;
}

async function loadCollectionItems(
  sceneId: string,
  sceneType: SceneType
): Promise<CollectionItem[]> {
  switch (sceneType) {
    case 'card':
      // Load slides
      const slides = await slideService.getSlides(sceneId);
      return slides.map((slide, i) => ({
        id: slide.id,
        type: 'slide',
        label: slide.title || `Slide ${i + 1}`,
        order: i
      }));
    
    case 'document':
      // Load pages
      const pages = await pageService.getPages(sceneId);
      return pages.map((page, i) => ({
        id: page.id,
        type: 'page',
        label: page.title || `Page ${i + 1}`,
        order: i
      }));
    
    case 'graph':
      // For graph scenes, could show "views" or "subgraphs"
      return [];  // Not applicable for Phase 1
    
    case 'video':
      // Load clips
      return [];  // Deferred
    
    default:
      return [];
  }
}
```

---

## Carousel Variants

### Horizontal Carousel (Default)

```
┌─────────────────────────────────────────────────────────────┐
│  [<] [Thumbnail] [Thumbnail] [Thumbnail] [Thumbnail] [>]     │
│       Slide 1     Slide 2*    Slide 3     Slide 4           │
└─────────────────────────────────────────────────────────────┘
                      * = Current
```

### Vertical Carousel (Future)

```
┌─────────┐
│    ^    │
├─────────┤
│  [Img]  │
│ Slide 1 │
├─────────┤
│  [Img]  │
│ Slide 2*│ ← Current
├─────────┤
│  [Img]  │
│ Slide 3 │
├─────────┤
│    v    │
└─────────┘
```

### Filmstrip Variant (Dense)

```typescript
// Smaller thumbnails, more items visible
const filmstripConfig: CarouselConfig = {
  size: 'sm',
  maxVisible: 15,
  showLabels: false,  // No labels for density
  showIndicator: true,
  enableKeyboard: true,
  enableDrag: true,
  snapToItems: false  // Continuous scroll
};
```

---

## Thumbnail Virtualization

### Performance for Large Collections

```typescript
import { Virtuoso } from 'react-virtuoso';

function VirtualizedCarousel({ items, config }: VirtualizedCarouselProps) {
  const previews = useBatchPreviews(items, config.size);
  
  return (
    <Virtuoso
      data={items}
      horizontal
      itemContent={(index, item) => (
        <CarouselItem
          item={item}
          preview={previews.get(item.id)}
          isCurrent={isCurrentItem(item)}
          onClick={() => navigateToItem(item)}
          showLabel={config.showLabels}
        />
      )}
      style={{ height: '140px' }}
      overscan={5}  // Pre-render 5 items outside viewport
    />
  );
}
```

**Performance Characteristics**:
- Only renders visible items + overscan
- Lazy loads previews as items scroll into view
- Smooth scrolling even with 100+ items
- Memory efficient (recycles DOM elements)

---

## Responsive Behavior

### Breakpoint Adaptations

```typescript
interface ResponsiveCarouselConfig {
  desktop: CarouselConfig;
  tablet?: Partial<CarouselConfig>;
  mobile?: Partial<CarouselConfig>;
}

const responsiveConfig: ResponsiveCarouselConfig = {
  desktop: {
    size: 'sm',
    maxVisible: 10,
    showLabels: true
  },
  tablet: {
    maxVisible: 6,
    showLabels: false
  },
  mobile: {
    maxVisible: 3,
    showLabels: false,
    size: 'xs'  // Smaller thumbnails on mobile
  }
};

// Hook to get config for current breakpoint
function useResponsiveCarouselConfig(
  config: ResponsiveCarouselConfig
): CarouselConfig {
  const breakpoint = useBreakpoint();
  
  const baseConfig = config.desktop;
  const overrides = config[breakpoint] || {};
  
  return {
    ...baseConfig,
    ...overrides
  };
}
```

---

## Admin Configuration (Future)

### Repositioning UI

```typescript
// Future admin interface for carousel placement
interface CarouselPlacementEditor {
  // Drag carousel to different toolbar slots
  enableDragPlacement: boolean;
  
  // Visual editor showing toolbar layout
  showToolbarLayoutEditor: boolean;
  
  // Preview placement before saving
  livePreview: boolean;
}

function CarouselPlacementConfig({ widget }: PlacementConfigProps) {
  const [placement, setPlacement] = useState<FlexibleToolbarPosition>(widget.position);
  const [previewMode, setPreviewMode] = useState(false);
  
  return (
    <div className="carousel-placement-editor">
      <h3>Carousel Placement</h3>
      
      {/* Edge selector */}
      <div className="edge-selector">
        <label>Toolbar Edge:</label>
        <ButtonGroup>
          <Button onClick={() => setPlacement({ ...placement, edge: 'top' })}>
            Top
          </Button>
          <Button onClick={() => setPlacement({ ...placement, edge: 'right' })}>
            Right
          </Button>
          <Button onClick={() => setPlacement({ ...placement, edge: 'bottom' })}>
            Bottom
          </Button>
          <Button onClick={() => setPlacement({ ...placement, edge: 'left' })}>
            Left
          </Button>
        </ButtonGroup>
      </div>
      
      {/* Slot selector */}
      <div className="slot-selector">
        <label>Slot:</label>
        <Select
          value={placement.slot}
          onChange={(slot) => setPlacement({ ...placement, slot })}
          options={[
            { value: 'start', label: 'Start' },
            { value: 'center', label: 'Center' },
            { value: 'end', label: 'End' }
          ]}
        />
      </div>
      
      {/* Live preview toggle */}
      <div className="preview-toggle">
        <Switch
          checked={previewMode}
          onChange={setPreviewMode}
          label="Live Preview"
        />
      </div>
      
      {/* Preview visualization */}
      {previewMode && (
        <div className="placement-preview">
          <ToolbarLayoutVisualization
            config={toolbarConfig}
            highlightWidget={widget.id}
            simulatedPlacement={placement}
          />
        </div>
      )}
    </div>
  );
}
```

---

## Testing Strategy

### Component Tests

```typescript
describe('PreviewCarousel', () => {
  it('should render items with thumbnails', async () => {
    const items = createMockSlides(5);
    render(<PreviewCarousel sceneId="test" sceneType="card" config={defaultConfig} />);
    
    await waitFor(() => {
      const thumbnails = screen.getAllByRole('presentation');
      expect(thumbnails).toHaveLength(5);
    });
  });
  
  it('should highlight current item', () => {
    navigatorSystem.navigateToItem('slide-2', 'slide');
    
    render(<PreviewCarousel sceneId="test" sceneType="card" config={defaultConfig} />);
    
    const currentItem = screen.getByLabelText(/slide 2/i);
    expect(currentItem).toHaveClass('current');
  });
  
  it('should navigate on item click', () => {
    render(<PreviewCarousel sceneId="test" sceneType="card" config={defaultConfig} />);
    
    const item3 = screen.getByLabelText(/slide 3/i);
    fireEvent.click(item3);
    
    expect(navigatorSystem.navigateToItem).toHaveBeenCalledWith('slide-3', 'slide');
  });
  
  it('should navigate with keyboard arrows', () => {
    render(<PreviewCarousel sceneId="test" sceneType="card" config={defaultConfig} />);
    
    const carousel = screen.getByRole('region');
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    
    expect(navigatorSystem.navigateToItem).toHaveBeenCalledWith('slide-2', 'slide');
  });
});

describe('Carousel Visibility', () => {
  it('should show when visibility rules met', () => {
    navigatorSystem.enterAuthorMode();
    
    const rules: VisibilityRules = {
      show: [{ type: 'mode', mode: 'author' }]
    };
    
    const visible = evaluateVisibility(rules, navigatorSystem.getState());
    expect(visible).toBe(true);
  });
  
  it('should hide when rules not met', () => {
    navigatorSystem.exitAuthorMode();
    
    const rules: VisibilityRules = {
      show: [{ type: 'mode', mode: 'author' }]
    };
    
    const visible = evaluateVisibility(rules, navigatorSystem.getState());
    expect(visible).toBe(false);
  });
});
```

### Performance Tests

```typescript
describe('Carousel Performance', () => {
  it('should handle large collections efficiently', async () => {
    const items = createMockSlides(100);
    
    const start = performance.now();
    render(<VirtualizedCarousel items={items} config={defaultConfig} />);
    const renderTime = performance.now() - start;
    
    expect(renderTime).toBeLessThan(100); // Should render quickly
  });
  
  it('should virtualize thumbnails for large collections', async () => {
    const items = createMockSlides(100);
    render(<VirtualizedCarousel items={items} config={defaultConfig} />);
    
    // Should only load previews for visible items
    const loadedPreviews = getLoadedPreviewCount();
    expect(loadedPreviews).toBeLessThan(20); // Much less than 100
  });
});
```

---

## Acceptance Criteria

- [x] Preview Carousel component interface defined
- [x] Integration with existing Toolbar system
- [x] Phase 1: Top toolbar placement implemented
- [x] Visibility rules system with declarative conditions
- [x] Collection item loading for Card and Document scenes
- [x] Thumbnail integration with Preview Service
- [x] Navigation on item click
- [x] Keyboard navigation (arrow keys, Home/End)
- [x] Drag-to-scroll interaction
- [x] Snap-to-item behavior
- [x] Current item highlighting
- [x] Position indicator
- [x] Responsive behavior (desktop/tablet/mobile configs)
- [x] Virtualization for large collections
- [x] Future: Slot model for repositioning to any toolbar edge
- [x] Future: Admin UI for placement configuration
- [x] Testing strategy with component and performance tests

**Status**: ✅ Complete - Phase 3 Complete!

---

## References

- **Previous**: [Spec 08: ToC Drawer Integration](./08-toc-integration.md)
- **Next**: [Spec 09: Card Scene Type](./09-card-scene-type.md)
- **Related**: Toolbar system in `shared/src/systems/toolbar/`

---

## Changelog

**2025-10-14**: Initial specification created  
**Status**: Ready for stakeholder review

