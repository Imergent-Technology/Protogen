# Spec 15: QA & Accessibility Strategy

**Initiative**: Authoring-Viewing Unification  
**Date**: October 14, 2025  
**Status**: Planning Phase  
**Type**: Quality Assurance Specification  
**Depends On**: All previous specs (00-14)

---

## Overview

This specification defines the quality assurance and accessibility strategy for authoring features, ensuring WCAG 2.1 AA compliance, comprehensive test coverage, and consistent with Protogen's existing standards.

**Principle**: A11y and testing are not afterthoughts—they're integrated from the start.

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Target**: Meet all Level A and AA success criteria

### Key Requirements by Category

#### 1. Perceivable

**1.1 Text Alternatives**:
- [ ] All images have alt text or aria-label
- [ ] Decorative images marked with alt=""
- [ ] Icon buttons have aria-label

**1.3 Adaptable**:
- [ ] Content structure uses semantic HTML
- [ ] Headings in logical order (h1 → h2 → h3)
- [ ] Lists use proper list markup
- [ ] Form inputs have associated labels

**1.4 Distinguishable**:
- [ ] Color contrast >= 4.5:1 for text
- [ ] Color contrast >= 3:1 for UI components
- [ ] Text resizable up to 200% without loss of functionality
- [ ] No information conveyed by color alone

#### 2. Operable

**2.1 Keyboard Accessible**:
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Skip links for navigation
- [ ] Focus order follows reading order

**2.2 Enough Time**:
- [ ] No time limits on editing
- [ ] Auto-save doesn't interrupt user
- [ ] Warnings before session timeout

**2.3 Seizures and Physical Reactions**:
- [ ] No flashing content > 3 times/second
- [ ] Animation can be disabled (prefers-reduced-motion)

**2.4 Navigable**:
- [ ] Page titles describe current location
- [ ] Focus visible at all times
- [ ] Multiple ways to navigate (ToC, breadcrumbs, search)
- [ ] Current location indicated

**2.5 Input Modalities**:
- [ ] Touch targets >= 44×44 pixels
- [ ] Pointer gestures have single-pointer alternative
- [ ] Drag operations have keyboard alternative

#### 3. Understandable

**3.1 Readable**:
- [ ] Language of page specified
- [ ] Unusual words/jargon explained

**3.2 Predictable**:
- [ ] Navigation consistent across pages/scenes
- [ ] Components behave predictably
- [ ] No context changes on focus

**3.3 Input Assistance**:
- [ ] Error messages clear and specific
- [ ] Labels/instructions for user input
- [ ] Error prevention (confirmation dialogs)

#### 4. Robust

**4.1 Compatible**:
- [ ] Valid HTML
- [ ] ARIA used correctly
- [ ] Tested with screen readers

---

## Keyboard Navigation Coverage

### Global Shortcuts

| Shortcut | Action | Component | A11y Notes |
|----------|--------|-----------|------------|
| `Cmd/Ctrl + E` | Toggle edit mode | Navigator | Announced to screen readers |
| `Escape` | Exit/Cancel | Global | Closes dialogs, cancels edits |
| `Tab` | Next focusable | Global | Focus indicator visible |
| `Shift + Tab` | Previous focusable | Global | Focus indicator visible |
| `/` or `Ctrl+F` | Search | ToC | Focus search input |
| `?` | Keyboard shortcuts | Help Dialog | Show shortcut reference |

### ToC Navigation

| Shortcut | Action | A11y Notes |
|----------|--------|------------|
| `↑` / `↓` | Previous/Next item | ARIA tree navigation |
| `←` / `→` | Collapse/Expand | ARIA expanded state |
| `Enter` | Navigate to item | Announced destination |
| `Home` / `End` | First/Last item | Position announced |
| `Space` | Toggle expand | Same as →/← |

### Carousel Navigation

| Shortcut | Action | A11y Notes |
|----------|--------|------------|
| `←` / `→` | Previous/Next item | Position announced |
| `Home` / `End` | First/Last item | Boundary announced |
| `Enter` or `Space` | Navigate to focused item | Destination announced |

### Authoring Actions

| Shortcut | Action | A11y Notes |
|----------|--------|------------|
| `Enter` | Start edit | Edit mode announced |
| `Ctrl/Cmd + S` | Save | Save confirmed |
| `Delete` or `Backspace` | Remove selected | Confirmation required |
| `Ctrl/Cmd + Z` | Undo | Action announced |
| `Ctrl/Cmd + Shift + Z` | Redo | Action announced |
| `Ctrl/Cmd + D` | Duplicate | New item announced |
| `Ctrl/Cmd + A` | Select all | Selection count announced |

---

## ARIA Roles and Attributes

### ToC Component

```typescript
<div
  role="tree"
  aria-label="Table of contents"
  aria-multiselectable="false"
>
  <div
    role="treeitem"
    aria-level={level}
    aria-setsize={siblingCount}
    aria-posinset={order + 1}
    aria-expanded={hasChildren ? expanded : undefined}
    aria-selected={selected}
    aria-current={isCurrent ? 'location' : undefined}
  >
    {label}
  </div>
</div>
```

### Context Menu

```typescript
<div
  role="menu"
  aria-label="Context actions"
  aria-orientation="vertical"
>
  <button
    role="menuitem"
    tabIndex={focusedIndex === i ? 0 : -1}
    aria-current={focusedIndex === i ? 'true' : undefined}
  >
    {item.label}
  </button>
  
  <div role="separator" aria-orientation="horizontal" />
  
  <button role="menuitem" aria-disabled={!enabled}>
    {item.label}
  </button>
</div>
```

### Carousel

```typescript
<div
  role="region"
  aria-label="Slide preview carousel"
  aria-roledescription="carousel"
>
  <button
    aria-label="Previous slide"
    aria-disabled={isFirst}
  >
    Previous
  </button>
  
  <div role="list" aria-label="Slides">
    <div
      role="listitem"
      aria-label={`Slide ${index + 1}: ${label}`}
      aria-current={isCurrent ? 'location' : undefined}
      tabIndex={isCurrent ? 0 : -1}
    >
      <img alt="" role="presentation" />
    </div>
  </div>
  
  <button
    aria-label="Next slide"
    aria-disabled={isLast}
  >
    Next
  </button>
  
  <div aria-live="polite" aria-atomic="true">
    Slide {current} of {total}
  </div>
</div>
```

### Property Inspector

```typescript
<div
  role="form"
  aria-labelledby="inspector-title"
>
  <h2 id="inspector-title">Slide Properties</h2>
  
  <div role="group" aria-labelledby="typography-heading">
    <h3 id="typography-heading">Typography</h3>
    
    <label htmlFor="font-size">
      Font Size
      <input
        id="font-size"
        type="range"
        min={12}
        max={128}
        aria-valuemin={12}
        aria-valuemax={128}
        aria-valuenow={fontSize}
        aria-valuetext={`${fontSize} pixels`}
      />
    </label>
  </div>
</div>
```

---

## Screen Reader Support

### Live Region Announcements

```typescript
// ARIA live regions for dynamic updates
function AriaLiveRegions() {
  return (
    <>
      {/* Polite announcements (non-interrupting) */}
      <div
        id="aria-live-polite"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      
      {/* Assertive announcements (interrupting) */}
      <div
        id="aria-live-assertive"
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
      />
      
      {/* Navigation announcements */}
      <div
        id="aria-live-navigation"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </>
  );
}

// CSS for screen-reader-only
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Announcement Examples

```typescript
// Announce mode change
function announceModeChange(mode: 'view' | 'author') {
  announce(
    mode === 'author'
      ? 'Entered author mode. Press ? for keyboard shortcuts.'
      : 'Exited author mode. Viewing content.',
    'polite'
  );
}

// Announce selection
function announceSelection(target: SelectionState) {
  const message = formatSelectionMessage(target);
  announce(message, 'polite');
}

// Announce navigation
function announceNavigation(destination: string) {
  announce(`Navigated to ${destination}`, 'polite');
}

// Announce save
function announceSave(success: boolean) {
  announce(
    success ? 'Changes saved successfully' : 'Failed to save changes',
    'assertive'
  );
}

function announce(message: string, priority: 'polite' | 'assertive') {
  const region = document.getElementById(
    priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite'
  );
  
  if (region) {
    region.textContent = message;
    
    // Clear after 5 seconds
    setTimeout(() => {
      region.textContent = '';
    }, 5000);
  }
}
```

---

## Reduced Motion Support

### Respecting User Preferences

```typescript
// Detect reduced motion preference
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Apply to animations
function getAnimationDuration(): number {
  return prefersReducedMotion() ? 0 : 300; // Skip animations if reduced motion
}

// Example: Navigator zoom animation
async function animateZoom(from: number, to: number): Promise<void> {
  const duration = getAnimationDuration();
  
  if (duration === 0) {
    // No animation - instant transition
    this.sceneRenderer.setZoom(to);
    return;
  }
  
  // Normal animation
  return animateSmooth(from, to, duration);
}
```

### CSS Media Query

```css
/* Default animations */
.selection-highlight {
  animation: selection-appear 150ms ease-out;
}

.carousel-item {
  transition: transform 300ms ease;
}

/* Disable animations for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .selection-highlight {
    animation: none;
  }
  
  .carousel-item {
    transition: none;
  }
  
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Testing Matrix

### Unit Test Coverage

| System | Component | Tests | Coverage Target |
|--------|-----------|-------|-----------------|
| Navigator | Mode management | 10 | 90% |
| Navigator | Item navigation | 12 | 90% |
| Navigator | Zoom/Focus | 8 | 85% |
| Authoring | Mode toggle | 6 | 90% |
| Authoring | Selection engine | 15 | 95% |
| Authoring | Hit testing | 10 | 90% |
| Authoring | Inline editing | 12 | 85% |
| Preview | Generation | 15 | 90% |
| Preview | Caching | 10 | 95% |
| Preview | Queue | 8 | 90% |
| Context Menu | Registry | 12 | 95% |
| Context Menu | Actions | 20 | 85% |
| ToC | Tree rendering | 15 | 90% |
| ToC | Navigation | 12 | 90% |
| Carousel | Rendering | 10 | 90% |
| Carousel | Visibility | 8 | 95% |
| **Total** | **All Components** | **163** | **90%** |

### Integration Test Scenarios

**Scenario 1: Complete Authoring Workflow**
```typescript
it('should complete full authoring workflow', async () => {
  // 1. Enter author mode
  await navigatorSystem.enterAuthorMode();
  expect(navigatorSystem.getMode()).toBe('author');
  
  // 2. Navigate to scene
  await navigatorSystem.navigateToScene('scene-card-1');
  
  // 3. Select slide
  const slide = screen.getByTestId('slide-1');
  fireEvent.click(slide);
  expect(selectionEngine.getSelection()).toBeTruthy();
  
  // 4. Edit content
  await authoringSystem.startEdit();
  const editor = screen.getByRole('textbox');
  fireEvent.change(editor, { target: { value: 'Updated text' } });
  
  // 5. Save
  fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });
  await waitFor(() => {
    expect(authoringSystem.hasUnsavedChanges()).toBe(false);
  });
  
  // 6. Verify preview updated
  await waitFor(() => {
    const preview = previewService.getCached({ type: 'slide', slideId: 'slide-1' }, 'sm');
    expect(preview).toBeTruthy();
  });
  
  // 7. Exit author mode
  await navigatorSystem.exitAuthorMode();
  expect(navigatorSystem.getMode()).toBe('view');
});
```

**Scenario 2: Context Menu → Edit → Save**
```typescript
it('should edit via context menu', async () => {
  render(<CardScene sceneId="test" mode="author" />);
  
  // Right-click slide
  const slide = screen.getByTestId('slide-1');
  fireEvent.contextMenu(slide, { clientX: 100, clientY: 100 });
  
  // Click "Edit Text"
  fireEvent.click(screen.getByText('Edit Text'));
  
  // Edit in inline editor
  const editor = await screen.findByRole('textbox');
  fireEvent.change(editor, { target: { value: 'New text' } });
  
  // Save
  fireEvent.click(screen.getByText('Save'));
  
  // Verify saved
  await waitFor(() => {
    expect(screen.getByText('New text')).toBeInTheDocument();
  });
});
```

**Scenario 3: ToC Navigation**
```typescript
it('should navigate via ToC', async () => {
  render(<Portal />);
  
  // Open ToC
  fireEvent.click(screen.getByLabelText('Table of contents'));
  
  // Navigate with keyboard
  const toc = screen.getByRole('tree');
  fireEvent.keyDown(toc, { key: 'ArrowDown' });
  fireEvent.keyDown(toc, { key: 'ArrowDown' });
  fireEvent.keyDown(toc, { key: 'Enter' });
  
  // Verify navigation
  await waitFor(() => {
    expect(navigatorSystem.getCurrentItem()?.id).toBe('slide-2');
  });
});
```

### End-to-End Test Scenarios

**E2E 1: Create Card Scene**
```typescript
describe('E2E: Create Card Scene', () => {
  it('should create complete card scene', async () => {
    // Login
    await login('author@example.com');
    
    // Navigate to scenes
    await page.goto('/author/scenes');
    
    // Create scene
    await page.click('[data-testid="create-scene"]');
    await page.fill('[name="name"]', 'My Presentation');
    await page.select('[name="scene_type"]', 'card');
    await page.click('[type="submit"]');
    
    // Add first slide
    await page.click('[data-testid="add-text-slide"]');
    await page.fill('[data-testid="slide-text"]', 'Welcome');
    await page.click('[data-testid="save"]');
    
    // Add second slide (layered)
    await page.click('[data-testid="add-layered-slide"]');
    await page.setInputFiles('[data-testid="background-upload"]', 'test-image.jpg');
    await page.fill('[data-testid="overlay-text"]', 'Beautiful slide');
    await page.click('[data-testid="save"]');
    
    // Verify scene created
    expect(await page.textContent('h1')).toContain('My Presentation');
    expect(await page.locator('[data-testid="slide"]').count()).toBe(2);
  });
});
```

**E2E 2: Edit Document with Anchors**
```typescript
describe('E2E: Document with Anchors', () => {
  it('should create document with internal links', async () => {
    // Create document scene
    await createDocumentScene('User Guide');
    
    // Add first page
    await page.click('[data-testid="add-page"]');
    await page.fill('[data-testid="page-title"]', 'Introduction');
    
    // Add heading
    await page.click('[data-testid="add-heading"]');
    await page.fill('[data-testid="heading-text"]', 'What is Protogen?');
    
    // Create anchor from heading
    await page.click('[data-testid="create-anchor"]');
    
    // Add second page
    await page.click('[data-testid="add-page"]');
    await page.fill('[data-testid="page-title"]', 'Features');
    
    // Link back to first page anchor
    await page.selectText('Learn more');
    await page.click('[data-testid="create-link"]');
    await page.click('[data-testid="link-to-anchor"]');
    await page.select('[data-testid="anchor-select"]', 'What is Protogen?');
    await page.click('[data-testid="save-link"]');
    
    // Click link and verify navigation
    await page.click('text=Learn more');
    await expect(page.locator('h2')).toContainText('What is Protogen?');
  });
});
```

---

## Accessibility Testing Tools

### Automated Testing

```typescript
// Using jest-axe for automated A11y testing
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should have no A11y violations in ToC', async () => {
    const { container } = render(<ToC tree={mockTree} />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
  
  it('should have no A11y violations in carousel', async () => {
    const { container } = render(<PreviewCarousel sceneId="test" sceneType="card" />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
  
  it('should have no A11y violations in context menu', async () => {
    const { container } = render(<ContextMenu items={mockActions} />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing Checklist

**Screen Reader Testing**:
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with TalkBack (Android)

**Keyboard Navigation**:
- [ ] Complete workflow without mouse
- [ ] Tab order is logical
- [ ] Focus visible at all times
- [ ] No keyboard traps
- [ ] Shortcuts work correctly

**Visual Testing**:
- [ ] Test at 200% zoom
- [ ] Test with high contrast mode
- [ ] Test color contrast (4.5:1 minimum)
- [ ] Test without color (grayscale)

**Assistive Technology**:
- [ ] Test with Zoom (macOS)
- [ ] Test with Magnifier (Windows)
- [ ] Test with voice control

---

## Performance Testing

### Performance Budgets

**Lighthouse Scores**:
- Performance: >= 90
- Accessibility: >= 95
- Best Practices: >= 90
- SEO: >= 90

**Key Metrics**:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- Total Blocking Time: < 300ms

### Performance Test Scenarios

```typescript
describe('Performance', () => {
  it('should render large carousel efficiently', async () => {
    const items = Array.from({ length: 100 }, (_, i) => createSlide(i));
    
    const start = performance.now();
    render(<PreviewCarousel items={items} />);
    const renderTime = performance.now() - start;
    
    expect(renderTime).toBeLessThan(100); // 100ms budget
  });
  
  it('should generate preview within budget', async () => {
    const start = performance.now();
    await previewService.generatePreview({ type: 'slide', slideId: 'slide-1' }, 'sm');
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(200); // 200ms budget for SM
  });
  
  it('should lazy load authoring libraries', async () => {
    const initialSize = getLoadedBundleSize();
    
    await navigatorSystem.enterAuthorMode();
    
    const finalSize = getLoadedBundleSize();
    const authoring Size = finalSize - initialSize;
    
    expect(authoringSize).toBeLessThan(100 * 1024); // < 100KB for authoring
  });
});
```

---

## Tooling Recommendations

### Testing Tools

**Unit & Integration**:
- ✅ Jest (existing in Protogen)
- ✅ React Testing Library (existing in Protogen)
- ✅ jest-axe (for A11y testing)

**E2E Testing**:
- Playwright (recommended) or Cypress
- Visual regression testing (Percy or Chromatic)

**A11y Testing**:
- axe DevTools browser extension
- Lighthouse CI for automated audits
- pa11y for command-line testing

**Performance**:
- Lighthouse CI
- WebPageTest
- Chrome DevTools Performance profiler

### CI/CD Integration

```yaml
# .github/workflows/quality.yml
name: Quality Assurance

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Unit tests
      - name: Run unit tests
        run: npm run test:ci
        
      # A11y tests
      - name: Run accessibility tests
        run: npm run test:a11y
        
      # Lighthouse audit
      - name: Lighthouse CI
        run: npx lhci autorun
        
      # Visual regression
      - name: Visual regression tests
        run: npm run test:visual
```

---

## Acceptance Criteria

- [x] WCAG 2.1 AA compliance requirements documented
- [x] Keyboard navigation coverage for all components
- [x] ARIA roles and attributes specified
- [x] Screen reader announcements defined
- [x] Reduced motion support specified
- [x] Unit test matrix (163 tests, 90% coverage target)
- [x] Integration test scenarios (3 key workflows)
- [x] E2E test scenarios (2 complete flows)
- [x] Accessibility testing strategy (automated + manual)
- [x] Performance budgets and testing approach
- [x] Tooling recommendations (Jest, axe, Playwright, Lighthouse)
- [x] CI/CD integration plan

**Status**: ✅ Complete - Ready for Spec 16

---

## References

- **Previous**: [Spec 14: Persistence Models](./14-persistence-models.md)
- **Next**: [Spec 16: Architectural Decision Records](./16-adrs.md)
- **Related**: 
  - Testing infrastructure in `docs/TESTING_CHECKLIST.md`
  - Existing tests in `shared/src/systems/*/_ _tests__/`

---

## Changelog

**2025-10-14**: Initial specification created  
**Status**: Ready for stakeholder review

