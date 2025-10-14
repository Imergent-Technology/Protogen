# Spec 04: Authoring Overlay Framework

**Initiative**: Authoring-Viewing Unification  
**Date**: October 14, 2025  
**Status**: Planning Phase  
**Type**: Core Contract Specification  
**Depends On**: [Spec 00](./00-project-context.md), [Spec 01](./01-module-integration.md), [Spec 02](./02-event-taxonomy.md), [Spec 03](./03-navigator-enhancements.md)

---

## Overview

This specification defines the Authoring Overlay framework that augments the viewing experience with non-destructive authoring controls. The overlay is scene-type aware and loads only in author mode.

**Principle**: Authoring controls overlay the viewing runtime without modifying the base rendering.

---

## Architecture

### Overlay Pattern

```
┌─────────────────────────────────────────┐
│         Scene Viewport                  │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │    Base Scene Renderer          │   │ ← View Mode
│  │    (Always Active)              │   │
│  └─────────────────────────────────┘   │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │   Authoring Overlay             │   │ ← Author Mode Only
│  │   (Conditional Layer)           │   │
│  │                                  │   │
│  │  • Selection visual feedback    │   │
│  │  • Hit testing & interaction    │   │
│  │  • Handles and ghosts           │   │
│  │  • Inline editors               │   │
│  │  • Context menu triggers        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Component Structure

```typescript
// Main authoring overlay component
function AuthoringOverlay({ sceneId, sceneType }: AuthoringOverlayProps) {
  const { mode } = useNavigator();
  const { selection } = useSelection();
  
  if (mode !== 'author') return null; // Only render in author mode
  
  return (
    <div className="authoring-overlay">
      {/* Hit testing layer */}
      <HitTestLayer sceneId={sceneId} sceneType={sceneType} />
      
      {/* Selection feedback */}
      {selection && (
        <SelectionHighlight
          target={selection}
          sceneType={sceneType}
        />
      )}
      
      {/* Editing handles */}
      {selection && (
        <EditingHandles
          target={selection}
          sceneType={sceneType}
        />
      )}
      
      {/* Inline editor (if editing) */}
      {isEditing && (
        <InlineEditor
          target={selection}
          sceneType={sceneType}
        />
      )}
      
      {/* Context menu trigger */}
      <ContextMenuTrigger sceneId={sceneId} sceneType={sceneType} />
    </div>
  );
}
```

---

## Core Components

### 1. Hit Test Layer

**Purpose**: Detect clicks/interactions on scene elements

**Interface**:
```typescript
interface HitTestLayer {
  // Convert screen coordinates to scene target
  hitTest(point: Point): HitTestResult | null;
  
  // Get all targets at point (for overlapping)
  hitTestAll(point: Point): HitTestResult[];
  
  // Register hit test handler for scene type
  registerHandler(sceneType: SceneType, handler: HitTestHandler): void;
}

interface Point {
  x: number;
  y: number;
}

interface HitTestResult {
  targetType: 'slide' | 'page' | 'node' | 'edge' | 'text' | 'image' | 'block';
  targetId: string;
  bounds: DOMRect;
  element: HTMLElement;
  metadata: Record<string, any>;
}

type HitTestHandler = (point: Point, sceneElement: HTMLElement) => HitTestResult | null;
```

**Scene-Type Specific Handlers**:

```typescript
// Card scene hit testing
function cardHitTest(point: Point, sceneElement: HTMLElement): HitTestResult | null {
  // Find slide at point
  const slideElement = document.elementFromPoint(point.x, point.y);
  if (!slideElement || !slideElement.hasAttribute('data-slide-id')) {
    return null;
  }
  
  return {
    targetType: 'slide',
    targetId: slideElement.getAttribute('data-slide-id')!,
    bounds: slideElement.getBoundingClientRect(),
    element: slideElement,
    metadata: {
      kind: slideElement.getAttribute('data-slide-kind'),
      order: parseInt(slideElement.getAttribute('data-order') || '0')
    }
  };
}

// Document scene hit testing
function documentHitTest(point: Point, sceneElement: HTMLElement): HitTestResult | null {
  // Find block or text range at point
  const element = document.elementFromPoint(point.x, point.y);
  if (!element) return null;
  
  // Check for block
  const blockElement = element.closest('[data-block-id]');
  if (blockElement) {
    return {
      targetType: 'block',
      targetId: blockElement.getAttribute('data-block-id')!,
      bounds: blockElement.getBoundingClientRect(),
      element: blockElement as HTMLElement,
      metadata: {
        blockType: blockElement.getAttribute('data-block-type')
      }
    };
  }
  
  // Check for text selection
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    return {
      targetType: 'text',
      targetId: 'text-selection',
      bounds: range.getBoundingClientRect(),
      element: range.commonAncestorContainer as HTMLElement,
      metadata: {
        text: range.toString()
      }
    };
  }
  
  return null;
}
```

**Registration**:
```typescript
// Register hit test handlers for each scene type
hitTestLayer.registerHandler('card', cardHitTest);
hitTestLayer.registerHandler('document', documentHitTest);
hitTestLayer.registerHandler('graph', graphHitTest);  // TBD
hitTestLayer.registerHandler('video', videoHitTest);  // TBD
```

---

### 2. Selection Model

**Purpose**: Track and manage selection state

**Interface**:
```typescript
class SelectionEngine {
  // Singleton pattern
  private static instance: SelectionEngine;
  static getInstance(): SelectionEngine;
  
  // Selection management
  select(target: HitTestResult): void;
  deselect(): void;
  isSelected(targetId: string): boolean;
  getSelection(): SelectionState | null;
  
  // Multi-selection
  addToSelection(target: HitTestResult): void;
  removeFromSelection(targetId: string): void;
  getMultiSelection(): SelectionState[];
  clearMultiSelection(): void;
  
  // Selection modes
  setMode(mode: 'single' | 'multi'): void;
  getMode(): 'single' | 'multi';
  
  // Events
  on(event: 'selection-changed', handler: EventHandler): void;
  emit(event: 'selection-changed', payload: SelectionChangedPayload): void;
}

interface SelectionState {
  targetType: string;
  targetId: string;
  bounds: DOMRect;
  metadata: Record<string, any>;
  selected: boolean;
  timestamp: number;
}
```

**Selection Behavior**:
```typescript
// Single selection (default)
function handleClick(event: MouseEvent) {
  const point = { x: event.clientX, y: event.clientY };
  const result = hitTestLayer.hitTest(point);
  
  if (result) {
    selectionEngine.select(result);
  } else {
    selectionEngine.deselect();
  }
}

// Multi-selection (Ctrl+Click)
function handleCtrlClick(event: MouseEvent) {
  if (!event.ctrlKey) return;
  
  const point = { x: event.clientX, y: event.clientY };
  const result = hitTestLayer.hitTest(point);
  
  if (result) {
    if (selectionEngine.isSelected(result.targetId)) {
      selectionEngine.removeFromSelection(result.targetId);
    } else {
      selectionEngine.addToSelection(result);
    }
  }
}

// Range selection (Shift+Click)
function handleShiftClick(event: MouseEvent) {
  if (!event.shiftKey) return;
  
  const currentSelection = selectionEngine.getSelection();
  if (!currentSelection) return;
  
  const point = { x: event.clientX, y: event.clientY };
  const result = hitTestLayer.hitTest(point);
  
  if (result) {
    const range = sceneSystem.getItemRange(
      currentSelection.targetId,
      result.targetId
    );
    
    range.forEach(item => {
      selectionEngine.addToSelection(item);
    });
  }
}
```

---

### 3. Selection Highlight Component

**Purpose**: Visual feedback for selected elements

**Interface**:
```typescript
interface SelectionHighlightProps {
  target: SelectionState;
  sceneType: SceneType;
  style?: HighlightStyle;
}

interface HighlightStyle {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'glow';
  opacity: number;
}

function SelectionHighlight({ target, sceneType, style }: SelectionHighlightProps) {
  const highlightStyle = style || getDefaultHighlightStyle(sceneType);
  
  // Position highlight over selected element
  const position = {
    position: 'absolute',
    left: target.bounds.left,
    top: target.bounds.top,
    width: target.bounds.width,
    height: target.bounds.height,
    border: `${highlightStyle.width}px ${highlightStyle.style} ${highlightStyle.color}`,
    opacity: highlightStyle.opacity,
    pointerEvents: 'none',  // Don't interfere with clicks
    zIndex: 9999
  };
  
  return <div className="selection-highlight" style={position} />;
}
```

**Scene-Type Specific Styles**:
```typescript
function getDefaultHighlightStyle(sceneType: SceneType): HighlightStyle {
  switch (sceneType) {
    case 'card':
      return {
        color: '#3b82f6',    // Blue
        width: 2,
        style: 'solid',
        opacity: 0.8
      };
    
    case 'document':
      return {
        color: '#10b981',    // Green
        width: 1,
        style: 'dashed',
        opacity: 0.6
      };
    
    case 'graph':
      return {
        color: '#8b5cf6',    // Purple
        width: 3,
        style: 'glow',       // Box shadow for glow effect
        opacity: 1.0
      };
    
    case 'video':
      return {
        color: '#ef4444',    // Red
        width: 2,
        style: 'solid',
        opacity: 0.7
      };
  }
}
```

---

### 4. Editing Handles

**Purpose**: Provide manipulation affordances for selected elements

**Interface**:
```typescript
interface EditingHandlesProps {
  target: SelectionState;
  sceneType: SceneType;
  capabilities: HandleCapability[];
}

type HandleCapability = 
  | 'resize'
  | 'rotate'
  | 'move'
  | 'align'
  | 'layer'
  | 'delete';

function EditingHandles({ target, sceneType, capabilities }: EditingHandlesProps) {
  const handles = getHandlesForSceneType(sceneType, capabilities);
  
  return (
    <div className="editing-handles" data-target={target.targetId}>
      {handles.map(handle => (
        <Handle
          key={handle.type}
          type={handle.type}
          position={handle.position}
          onDrag={handle.onDrag}
          cursor={handle.cursor}
        />
      ))}
    </div>
  );
}
```

**Scene-Type Specific Handles**:
```typescript
// Card scene: text positioning handles
function getCardHandles(target: SelectionState): HandleConfig[] {
  if (target.targetType === 'text') {
    return [
      { type: 'move', position: 'center', cursor: 'move' },
      { type: 'align-left', position: 'left', cursor: 'pointer' },
      { type: 'align-center', position: 'center-top', cursor: 'pointer' },
      { type: 'align-right', position: 'right', cursor: 'pointer' },
      { type: 'delete', position: 'top-right', cursor: 'pointer' }
    ];
  } else if (target.targetType === 'image') {
    return [
      { type: 'replace', position: 'center', cursor: 'pointer' },
      { type: 'delete', position: 'top-right', cursor: 'pointer' }
    ];
  }
  return [];
}

// Document scene: block manipulation handles
function getDocumentHandles(target: SelectionState): HandleConfig[] {
  if (target.targetType === 'block') {
    return [
      { type: 'move', position: 'left', cursor: 'grab' },
      { type: 'insert-before', position: 'top', cursor: 'copy' },
      { type: 'insert-after', position: 'bottom', cursor: 'copy' },
      { type: 'delete', position: 'right', cursor: 'pointer' }
    ];
  }
  return [];
}
```

---

### 5. Inline Editor

**Purpose**: Edit content directly in place

**Interface**:
```typescript
interface InlineEditorProps {
  target: SelectionState;
  sceneType: SceneType;
  initialValue: any;
  onSave: (newValue: any) => void;
  onCancel: () => void;
}

function InlineEditor({ target, sceneType, initialValue, onSave, onCancel }: InlineEditorProps) {
  const [value, setValue] = useState(initialValue);
  const editorRef = useRef<HTMLElement>(null);
  
  // Auto-focus on mount
  useEffect(() => {
    editorRef.current?.focus();
  }, []);
  
  // Handle keyboard shortcuts
  useKeyboardShortcuts({
    'Enter': () => onSave(value),
    'Escape': onCancel,
    'Ctrl+S': () => onSave(value)
  });
  
  // Render appropriate editor for scene type
  const EditorComponent = getEditorForSceneType(sceneType, target.targetType);
  
  return (
    <div className="inline-editor" style={positionOverTarget(target.bounds)}>
      <EditorComponent
        ref={editorRef}
        value={value}
        onChange={setValue}
        onSave={() => onSave(value)}
        onCancel={onCancel}
      />
    </div>
  );
}
```

**Scene-Type Specific Editors**:
```typescript
// Card scene: Simple text editor
function CardTextEditor({ value, onChange }: EditorProps) {
  return (
    <textarea
      value={value.text}
      onChange={(e) => onChange({ ...value, text: e.target.value })}
      className="card-text-editor"
      rows={4}
    />
  );
}

// Document scene: Rich text editor (TipTap)
function DocumentBlockEditor({ value, onChange }: EditorProps) {
  const editor = useEditor({
    content: value.content,
    onUpdate: ({ editor }) => {
      onChange({ ...value, content: editor.getHTML() });
    }
  });
  
  return <EditorContent editor={editor} />;
}
```

---

### 6. Context Menu Trigger

**Purpose**: Handle right-click and long-press for context menus

**Interface**:
```typescript
interface ContextMenuTriggerProps {
  sceneId: string;
  sceneType: SceneType;
}

function ContextMenuTrigger({ sceneId, sceneType }: ContextMenuTriggerProps) {
  const { openContextMenu } = useDialog();
  
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    
    const point = { x: event.clientX, y: event.clientY };
    const target = hitTestLayer.hitTest(point);
    
    // Get context actions for target (or blank space)
    const actions = target
      ? getElementActions(target, sceneType)
      : getBlankSpaceActions(sceneType);
    
    openContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: actions,
      onSelect: (action) => handleAction(action, target)
    });
  };
  
  // Long-press for mobile
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    const timer = setTimeout(() => {
      handleContextMenu({
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => event.preventDefault()
      } as any);
    }, 500); // 500ms long-press
    
    const cleanup = () => clearTimeout(timer);
    element.addEventListener('touchend', cleanup, { once: true });
    element.addEventListener('touchmove', cleanup, { once: true });
  };
  
  return (
    <div
      className="context-menu-trigger"
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}
    />
  );
}
```

---

## Authoring System Class

### Core AuthoringSystem

```typescript
class AuthoringSystem {
  private static instance: AuthoringSystem;
  private mode: 'view' | 'author' = 'view';
  private selectionEngine: SelectionEngine;
  private hitTestLayer: HitTestLayer;
  private eventEmitter: EventEmitter;
  
  static getInstance(): AuthoringSystem {
    if (!AuthoringSystem.instance) {
      AuthoringSystem.instance = new AuthoringSystem();
    }
    return AuthoringSystem.instance;
  }
  
  // Mode management
  getMode(): 'view' | 'author' {
    return this.mode;
  }
  
  enterAuthorMode(): void {
    if (this.mode === 'author') return;
    
    this.mode = 'author';
    this.emit('MODE_CHANGED', {
      previousMode: 'view',
      currentMode: 'author',
      timestamp: Date.now(),
      triggeredBy: 'user'
    });
  }
  
  exitAuthorMode(): void {
    if (this.mode === 'view') return;
    
    // Check for unsaved changes
    if (this.hasUnsavedChanges()) {
      const confirmed = await this.confirmExit();
      if (!confirmed) return;
    }
    
    this.mode = 'view';
    this.selectionEngine.clearSelection();
    
    this.emit('MODE_CHANGED', {
      previousMode: 'author',
      currentMode: 'view',
      timestamp: Date.now(),
      triggeredBy: 'user'
    });
  }
  
  // Selection delegation
  select(target: HitTestResult): void {
    this.selectionEngine.select(target);
  }
  
  getSelection(): SelectionState | null {
    return this.selectionEngine.getSelection();
  }
  
  clearSelection(): void {
    this.selectionEngine.deselect();
  }
  
  // Editing operations
  async startEdit(target?: SelectionState): Promise<void> {
    const editTarget = target || this.getSelection();
    if (!editTarget) {
      throw new Error('No target selected for editing');
    }
    
    this.emit('EDIT_STARTED', {
      sceneId: this.getCurrentSceneId(),
      editType: 'inline',
      targetType: editTarget.targetType,
      targetId: editTarget.targetId,
      initialValue: await this.loadTargetData(editTarget)
    });
  }
  
  async completeEdit(newValue: any): Promise<void> {
    const selection = this.getSelection();
    if (!selection) return;
    
    const previousValue = await this.loadTargetData(selection);
    
    // Apply changes through scene-specific handler
    await this.applyChange(selection, newValue);
    
    this.emit('EDIT_COMPLETED', {
      sceneId: this.getCurrentSceneId(),
      targetId: selection.targetId,
      previousValue,
      newValue,
      saved: true
    });
  }
  
  cancelEdit(): void {
    const selection = this.getSelection();
    if (!selection) return;
    
    this.emit('EDIT_CANCELED', {
      sceneId: this.getCurrentSceneId(),
      targetId: selection.targetId,
      editType: 'inline'
    });
  }
  
  // Content modification
  async addContent(contentType: string, data: any, position?: number): Promise<void> {
    const newId = await this.sceneSystem.addContent({
      sceneId: this.getCurrentSceneId(),
      contentType,
      data,
      position
    });
    
    this.emit('CONTENT_ADDED', {
      sceneId: this.getCurrentSceneId(),
      contentType,
      contentId: newId,
      position,
      data
    });
    
    return newId;
  }
  
  async removeContent(targetId: string, contentType: string): Promise<void> {
    const previousData = await this.loadTargetData({ targetId } as SelectionState);
    
    await this.sceneSystem.removeContent(this.getCurrentSceneId(), targetId);
    
    this.emit('CONTENT_REMOVED', {
      sceneId: this.getCurrentSceneId(),
      contentType,
      contentId: targetId,
      previousData
    });
  }
  
  // Scene-type specific handlers
  private applyChange(target: SelectionState, newValue: any): Promise<void> {
    const sceneType = this.getCurrentSceneType();
    const handler = this.getChangeHandler(sceneType);
    return handler.applyChange(target, newValue);
  }
  
  private registerChangeHandler(sceneType: SceneType, handler: ChangeHandler): void {
    this.changeHandlers.set(sceneType, handler);
  }
  
  // Helper methods
  private getCurrentSceneId(): string {
    return navigatorSystem.getCurrentContext().sceneId!;
  }
  
  private getCurrentSceneType(): SceneType {
    return sceneSystem.getSceneType(this.getCurrentSceneId());
  }
  
  private hasUnsavedChanges(): boolean {
    // Check if any edits pending save
    return this.pendingChanges.size > 0;
  }
  
  private async confirmExit(): Promise<boolean> {
    return await dialogSystem.openConfirmation({
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Exit without saving?',
      confirmText: 'Exit',
      cancelText: 'Stay',
      variant: 'warning'
    });
  }
}
```

---

## Change Handler Interface

### Scene-Type Change Handlers

```typescript
interface ChangeHandler {
  // Apply a change to a target
  applyChange(target: SelectionState, newValue: any): Promise<void>;
  
  // Validate change before applying
  validateChange(target: SelectionState, newValue: any): ValidationResult;
  
  // Get data for target
  getData(targetId: string): Promise<any>;
  
  // Get inspector schema for target type
  getInspectorSchema(targetType: string): InspectorSchema;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

interface InspectorSchema {
  fields: FieldDefinition[];
  layout: 'vertical' | 'horizontal' | 'grid';
}

interface FieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'color' | 'range';
  defaultValue?: any;
  options?: { value: any; label: string }[];
  validation?: ValidationRule[];
}
```

**Example: Card Scene Change Handler**:
```typescript
class CardSceneChangeHandler implements ChangeHandler {
  async applyChange(target: SelectionState, newValue: any): Promise<void> {
    if (target.targetType === 'text') {
      await api.put(`/slides/${target.targetId}`, {
        text: newValue.text,
        fontSize: newValue.fontSize,
        alignment: newValue.alignment
      });
    } else if (target.targetType === 'image') {
      await api.put(`/slides/${target.targetId}`, {
        imageAssetId: newValue.imageAssetId
      });
    }
  }
  
  validateChange(target: SelectionState, newValue: any): ValidationResult {
    if (target.targetType === 'text') {
      if (!newValue.text || newValue.text.trim() === '') {
        return { valid: false, errors: ['Text cannot be empty'] };
      }
      if (newValue.fontSize < 8 || newValue.fontSize > 128) {
        return { valid: false, errors: ['Font size must be between 8 and 128'] };
      }
    }
    return { valid: true };
  }
  
  async getData(targetId: string): Promise<any> {
    const response = await api.get(`/slides/${targetId}`);
    return response.data;
  }
  
  getInspectorSchema(targetType: string): InspectorSchema {
    if (targetType === 'text') {
      return {
        fields: [
          { id: 'text', label: 'Text', type: 'text' },
          { id: 'fontSize', label: 'Font Size', type: 'range', defaultValue: 16 },
          { id: 'alignment', label: 'Alignment', type: 'select', 
            options: [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' }
            ]
          },
          { id: 'timing', label: 'Appear Delay (ms)', type: 'number', defaultValue: 0 }
        ],
        layout: 'vertical'
      };
    }
    return { fields: [], layout: 'vertical' };
  }
}
```

---

## Keyboard Interactions

### Keyboard Shortcuts

| Shortcut | Action | Context | Behavior |
|----------|--------|---------|----------|
| `Cmd/Ctrl + E` | Toggle edit mode | Any | Enter/exit author mode |
| `Enter` | Start edit | Selection | Open inline editor for selected item |
| `Delete` | Remove | Selection | Delete selected item (with confirmation) |
| `Escape` | Cancel | Editing | Cancel current edit operation |
| `Cmd/Ctrl + S` | Save | Editing | Save current edit |
| `Cmd/Ctrl + Z` | Undo | Author mode | Undo last change |
| `Cmd/Ctrl + Shift + Z` | Redo | Author mode | Redo last undone change |
| `Arrow Keys` | Navigate | Selection | Move selection to adjacent item |
| `Tab` | Next field | Editing | Focus next field in inspector |
| `Shift + Tab` | Prev field | Editing | Focus previous field in inspector |
| `Cmd/Ctrl + A` | Select all | Author mode | Select all items in scene |
| `Cmd/Ctrl + D` | Duplicate | Selection | Duplicate selected item |

### Keyboard Handler

```typescript
class KeyboardHandler {
  private shortcuts = new Map<string, KeyboardAction>();
  
  register(key: string, action: KeyboardAction): void {
    this.shortcuts.set(this.normalizeKey(key), action);
  }
  
  handleKeyDown(event: KeyboardEvent): void {
    const key = this.getKeyCombo(event);
    const action = this.shortcuts.get(key);
    
    if (action && action.shouldHandle(event)) {
      event.preventDefault();
      action.execute(event);
    }
  }
  
  private getKeyCombo(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
    if (event.shiftKey) parts.push('Shift');
    if (event.altKey) parts.push('Alt');
    parts.push(event.key);
    return parts.join('+');
  }
  
  private normalizeKey(key: string): string {
    return key.replace('Cmd', 'Ctrl'); // Mac → PC normalization
  }
}

interface KeyboardAction {
  shouldHandle(event: KeyboardEvent): boolean;
  execute(event: KeyboardEvent): void;
}
```

---

## Focus Management

### Focus Trap in Editing Mode

```typescript
class FocusManager {
  private focusTrap: FocusTrap | null = null;
  
  enableFocusTrap(container: HTMLElement): void {
    this.focusTrap = createFocusTrap(container, {
      escapeDeactivates: true,
      clickOutsideDeactivates: false,
      initialFocus: container.querySelector('[data-autofocus]'),
      onDeactivate: () => {
        authoringSystem.cancelEdit();
      }
    });
    
    this.focusTrap.activate();
  }
  
  disableFocusTrap(): void {
    if (this.focusTrap) {
      this.focusTrap.deactivate();
      this.focusTrap = null;
    }
  }
}
```

### Accessible Focus Outline

```typescript
// CSS focus styles
const focusStyles = {
  // Visible focus indicator
  outline: '2px solid var(--focus-color)',
  outlineOffset: '2px',
  
  // High contrast mode support
  '@media (prefers-contrast: high)': {
    outline: '3px solid currentColor',
    outlineOffset: '3px'
  }
};

// Skip to content link (for keyboard users)
function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        ':focus': {
          position: 'fixed',
          left: '8px',
          top: '8px',
          width: 'auto',
          height: 'auto',
          overflow: 'visible'
        }
      }}
    >
      Skip to content
    </a>
  );
}
```

---

## Plugin Architecture

### Scene-Type Plugins

```typescript
interface AuthoringPlugin {
  sceneType: SceneType;
  
  // Hit testing
  hitTest: HitTestHandler;
  
  // Change handling
  changeHandler: ChangeHandler;
  
  // Visual components
  SelectionHighlight: React.ComponentType<SelectionHighlightProps>;
  EditingHandles: React.ComponentType<EditingHandlesProps>;
  InlineEditor: React.ComponentType<InlineEditorProps>;
  
  // Context actions
  getElementActions(target: HitTestResult): ContextAction[];
  getBlankSpaceActions(): ContextAction[];
}

// Register plugins
class AuthoringSystem {
  private plugins = new Map<SceneType, AuthoringPlugin>();
  
  registerPlugin(plugin: AuthoringPlugin): void {
    this.plugins.set(plugin.sceneType, plugin);
    
    // Register hit test handler
    this.hitTestLayer.registerHandler(plugin.sceneType, plugin.hitTest);
    
    // Register change handler
    this.changeHandlers.set(plugin.sceneType, plugin.changeHandler);
  }
  
  getPlugin(sceneType: SceneType): AuthoringPlugin | null {
    return this.plugins.get(sceneType) || null;
  }
}
```

**Example: Card Scene Plugin**:
```typescript
const cardScenePlugin: AuthoringPlugin = {
  sceneType: 'card',
  hitTest: cardHitTest,
  changeHandler: new CardSceneChangeHandler(),
  SelectionHighlight: CardSelectionHighlight,
  EditingHandles: CardEditingHandles,
  InlineEditor: CardInlineEditor,
  getElementActions: getCardElementActions,
  getBlankSpaceActions: getCardBlankSpaceActions
};

authoringSystem.registerPlugin(cardScenePlugin);
```

---

## React Hooks

### useAuthoring Hook

```typescript
function useAuthoring() {
  const [mode, setMode] = useState<'view' | 'author'>('view');
  
  useEffect(() => {
    const handleModeChange = (payload: ModeChangedPayload) => {
      setMode(payload.currentMode);
    };
    
    authoringSystem.on('MODE_CHANGED', handleModeChange);
    return () => authoringSystem.off('MODE_CHANGED', handleModeChange);
  }, []);
  
  return {
    mode,
    isAuthorMode: mode === 'author',
    enterAuthorMode: () => authoringSystem.enterAuthorMode(),
    exitAuthorMode: () => authoringSystem.exitAuthorMode(),
    toggleMode: () => authoringSystem.toggleMode()
  };
}
```

### useSelection Hook

```typescript
function useSelection() {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [multiSelection, setMultiSelection] = useState<SelectionState[]>([]);
  
  useEffect(() => {
    const handleSelectionChange = (payload: SelectionChangedPayload) => {
      setSelection(payload.currentSelection);
    };
    
    const handleMultiSelectionChange = (payload: MultiSelectChangedPayload) => {
      setMultiSelection(payload.selections);
    };
    
    selectionEngine.on('selection-changed', handleSelectionChange);
    selectionEngine.on('multi-selection-changed', handleMultiSelectionChange);
    
    return () => {
      selectionEngine.off('selection-changed', handleSelectionChange);
      selectionEngine.off('multi-selection-changed', handleMultiSelectionChange);
    };
  }, []);
  
  return {
    selection,
    multiSelection,
    hasSelection: selection !== null,
    hasMultiSelection: multiSelection.length > 0,
    select: (target: HitTestResult) => selectionEngine.select(target),
    deselect: () => selectionEngine.deselect(),
    clearAll: () => selectionEngine.clearMultiSelection()
  };
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('AuthoringSystem', () => {
  it('should toggle between modes', () => {
    expect(authoringSystem.getMode()).toBe('view');
    
    authoringSystem.enterAuthorMode();
    expect(authoringSystem.getMode()).toBe('author');
    
    authoringSystem.exitAuthorMode();
    expect(authoringSystem.getMode()).toBe('view');
  });
  
  it('should emit MODE_CHANGED events', () => {
    const handler = jest.fn();
    authoringSystem.on('MODE_CHANGED', handler);
    
    authoringSystem.enterAuthorMode();
    
    expect(handler).toHaveBeenCalledWith({
      previousMode: 'view',
      currentMode: 'author',
      timestamp: expect.any(Number),
      triggeredBy: 'user'
    });
  });
  
  it('should prevent mode change without permissions', () => {
    mockPermissions({ 'authoring.access': false });
    expect(() => authoringSystem.enterAuthorMode()).toThrow();
  });
});

describe('SelectionEngine', () => {
  it('should select and deselect items', () => {
    const target = createMockHitTestResult();
    
    selectionEngine.select(target);
    expect(selectionEngine.getSelection()).toBeTruthy();
    
    selectionEngine.deselect();
    expect(selectionEngine.getSelection()).toBeNull();
  });
  
  it('should support multi-selection', () => {
    selectionEngine.setMode('multi');
    
    selectionEngine.addToSelection(target1);
    selectionEngine.addToSelection(target2);
    
    expect(selectionEngine.getMultiSelection()).toHaveLength(2);
  });
});

describe('HitTestLayer', () => {
  it('should detect hits on elements', () => {
    const point = { x: 100, y: 100 };
    const result = hitTestLayer.hitTest(point);
    
    expect(result).toMatchObject({
      targetType: 'slide',
      targetId: expect.any(String),
      bounds: expect.any(Object)
    });
  });
  
  it('should return null for blank space', () => {
    const point = { x: 9999, y: 9999 };
    const result = hitTestLayer.hitTest(point);
    
    expect(result).toBeNull();
  });
});
```

### Integration Tests

```typescript
describe('Authoring Overlay Integration', () => {
  it('should complete full authoring workflow', async () => {
    // Enter author mode
    authoringSystem.enterAuthorMode();
    expect(authoringSystem.getMode()).toBe('author');
    
    // Select item
    const target = createMockHitTestResult();
    authoringSystem.select(target);
    expect(authoringSystem.getSelection()).toBeTruthy();
    
    // Start edit
    await authoringSystem.startEdit();
    expect(editingState).toBe(true);
    
    // Complete edit
    await authoringSystem.completeEdit({ text: 'Updated' });
    expect(editingState).toBe(false);
    
    // Preview generated
    await waitFor(() => {
      expect(previewService.hasCached(target.targetId)).toBe(true);
    });
    
    // Exit author mode
    authoringSystem.exitAuthorMode();
    expect(authoringSystem.getMode()).toBe('view');
  });
});
```

---

## Acceptance Criteria

- [x] AuthoringSystem class interface defined
- [x] Mode management methods (enter/exit/toggle)
- [x] Selection engine with single and multi-select
- [x] Hit test layer with scene-type handlers
- [x] Selection highlight component
- [x] Editing handles component
- [x] Inline editor component
- [x] Context menu trigger with touch support
- [x] Change handler interface for scene types
- [x] Plugin architecture for extensibility
- [x] React hooks (useAuthoring, useSelection)
- [x] Keyboard shortcuts defined and handled
- [x] Focus management with trap
- [x] Testing strategy with unit and integration tests
- [x] Integration with existing Navigator, Dialog, Scene systems

**Status**: ✅ Complete - Phase 1 Complete!

---

## References

- **Previous**: [Spec 03: Navigator Enhancements](./03-navigator-enhancements.md)
- **Next**: [Spec 05: Context Menu System](./05-context-menu.md)
- **Related**: Existing Authoring system in `shared/src/systems/authoring/`

---

## Changelog

**2025-10-14**: Initial specification created  
**Status**: Ready for stakeholder review

