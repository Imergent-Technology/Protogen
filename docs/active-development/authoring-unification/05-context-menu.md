# Spec 05: Context Menu System

**Initiative**: Authoring-Viewing Unification  
**Date**: October 14, 2025  
**Status**: Planning Phase  
**Type**: Interaction System Specification  
**Depends On**: [Spec 02](./02-event-taxonomy.md), [Spec 04](./04-authoring-overlay.md)

---

## Overview

This specification defines the context menu system for authoring interactions, integrating with Protogen's existing Dialog system. Context menus are target-aware (element vs blank space) and scene-type specific.

**Principle**: Right-click/long-press drives authoring actions; menu items adapt to target and context.

---

## Integration with Dialog System

### Using Existing Dialog Architecture

```typescript
// Context menus render using existing Dialog system
import { dialogSystem } from '@protogen/shared/systems/dialog';

function showContextMenu(x: number, y: number, items: ContextMenuItem[]) {
  dialogSystem.openCustom({
    type: 'context-menu',
    position: { x, y },
    content: <ContextMenu items={items} />,
    closeOnClickOutside: true,
    closeOnEscape: true
  });
}
```

**Benefits**:
- Reuses existing dialog positioning logic
- Consistent with other Protogen dialogs
- Focus management handled automatically
- A11y compliance from existing system

---

## Context Action Registry

### Core Registry Interface

```typescript
class ContextActionRegistry {
  private actions = new Map<string, ContextActionDefinition>();
  
  // Register action for scene type + element type
  register(
    sceneType: SceneType,
    elementType: string | 'blank',
    action: ContextActionDefinition
  ): void {
    const key = `${sceneType}:${elementType}`;
    const existing = this.actions.get(key) || [];
    this.actions.set(key, [...existing, action]);
  }
  
  // Get actions for target
  getActions(
    sceneType: SceneType,
    target: HitTestResult | null
  ): ContextAction[] {
    const elementType = target?.targetType || 'blank';
    const key = `${sceneType}:${elementType}`;
    const definitions = this.actions.get(key) || [];
    
    // Filter by enabled predicate
    return definitions
      .filter(def => !def.enabled || def.enabled(target))
      .map(def => this.createAction(def, target));
  }
  
  // Unregister action
  unregister(sceneType: SceneType, elementType: string, actionId: string): void {
    const key = `${sceneType}:${elementType}`;
    const definitions = this.actions.get(key) || [];
    this.actions.set(key, definitions.filter(d => d.id !== actionId));
  }
  
  private createAction(def: ContextActionDefinition, target: HitTestResult | null): ContextAction {
    return {
      id: def.id,
      label: def.label,
      icon: def.icon,
      shortcut: def.shortcut,
      action: () => def.handler(target),
      variant: def.variant
    };
  }
}

interface ContextActionDefinition {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  handler: (target: HitTestResult | null) => void | Promise<void>;
  enabled?: (target: HitTestResult | null) => boolean;
  variant?: 'default' | 'danger' | 'success';
  group?: string;  // For organizing into sections
  order?: number;   // For ordering within group
}

interface ContextAction {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
  variant?: 'default' | 'danger' | 'success';
}
```

---

## Card Scene Actions

### Element Actions (On Slide)

```typescript
// Register actions for Card scene type
const cardSceneActions = {
  // Text slide actions
  textSlide: [
    {
      id: 'edit-text',
      label: 'Edit Text',
      icon: 'edit',
      shortcut: 'Enter',
      handler: async (target) => {
        await authoringSystem.startEdit(target);
      },
      enabled: (target) => target?.metadata.kind === 'text'
    },
    {
      id: 'edit-timing',
      label: 'Edit Timing...',
      icon: 'clock',
      handler: async (target) => {
        dialogSystem.openDrawer({
          position: 'right',
          title: 'Slide Timing',
          content: <TimingEditor slideId={target.targetId} />
        });
      },
      group: 'properties'
    },
    {
      id: 'change-alignment',
      label: 'Alignment',
      icon: 'align',
      handler: (target) => {
        // Show alignment submenu
      },
      group: 'format'
    },
    {
      id: 'remove-slide',
      label: 'Remove Slide',
      icon: 'trash',
      shortcut: 'Delete',
      variant: 'danger',
      handler: async (target) => {
        const confirmed = await dialogSystem.openConfirmation({
          title: 'Remove Slide',
          message: 'Are you sure you want to remove this slide?',
          confirmText: 'Remove',
          variant: 'danger'
        });
        
        if (confirmed) {
          await authoringSystem.removeContent(target.targetId, 'slide');
        }
      },
      group: 'actions'
    }
  ],
  
  // Image slide actions
  imageSlide: [
    {
      id: 'replace-image',
      label: 'Replace Image...',
      icon: 'image',
      handler: async (target) => {
        const file = await openFilePicker({ accept: 'image/*' });
        if (file) {
          await uploadAndReplaceImage(target.targetId, file);
        }
      },
      enabled: (target) => target?.metadata.kind === 'image'
    },
    {
      id: 'crop-image',
      label: 'Crop Image...',
      icon: 'crop',
      handler: (target) => {
        dialogSystem.openModal({
          title: 'Crop Image',
          size: 'lg',
          content: <ImageCropper imageId={target.metadata.imageAssetId} />
        });
      }
    },
    {
      id: 'remove-slide',
      label: 'Remove Slide',
      icon: 'trash',
      variant: 'danger',
      handler: async (target) => {
        const confirmed = await dialogSystem.openConfirmation({
          title: 'Remove Slide',
          message: 'Are you sure you want to remove this slide?',
          confirmText: 'Remove',
          variant: 'danger'
        });
        
        if (confirmed) {
          await authoringSystem.removeContent(target.targetId, 'slide');
        }
      }
    }
  ],
  
  // Layered slide actions (background image + text overlay)
  layeredSlide: [
    {
      id: 'edit-text',
      label: 'Edit Text Layer',
      icon: 'edit',
      handler: async (target) => {
        await authoringSystem.startEdit(target);
      }
    },
    {
      id: 'replace-background',
      label: 'Change Background...',
      icon: 'image',
      handler: async (target) => {
        const file = await openFilePicker({ accept: 'image/*' });
        if (file) {
          await uploadAndReplaceBackground(target.targetId, file);
        }
      }
    },
    {
      id: 'edit-timing',
      label: 'Text Animation...',
      icon: 'clock',
      handler: (target) => {
        dialogSystem.openDrawer({
          position: 'right',
          title: 'Text Animation',
          content: <LayeredTextTimingEditor slideId={target.targetId} />
        });
      }
    },
    {
      id: 'layer-order',
      label: 'Layer Order...',
      icon: 'layers',
      handler: (target) => {
        // Show layer order controls
      }
    },
    {
      id: 'remove-slide',
      label: 'Remove Slide',
      icon: 'trash',
      variant: 'danger',
      handler: async (target) => {
        const confirmed = await dialogSystem.openConfirmation({
          title: 'Remove Slide',
          message: 'Are you sure you want to remove this slide?',
          confirmText: 'Remove',
          variant: 'danger'
        });
        
        if (confirmed) {
          await authoringSystem.removeContent(target.targetId, 'slide');
        }
      }
    }
  ]
};

// Register all card actions
Object.entries(cardSceneActions).forEach(([elementType, actions]) => {
  actions.forEach(action => {
    contextActionRegistry.register('card', elementType, action);
  });
});
```

### Blank Space Actions (Add New Content)

```typescript
const cardBlankSpaceActions = [
  {
    id: 'add-text-slide',
    label: 'Add Text Slide',
    icon: 'text',
    shortcut: 'T',
    handler: async () => {
      const newSlide = await authoringSystem.addContent('slide', {
        kind: 'text',
        text: 'New slide text',
        fontSize: 24,
        alignment: 'center'
      });
      
      // Select newly created slide
      selectionEngine.select({ targetId: newSlide, targetType: 'slide' });
    },
    group: 'add'
  },
  {
    id: 'add-image-slide',
    label: 'Add Image Slide',
    icon: 'image',
    shortcut: 'I',
    handler: async () => {
      const file = await openFilePicker({ accept: 'image/*' });
      if (!file) return;
      
      const imageAsset = await uploadImage(file);
      const newSlide = await authoringSystem.addContent('slide', {
        kind: 'image',
        imageAssetId: imageAsset.id
      });
      
      selectionEngine.select({ targetId: newSlide, targetType: 'slide' });
    },
    group: 'add'
  },
  {
    id: 'add-layered-slide',
    label: 'Add Layered Slide',
    icon: 'layers',
    shortcut: 'L',
    handler: async () => {
      // Open wizard to configure layered slide
      dialogSystem.openModal({
        title: 'Create Layered Slide',
        content: <LayeredSlideWizard onComplete={async (data) => {
          const newSlide = await authoringSystem.addContent('slide', data);
          selectionEngine.select({ targetId: newSlide, targetType: 'slide' });
        }} />
      });
    },
    group: 'add'
  },
  {
    id: 'paste-slide',
    label: 'Paste Slide',
    icon: 'clipboard',
    shortcut: 'Ctrl+V',
    handler: async () => {
      const clipboardData = await getClipboard();
      if (clipboardData.type === 'slide') {
        const newSlide = await authoringSystem.addContent('slide', clipboardData.data);
        selectionEngine.select({ targetId: newSlide, targetType: 'slide' });
      }
    },
    enabled: () => hasClipboardData('slide'),
    group: 'clipboard'
  }
];

cardBlankSpaceActions.forEach(action => {
  contextActionRegistry.register('card', 'blank', action);
});
```

---

## Document Scene Actions

### Element Actions (On Block/Text)

```typescript
const documentSceneActions = {
  // Block actions
  block: [
    {
      id: 'edit-block',
      label: 'Edit Block',
      icon: 'edit',
      shortcut: 'Enter',
      handler: async (target) => {
        await authoringSystem.startEdit(target);
      }
    },
    {
      id: 'insert-before',
      label: 'Insert Block Before',
      icon: 'plus-above',
      handler: async (target) => {
        await authoringSystem.addContent('block', {
          type: 'paragraph',
          content: ''
        }, target.metadata.order);
      }
    },
    {
      id: 'insert-after',
      label: 'Insert Block After',
      icon: 'plus-below',
      handler: async (target) => {
        await authoringSystem.addContent('block', {
          type: 'paragraph',
          content: ''
        }, target.metadata.order + 1);
      }
    },
    {
      id: 'change-block-type',
      label: 'Change Type',
      icon: 'swap',
      handler: (target) => {
        // Show block type submenu
      },
      group: 'format'
    },
    {
      id: 'duplicate-block',
      label: 'Duplicate',
      icon: 'copy',
      shortcut: 'Ctrl+D',
      handler: async (target) => {
        const data = await authoringSystem.getData(target.targetId);
        await authoringSystem.addContent('block', data, target.metadata.order + 1);
      }
    },
    {
      id: 'remove-block',
      label: 'Remove Block',
      icon: 'trash',
      shortcut: 'Delete',
      variant: 'danger',
      handler: async (target) => {
        await authoringSystem.removeContent(target.targetId, 'block');
      }
    }
  ],
  
  // Text selection actions
  text: [
    {
      id: 'comment-on-text',
      label: 'Add Comment',
      icon: 'comment',
      handler: async (target) => {
        // Future: Engagement system integration
        dialogSystem.openDrawer({
          position: 'right',
          title: 'Add Comment',
          content: <CommentEditor selection={target.metadata.text} />
        });
      },
      group: 'engagement',
      enabled: () => false  // Deferred for now
    },
    {
      id: 'create-anchor',
      label: 'Create Anchor',
      icon: 'link',
      handler: async (target) => {
        const anchorId = await createAnchor({
          pageId: getCurrentPageId(),
          text: target.metadata.text,
          position: target.bounds
        });
        
        showToast({ message: 'Anchor created', variant: 'success' });
      }
    },
    {
      id: 'link-to-anchor',
      label: 'Link to Anchor...',
      icon: 'link-external',
      handler: (target) => {
        dialogSystem.openModal({
          title: 'Link to Anchor',
          content: <AnchorLinkPicker onSelect={async (anchorId) => {
            await createLink(target, anchorId);
          }} />
        });
      }
    }
  ]
};

Object.entries(documentSceneActions).forEach(([elementType, actions]) => {
  actions.forEach(action => {
    contextActionRegistry.register('document', elementType, action);
  });
});
```

### Blank Space Actions (Document)

```typescript
const documentBlankSpaceActions = [
  {
    id: 'add-paragraph',
    label: 'Add Paragraph',
    icon: 'text',
    shortcut: 'P',
    handler: async () => {
      await authoringSystem.addContent('block', {
        type: 'paragraph',
        content: ''
      });
    },
    group: 'blocks'
  },
  {
    id: 'add-heading',
    label: 'Add Heading',
    icon: 'heading',
    shortcut: 'H',
    handler: async () => {
      await authoringSystem.addContent('block', {
        type: 'heading',
        level: 2,
        content: ''
      });
    },
    group: 'blocks'
  },
  {
    id: 'add-image-block',
    label: 'Add Image',
    icon: 'image',
    shortcut: 'I',
    handler: async () => {
      const file = await openFilePicker({ accept: 'image/*' });
      if (!file) return;
      
      const asset = await uploadImage(file);
      await authoringSystem.addContent('block', {
        type: 'image',
        assetId: asset.id
      });
    },
    group: 'blocks'
  },
  {
    id: 'add-code-block',
    label: 'Add Code Block',
    icon: 'code',
    shortcut: 'C',
    handler: async () => {
      await authoringSystem.addContent('block', {
        type: 'code',
        language: 'typescript',
        content: ''
      });
    },
    group: 'blocks'
  },
  {
    id: 'add-page',
    label: 'Add New Page',
    icon: 'page-plus',
    shortcut: 'Ctrl+N',
    handler: async () => {
      const newPage = await authoringSystem.addContent('page', {
        title: 'New Page',
        blocks: []
      });
      
      navigatorSystem.navigateToItem(newPage, 'page');
    },
    group: 'pages',
    order: 100  // Lower in menu
  }
];

documentBlankSpaceActions.forEach(action => {
  contextActionRegistry.register('document', 'blank', action);
});
```

---

## Graph Scene Actions (Planning Stub)

### Placeholder Actions

```typescript
// Graph scene actions - TBD in design workshop
const graphSceneActions = {
  node: [
    {
      id: 'edit-node',
      label: 'Edit Node',
      icon: 'edit',
      handler: async (target) => {
        // TBD: Node editing interface
      }
    },
    {
      id: 'create-edge',
      label: 'Create Connection',
      icon: 'arrow-right',
      handler: (target) => {
        // TBD: Edge creation mode
      }
    },
    {
      id: 'remove-node',
      label: 'Remove from Scene',
      icon: 'trash',
      variant: 'danger',
      handler: async (target) => {
        // TBD: Node removal (scene only, not core graph)
      }
    }
  ],
  
  edge: [
    {
      id: 'edit-edge',
      label: 'Edit Connection',
      icon: 'edit',
      handler: (target) => {
        // TBD: Edge editing
      }
    },
    {
      id: 'remove-edge',
      label: 'Remove Connection',
      icon: 'trash',
      variant: 'danger',
      handler: async (target) => {
        // TBD: Edge removal
      }
    }
  ],
  
  blank: [
    {
      id: 'add-node',
      label: 'Add Node',
      icon: 'plus-circle',
      handler: (target) => {
        // TBD: Node creation at cursor position
      }
    }
  ]
};

// Note: Will be fully defined in Spec 11 after design workshop
```

---

## Context Menu Component

### Menu Rendering

```typescript
interface ContextMenuProps {
  items: ContextAction[];
  onClose?: () => void;
}

function ContextMenu({ items, onClose }: ContextMenuProps) {
  // Group items
  const grouped = groupActions(items);
  
  return (
    <div
      className="context-menu"
      role="menu"
      aria-label="Context actions"
    >
      {Object.entries(grouped).map(([group, groupItems], groupIndex) => (
        <div key={group}>
          {groupIndex > 0 && <div className="menu-separator" role="separator" />}
          
          {groupItems.map(item => (
            <button
              key={item.id}
              role="menuitem"
              className={`menu-item menu-item-${item.variant || 'default'}`}
              onClick={() => {
                item.action();
                onClose?.();
              }}
            >
              {item.icon && <Icon name={item.icon} />}
              <span className="menu-label">{item.label}</span>
              {item.shortcut && (
                <kbd className="menu-shortcut">{item.shortcut}</kbd>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function groupActions(items: ContextAction[]): Record<string, ContextAction[]> {
  const groups: Record<string, ContextAction[]> = {};
  
  items.forEach(item => {
    const group = item.group || 'default';
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  });
  
  // Sort within groups by order
  Object.values(groups).forEach(group => {
    group.sort((a, b) => (a.order || 0) - (b.order || 0));
  });
  
  return groups;
}
```

---

## Keyboard Accessibility

### Keyboard Navigation in Context Menu

```typescript
function ContextMenu({ items, onClose }: ContextMenuProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(i => Math.min(i + 1, items.length - 1));
          break;
        
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(i => Math.max(i - 1, 0));
          break;
        
        case 'Enter':
        case 'Space':
          event.preventDefault();
          items[focusedIndex].action();
          onClose?.();
          break;
        
        case 'Escape':
          event.preventDefault();
          onClose?.();
          break;
        
        // First letter navigation
        default:
          if (event.key.length === 1) {
            const index = items.findIndex(
              item => item.label.toLowerCase().startsWith(event.key.toLowerCase())
            );
            if (index !== -1) {
              setFocusedIndex(index);
            }
          }
      }
    };
    
    menuRef.current?.addEventListener('keydown', handleKeyDown);
    return () => menuRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [items, focusedIndex, onClose]);
  
  // Auto-focus first item
  useEffect(() => {
    menuRef.current?.querySelector('[role="menuitem"]')?.focus();
  }, []);
  
  return (
    <div ref={menuRef} role="menu" tabIndex={-1}>
      {items.map((item, index) => (
        <button
          key={item.id}
          role="menuitem"
          tabIndex={index === focusedIndex ? 0 : -1}
          aria-current={index === focusedIndex ? 'true' : undefined}
          onClick={() => {
            item.action();
            onClose?.();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
```

### Alternative Keyboard Access

**Toolbar Menu Alternative**:
```typescript
// For users who can't/don't use right-click
function AuthoringToolbar() {
  const { selection } = useSelection();
  
  return (
    <div className="authoring-toolbar">
      <DropdownMenu
        label="Actions"
        icon="menu"
        items={selection
          ? contextActionRegistry.getActions(sceneType, selection)
          : contextActionRegistry.getActions(sceneType, null)
        }
      />
    </div>
  );
}
```

---

## Mobile Support

### Long-Press Detection

```typescript
interface LongPressOptions {
  delay: number;
  moveTolerance: number;
}

function useLongPress(
  callback: (event: TouchEvent) => void,
  options: LongPressOptions = { delay: 500, moveTolerance: 10 }
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  
  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    
    timerRef.current = setTimeout(() => {
      callback(event);
    }, options.delay);
  };
  
  const handleTouchMove = (event: TouchEvent) => {
    if (!startPosRef.current) return;
    
    const touch = event.touches[0];
    const dx = touch.clientX - startPosRef.current.x;
    const dy = touch.clientY - startPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > options.moveTolerance) {
      // Moved too far, cancel long-press
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPosRef.current = null;
  };
  
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
}
```

### Mobile Context Menu

```typescript
function MobileContextMenu({ items, position, onClose }: MobileContextMenuProps) {
  // Bottom sheet on mobile
  return (
    <div className="mobile-context-menu bottom-sheet">
      {/* Drag handle */}
      <div className="drag-handle" />
      
      {/* Menu items */}
      <div className="menu-items">
        {items.map(item => (
          <button
            key={item.id}
            className="mobile-menu-item"
            onClick={() => {
              item.action();
              onClose();
            }}
          >
            {item.icon && <Icon name={item.icon} size={24} />}
            <div className="item-content">
              <div className="item-label">{item.label}</div>
              {item.shortcut && (
                <div className="item-hint">{item.shortcut}</div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {/* Cancel button */}
      <button className="cancel-button" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('ContextActionRegistry', () => {
  it('should register actions for scene types', () => {
    const action: ContextActionDefinition = {
      id: 'test-action',
      label: 'Test',
      handler: jest.fn()
    };
    
    registry.register('card', 'slide', action);
    const actions = registry.getActions('card', mockSlideTarget);
    
    expect(actions).toHaveLength(1);
    expect(actions[0].id).toBe('test-action');
  });
  
  it('should filter by enabled predicate', () => {
    const action: ContextActionDefinition = {
      id: 'conditional',
      label: 'Conditional',
      handler: jest.fn(),
      enabled: (target) => target?.metadata.canEdit === true
    };
    
    registry.register('card', 'slide', action);
    
    const enabledTarget = { metadata: { canEdit: true } };
    const disabledTarget = { metadata: { canEdit: false } };
    
    expect(registry.getActions('card', enabledTarget)).toHaveLength(1);
    expect(registry.getActions('card', disabledTarget)).toHaveLength(0);
  });
  
  it('should return blank space actions when no target', () => {
    registry.register('card', 'blank', blankSpaceAction);
    
    const actions = registry.getActions('card', null);
    
    expect(actions).toContainEqual(
      expect.objectContaining({ id: blankSpaceAction.id })
    );
  });
});

describe('ContextMenu Component', () => {
  it('should render all menu items', () => {
    const items: ContextAction[] = [
      { id: '1', label: 'Action 1', action: jest.fn() },
      { id: '2', label: 'Action 2', action: jest.fn() }
    ];
    
    render(<ContextMenu items={items} />);
    
    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
  });
  
  it('should call action handler on click', () => {
    const handler = jest.fn();
    const items = [{ id: '1', label: 'Test', action: handler }];
    
    render(<ContextMenu items={items} />);
    fireEvent.click(screen.getByText('Test'));
    
    expect(handler).toHaveBeenCalled();
  });
  
  it('should navigate with arrow keys', () => {
    const items = [
      { id: '1', label: 'Item 1', action: jest.fn() },
      { id: '2', label: 'Item 2', action: jest.fn() }
    ];
    
    render(<ContextMenu items={items} />);
    
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    
    expect(screen.getByText('Item 2')).toHaveFocus();
  });
});
```

### Integration Tests

```typescript
describe('Context Menu Integration', () => {
  it('should show context menu on right-click', () => {
    const { container } = render(
      <SceneWithAuthoring sceneId="test-scene" />
    );
    
    fireEvent.contextMenu(container, { clientX: 100, clientY: 100 });
    
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
  
  it('should execute action from context menu', async () => {
    const mockHandler = jest.fn();
    contextActionRegistry.register('card', 'slide', {
      id: 'test',
      label: 'Test Action',
      handler: mockHandler
    });
    
    // Right-click on slide
    fireEvent.contextMenu(slideElement, { clientX: 100, clientY: 100 });
    
    // Click menu item
    fireEvent.click(screen.getByText('Test Action'));
    
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

---

## Acceptance Criteria

- [x] ContextActionRegistry interface defined
- [x] Scene-type and element-type keying
- [x] Enable/disable predicates
- [x] Action grouping and ordering
- [x] Card scene actions complete (text, image, layered, blank)
- [x] Document scene actions complete (block, text, blank)
- [x] Graph scene actions stubbed (for design workshop)
- [x] Integration with Dialog system for rendering
- [x] Keyboard navigation in menus
- [x] Keyboard shortcuts documented
- [x] Long-press support for mobile
- [x] Bottom sheet variant for mobile
- [x] Focus management and accessibility
- [x] Testing strategy with unit and integration tests

**Status**: ✅ Complete - Ready for Spec 06

---

## References

- **Previous**: [Spec 04: Authoring Overlay Framework](./04-authoring-overlay.md)
- **Next**: [Spec 06: Selection & Highlighting Strategies](./06-highlighting-strategies.md)
- **Related**: Dialog system in `shared/src/systems/dialog/`

---

## Changelog

**2025-10-14**: Initial specification created  
**Status**: Ready for stakeholder review

