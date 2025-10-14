# Spec 06: Selection & Highlighting Strategies

**Initiative**: Authoring-Viewing Unification  
**Date**: October 14, 2025  
**Status**: Planning Phase  
**Type**: Interaction System Specification  
**Depends On**: [Spec 04](./04-authoring-overlay.md), [Spec 05](./05-context-menu.md)

---

## Overview

This specification defines visual strategies for selection highlighting across scene types. Strategies integrate with Protogen's existing theme system and adapt to busy backgrounds for maximum visibility.

**Principle**: Selection feedback must be immediately visible without obscuring content.

---

## Integration with Theme System

### Using Existing Theme Tokens

Protogen's theme system (`docs/THEME_SYSTEM.md`) provides tokens:

```typescript
// Extend existing theme with selection tokens
interface ThemeTokens {
  // Existing tokens...
  
  // ✨ NEW: Selection tokens
  selection: {
    primary: string;        // Main selection color
    secondary: string;      // Multi-select color
    ghost: string;          // Ghost/preview color
    hover: string;          // Hover state color
    active: string;         // Active/dragging color
  };
  
  highlight: {
    borderWidth: number;    // Selection border thickness
    glowSize: number;       // Glow effect radius
    opacity: number;        // Base opacity
    animation: string;      // Animation timing function
  };
}

// Default theme values
const defaultSelectionTheme = {
  selection: {
    primary: '#3b82f6',     // Blue-500
    secondary: '#8b5cf6',   // Purple-500
    ghost: '#6b7280',       // Gray-500
    hover: '#60a5fa',       // Blue-400
    active: '#2563eb'       // Blue-600
  },
  highlight: {
    borderWidth: 2,
    glowSize: 4,
    opacity: 0.8,
    animation: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};
```

---

## Scene-Type Specific Strategies

### Card Scene Highlighting

**Challenge**: Background images may clash with selection borders

**Strategy**: Multi-layer approach with automatic contrast

```typescript
interface CardHighlightStrategy {
  // Text element highlighting
  highlightText: {
    type: 'outline',
    color: 'var(--selection-primary)',
    width: 2,
    offset: 4,
    style: 'solid',
    glow: true,         // Add subtle box-shadow
    glowColor: 'rgba(59, 130, 246, 0.3)',
    glowSize: 8
  };
  
  // Image element highlighting
  highlightImage: {
    type: 'overlay',
    color: 'var(--selection-primary)',
    opacity: 0.2,       // Semi-transparent veil
    border: {
      color: 'var(--selection-primary)',
      width: 3,
      style: 'solid'
    },
    dimBackground: true,  // Darken non-selected areas
    dimOpacity: 0.5
  };
  
  // Layered slide highlighting
  highlightLayered: {
    type: 'compound',
    layers: [
      {
        target: 'background',
        effect: 'dim',
        opacity: 0.7
      },
      {
        target: 'text',
        effect: 'outline',
        color: 'var(--selection-primary)',
        width: 2
      }
    ]
  };
}
```

**Implementation**:
```typescript
function CardSelectionHighlight({ target, theme }: SelectionHighlightProps) {
  const { kind } = target.metadata;
  
  if (kind === 'text') {
    return (
      <div
        className="selection-highlight text-highlight"
        style={{
          position: 'absolute',
          left: target.bounds.left - 4,
          top: target.bounds.top - 4,
          width: target.bounds.width + 8,
          height: target.bounds.height + 8,
          border: `2px solid ${theme.selection.primary}`,
          borderRadius: '4px',
          boxShadow: `0 0 8px rgba(59, 130, 246, 0.3)`,
          pointerEvents: 'none',
          zIndex: 9998
        }}
      />
    );
  }
  
  if (kind === 'image') {
    return (
      <>
        {/* Dim overlay */}
        <div
          className="selection-dim"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'black',
            opacity: 0.5,
            pointerEvents: 'none',
            zIndex: 9997
          }}
        />
        
        {/* Selection overlay on image */}
        <div
          className="selection-highlight image-highlight"
          style={{
            position: 'absolute',
            left: target.bounds.left,
            top: target.bounds.top,
            width: target.bounds.width,
            height: target.bounds.height,
            backgroundColor: `rgba(59, 130, 246, 0.2)`,
            border: `3px solid ${theme.selection.primary}`,
            pointerEvents: 'none',
            zIndex: 9998
          }}
        />
      </>
    );
  }
  
  return null;
}
```

---

### Document Scene Highlighting

**Challenge**: Rich text with varied styling requires subtle highlighting

**Strategy**: Light outline with text range support

```typescript
interface DocumentHighlightStrategy {
  // Block element highlighting
  highlightBlock: {
    type: 'outline',
    color: 'var(--selection-primary)',
    width: 1,
    style: 'dashed',
    offset: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.05)'  // Very subtle green tint
  };
  
  // Text range highlighting (browser selection)
  highlightText: {
    type: 'native-selection',  // Use browser's ::selection
    backgroundColor: 'var(--selection-primary)',
    color: 'white',
    opacity: 0.3
  };
  
  // Page highlighting
  highlightPage: {
    type: 'indicator',  // Corner indicator, not full outline
    position: 'top-left',
    color: 'var(--selection-primary)',
    size: 24
  };
}
```

**Implementation**:
```typescript
function DocumentSelectionHighlight({ target, theme }: SelectionHighlightProps) {
  if (target.targetType === 'block') {
    return (
      <div
        className="selection-highlight block-highlight"
        style={{
          position: 'absolute',
          left: target.bounds.left - 2,
          top: target.bounds.top - 2,
          width: target.bounds.width + 4,
          height: target.bounds.height + 4,
          border: `1px dashed ${theme.selection.primary}`,
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          borderRadius: '2px',
          pointerEvents: 'none',
          zIndex: 9998
        }}
      />
    );
  }
  
  if (target.targetType === 'text') {
    // Use browser's native selection styling
    // Apply via CSS ::selection pseudo-element
    return (
      <style>{`
        .document-scene ::selection {
          background-color: ${theme.selection.primary};
          color: white;
          opacity: 0.3;
        }
      `}</style>
    );
  }
  
  if (target.targetType === 'page') {
    // Corner indicator for page selection
    return (
      <div
        className="selection-indicator page-indicator"
        style={{
          position: 'absolute',
          left: target.bounds.left,
          top: target.bounds.top,
          width: 24,
          height: 24,
          backgroundColor: theme.selection.primary,
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          pointerEvents: 'none',
          zIndex: 9998
        }}
      />
    );
  }
  
  return null;
}
```

---

### Graph Scene Highlighting (Stub)

**Challenge**: Node and edge selection in complex graph layouts

**Strategy Considerations** (for design workshop):

```typescript
interface GraphHighlightStrategy {
  // Node highlighting options
  highlightNode: {
    // Option A: Glow effect
    glowOption: {
      type: 'glow',
      color: 'var(--selection-primary)',
      size: 8,
      pulseAnimation: true
    };
    
    // Option B: Ring around node
    ringOption: {
      type: 'ring',
      color: 'var(--selection-primary)',
      width: 3,
      offset: 4
    };
    
    // Option C: Color overlay
    overlayOption: {
      type: 'color-overlay',
      color: 'var(--selection-primary)',
      opacity: 0.3,
      preserveLabel: true
    };
  };
  
  // Edge highlighting options
  highlightEdge: {
    // Option A: Thicken edge
    thickenOption: {
      type: 'thicken',
      multiplier: 2.5,
      color: 'var(--selection-primary)'
    };
    
    // Option B: Parallel highlight line
    parallelOption: {
      type: 'parallel',
      offset: 3,
      color: 'var(--selection-primary)',
      width: 2
    };
  };
  
  // Multi-selection highlighting
  multiSelect: {
    nodeColor: 'var(--selection-secondary)',
    edgeColor: 'var(--selection-secondary)',
    showCount: true
  };
}

// Note: Final strategy TBD in Spec 11 (Graph Planning Stub)
```

---

### Video Scene Highlighting (Deferred Stub)

**Strategy Placeholder**:

```typescript
interface VideoHighlightStrategy {
  // Clip highlighting in timeline
  highlightClip: {
    type: 'timeline-bar',
    color: 'var(--selection-primary)',
    height: 6,
    position: 'bottom'
  };
  
  // Current frame highlighting
  highlightFrame: {
    type: 'border',
    color: 'var(--selection-primary)',
    width: 2,
    corners: true  // Highlighted corners only
  };
}

// Note: Deferred to Spec 12 (Video Deferred Stub)
```

---

## Adaptive Highlighting

### Contrast Detection

**Problem**: Selection may be invisible on similarly colored backgrounds

**Solution**: Automatic contrast adjustment

```typescript
class ContrastDetector {
  // Detect background luminance
  getBackgroundLuminance(element: HTMLElement): number {
    const bgColor = getComputedStyle(element).backgroundColor;
    const rgb = this.parseRGB(bgColor);
    
    // Calculate relative luminance (WCAG formula)
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  
  // Choose selection color with sufficient contrast
  getSelectionColor(background: HTMLElement, defaultColor: string): string {
    const luminance = this.getBackgroundLuminance(background);
    
    if (luminance > 0.5) {
      // Light background → use darker selection
      return '#1e40af';  // Blue-800
    } else {
      // Dark background → use lighter selection
      return '#60a5fa';  // Blue-400
    }
  }
  
  // Check if additional glow needed
  needsGlow(background: HTMLElement): boolean {
    const luminance = this.getBackgroundLuminance(background);
    return luminance > 0.3 && luminance < 0.7;  // Mid-tone backgrounds
  }
}
```

**Usage**:
```typescript
function AdaptiveSelectionHighlight({ target, theme }: SelectionHighlightProps) {
  const backgroundElement = target.element.parentElement;
  const selectionColor = contrastDetector.getSelectionColor(
    backgroundElement,
    theme.selection.primary
  );
  const needsGlow = contrastDetector.needsGlow(backgroundElement);
  
  return (
    <div
      className="selection-highlight"
      style={{
        border: `2px solid ${selectionColor}`,
        boxShadow: needsGlow
          ? `0 0 8px ${selectionColor}`
          : 'none'
      }}
    />
  );
}
```

---

## Hover States

### Hover Feedback (Before Selection)

```typescript
interface HoverStrategy {
  card: {
    type: 'subtle-outline',
    color: 'var(--selection-hover)',
    width: 1,
    opacity: 0.5,
    transitionDuration: 150  // ms
  };
  
  document: {
    type: 'background-tint',
    color: 'var(--selection-hover)',
    opacity: 0.05,
    transitionDuration: 100
  };
  
  graph: {
    type: 'scale-up',
    scaleFactor: 1.1,
    transitionDuration: 200
  };
}
```

**Implementation**:
```typescript
function HoverHighlight({ target, sceneType }: HoverHighlightProps) {
  const strategy = getHoverStrategy(sceneType);
  
  if (strategy.type === 'subtle-outline') {
    return (
      <div
        className="hover-highlight"
        style={{
          position: 'absolute',
          inset: 0,
          border: `${strategy.width}px solid ${strategy.color}`,
          opacity: strategy.opacity,
          transition: `all ${strategy.transitionDuration}ms ease`,
          pointerEvents: 'none'
        }}
      />
    );
  }
  
  if (strategy.type === 'background-tint') {
    return (
      <div
        className="hover-tint"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: strategy.color,
          opacity: strategy.opacity,
          transition: `opacity ${strategy.transitionDuration}ms ease`,
          pointerEvents: 'none'
        }}
      />
    );
  }
  
  return null;
}
```

---

## Multi-Selection Visual Differentiation

### Primary vs Secondary Selection

```typescript
interface MultiSelectionStrategy {
  // First selected (primary)
  primary: {
    color: 'var(--selection-primary)',
    width: 2,
    style: 'solid',
    zIndex: 9999
  };
  
  // Additional selections (secondary)
  secondary: {
    color: 'var(--selection-secondary)',
    width: 2,
    style: 'dashed',
    opacity: 0.6,
    zIndex: 9998
  };
  
  // Count indicator
  showCount: boolean;
  countPosition: 'top-right' | 'top-left';
}
```

**Implementation**:
```typescript
function MultiSelectionHighlight({ selections }: MultiSelectionHighlightProps) {
  const [primary, ...secondary] = selections;
  
  return (
    <>
      {/* Primary selection */}
      <SelectionHighlight
        target={primary}
        variant="primary"
      />
      
      {/* Secondary selections */}
      {secondary.map(selection => (
        <SelectionHighlight
          key={selection.targetId}
          target={selection}
          variant="secondary"
        />
      ))}
      
      {/* Selection count badge */}
      {selections.length > 1 && (
        <div className="selection-count-badge">
          {selections.length} selected
        </div>
      )}
    </>
  );
}
```

---

## Animation & Transitions

### Selection Animation

```typescript
interface SelectionAnimation {
  // Appear animation
  appear: {
    duration: 150,
    easing: 'ease-out',
    keyframes: [
      { opacity: 0, transform: 'scale(0.95)' },
      { opacity: 1, transform: 'scale(1)' }
    ]
  };
  
  // Disappear animation
  disappear: {
    duration: 100,
    easing: 'ease-in',
    keyframes: [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.98)' }
    ]
  };
  
  // Pulse animation (for attention)
  pulse: {
    duration: 1000,
    easing: 'ease-in-out',
    iterationCount: 3,
    keyframes: [
      { opacity: 0.8, transform: 'scale(1)' },
      { opacity: 1, transform: 'scale(1.02)' },
      { opacity: 0.8, transform: 'scale(1)' }
    ]
  };
}
```

**CSS Implementation**:
```css
@keyframes selection-appear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes selection-pulse {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

.selection-highlight {
  animation: selection-appear 150ms ease-out;
}

.selection-highlight[data-attention="true"] {
  animation: selection-pulse 1s ease-in-out 3;
}
```

---

## Busy Background Strategies

### Automatic Fallback

**When**: Background image or gradient with high complexity

**Strategy**: Enhanced visibility techniques

```typescript
interface BusyBackgroundStrategy {
  // Detection
  detectBusy(element: HTMLElement): boolean;
  
  // Fallback strategies
  strategies: {
    // Add white backing behind border
    whiteOutline: {
      innerBorder: '2px solid white',
      outerBorder: '2px solid var(--selection-primary)',
      totalWidth: 4
    };
    
    // Use drop shadow
    dropShadow: {
      shadow: '0 0 0 2px white, 0 0 0 4px var(--selection-primary)',
      blur: 4
    };
    
    // Invert colors in selection area
    invertArea: {
      mixBlendMode: 'difference',
      color: 'white'
    };
  };
}
```

**Implementation**:
```typescript
function SmartSelectionHighlight({ target, theme }: SelectionHighlightProps) {
  const isBusy = busyBackgroundDetector.detectBusy(target.element);
  
  if (isBusy) {
    // Use enhanced visibility strategy
    return (
      <div
        className="selection-highlight busy-background"
        style={{
          position: 'absolute',
          left: target.bounds.left - 4,
          top: target.bounds.top - 4,
          width: target.bounds.width + 8,
          height: target.bounds.height + 8,
          // Double border technique
          boxShadow: `
            0 0 0 2px white,
            0 0 0 4px ${theme.selection.primary}
          `,
          borderRadius: '4px',
          pointerEvents: 'none',
          zIndex: 9999
        }}
      />
    );
  }
  
  // Standard selection for simple backgrounds
  return <StandardSelectionHighlight target={target} theme={theme} />;
}
```

---

## Ghost Elements (Drag Preview)

### Ghost Visual Strategy

```typescript
interface GhostStrategy {
  opacity: number;        // 0.5 typical
  scale: number;          // 0.9 (slightly smaller)
  offset: { x: number; y: number };  // Offset from cursor
  showOriginal: boolean;  // Dim original while dragging
  preserveStyle: boolean; // Keep original styling
}

function DragGhost({ target, cursorPosition }: DragGhostProps) {
  const ghostRef = useRef<HTMLDivElement>(null);
  
  // Follow cursor
  useEffect(() => {
    if (!ghostRef.current) return;
    
    const updatePosition = (e: MouseEvent) => {
      ghostRef.current!.style.left = `${e.clientX + 10}px`;
      ghostRef.current!.style.top = `${e.clientY + 10}px`;
    };
    
    document.addEventListener('mousemove', updatePosition);
    return () => document.removeEventListener('mousemove', updatePosition);
  }, []);
  
  return (
    <div
      ref={ghostRef}
      className="drag-ghost"
      style={{
        position: 'fixed',
        opacity: 0.5,
        transform: 'scale(0.9)',
        pointerEvents: 'none',
        zIndex: 10000,
        transition: 'transform 100ms ease'
      }}
    >
      {/* Clone of selected element */}
      {cloneElement(target)}
    </div>
  );
}
```

---

## Theme Customization

### Custom Highlight Themes

```typescript
// Allow scene-specific highlight themes
interface SceneHighlightTheme {
  sceneId: string;
  overrides: {
    selection?: {
      primary?: string;
      secondary?: string;
      hover?: string;
    };
    highlight?: {
      borderWidth?: number;
      glowSize?: number;
      opacity?: number;
    };
  };
}

// Apply custom theme
function applyHighlightTheme(sceneId: string): ThemeTokens {
  const customTheme = getSceneHighlightTheme(sceneId);
  const baseTheme = getBaseTheme();
  
  return {
    ...baseTheme,
    selection: {
      ...baseTheme.selection,
      ...customTheme?.overrides.selection
    },
    highlight: {
      ...baseTheme.highlight,
      ...customTheme?.overrides.highlight
    }
  };
}
```

---

## Accessibility

### High Contrast Mode Support

```typescript
// Detect high contrast mode
function detectHighContrast(): boolean {
  const testElement = document.createElement('div');
  testElement.style.borderColor = 'rgb(0, 128, 0)';
  document.body.appendChild(testElement);
  
  const computed = window.getComputedStyle(testElement);
  const isHighContrast = computed.borderColor !== 'rgb(0, 128, 0)';
  
  document.body.removeChild(testElement);
  return isHighContrast;
}

// Adjust highlighting for high contrast
function getHighContrastStyle(): SelectionStyle {
  return {
    borderWidth: 3,           // Thicker borders
    borderStyle: 'solid',
    borderColor: 'currentColor',  // Use system colors
    glowSize: 0,              // No glow effects
    opacity: 1                // Full opacity
  };
}
```

### Screen Reader Announcements

```typescript
// Announce selection to screen readers
function announceSelection(target: SelectionState) {
  const message = formatSelectionMessage(target);
  
  // Use ARIA live region
  const liveRegion = document.getElementById('aria-live-announcements');
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}

function formatSelectionMessage(target: SelectionState): string {
  switch (target.targetType) {
    case 'slide':
      return `Slide ${target.metadata.order} selected. ${target.metadata.kind} slide.`;
    case 'block':
      return `Block ${target.metadata.blockType} selected.`;
    case 'page':
      return `Page ${target.metadata.pageNumber} selected.`;
    default:
      return `${target.targetType} selected.`;
  }
}
```

---

## Testing Strategy

### Visual Regression Tests

```typescript
describe('Selection Highlighting Visual Tests', () => {
  it('should render text selection correctly', async () => {
    const { container } = render(
      <CardScene sceneId="test" mode="author" />
    );
    
    // Select text slide
    const slide = screen.getByTestId('slide-text-1');
    fireEvent.click(slide);
    
    // Capture screenshot
    const screenshot = await captureScreenshot(container);
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: 'card-text-selection'
    });
  });
  
  it('should adapt to busy backgrounds', async () => {
    const { container } = render(
      <CardScene sceneId="busy-bg-scene" mode="author" />
    );
    
    // Select element on busy background
    fireEvent.click(screen.getByTestId('slide-on-busy-bg'));
    
    const screenshot = await captureScreenshot(container);
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: 'busy-background-selection'
    });
  });
});
```

### Contrast Tests

```typescript
describe('Contrast Detection', () => {
  it('should choose dark selection for light background', () => {
    const lightBg = createElementWithBg('#ffffff');
    const color = contrastDetector.getSelectionColor(lightBg, '#3b82f6');
    
    expect(color).toBe('#1e40af');  // Darker blue
  });
  
  it('should choose light selection for dark background', () => {
    const darkBg = createElementWithBg('#000000');
    const color = contrastDetector.getSelectionColor(darkBg, '#3b82f6');
    
    expect(color).toBe('#60a5fa');  // Lighter blue
  });
  
  it('should add glow for mid-tone backgrounds', () => {
    const midBg = createElementWithBg('#808080');
    const needsGlow = contrastDetector.needsGlow(midBg);
    
    expect(needsGlow).toBe(true);
  });
});
```

### Accessibility Tests

```typescript
describe('Selection Accessibility', () => {
  it('should announce selection to screen readers', () => {
    const liveRegion = document.getElementById('aria-live-announcements');
    
    selectionEngine.select({ targetType: 'slide', targetId: '1', metadata: { order: 1, kind: 'text' } });
    
    expect(liveRegion?.textContent).toContain('Slide 1 selected');
  });
  
  it('should support high contrast mode', () => {
    mockHighContrastMode(true);
    
    const style = getHighContrastStyle();
    
    expect(style.borderWidth).toBe(3);
    expect(style.borderColor).toBe('currentColor');
  });
});
```

---

## Wireframes & Examples

### Card Scene Selection States

```
┌────────────────────────────────────────┐
│  Card Scene (Author Mode)              │
├────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Slide 1 (Selected)              │  │ ← Blue solid outline (2px)
│  │                                   │  │   + Subtle glow
│  │  "Welcome to Protogen"            │  │
│  │                                   │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Slide 2 (Hover)                 │  │ ← Light blue outline (1px)
│  │                                   │  │   50% opacity
│  │  [Background Image]               │  │
│  │                                   │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Slide 3 (Not Selected)          │  │ ← No outline
│  │                                   │  │
│  │  "Learn More"                     │  │
│  │                                   │  │
│  └──────────────────────────────────┘  │
│                                         │
└────────────────────────────────────────┘
```

### Document Scene Selection States

```
┌────────────────────────────────────────┐
│  Document Scene (Author Mode)          │
├────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  # Heading 1 (Selected Block)    │  │ ← Dashed outline (1px)
│  │                                   │  │   + Light green tint
│  └──────────────────────────────────┘  │
│                                         │
│  Paragraph text with some content...   │
│  │                                      │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  > Blockquote                     │  │ ← Not selected
│  └──────────────────────────────────┘  │
│                                         │
└────────────────────────────────────────┘

Text Selection (when selecting text range):
Uses browser's native ::selection styling
  background: blue (30% opacity)
  color: white
```

---

## Acceptance Criteria

- [x] Card scene highlighting strategy defined (text, image, layered)
- [x] Document scene highlighting strategy defined (block, text, page)
- [x] Graph scene highlighting options outlined (for design workshop)
- [x] Video scene highlighting stubbed (deferred)
- [x] Theme integration with existing theme system
- [x] Contrast detection for busy backgrounds
- [x] Hover states defined
- [x] Multi-selection visual differentiation
- [x] Animation and transitions specified
- [x] Adaptive strategies for different backgrounds
- [x] Accessibility features (high contrast, screen readers)
- [x] Wireframes and visual examples
- [x] Testing strategy with visual regression tests

**Status**: ✅ Complete - Ready for Spec 07

---

## References

- **Previous**: [Spec 05: Context Menu System](./05-context-menu.md)
- **Next**: [Spec 07: Preview Service Specification](./07-preview-service.md)
- **Related**: Theme system in `docs/THEME_SYSTEM.md`

---

## Changelog

**2025-10-14**: Initial specification created  
**Status**: Ready for stakeholder review

