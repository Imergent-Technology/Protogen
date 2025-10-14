# Spec 08: ToC Drawer Integration

**Initiative**: Authoring-Viewing Unification  
**Date**: October 14, 2025  
**Status**: Planning Phase  
**Type**: UI Component Specification  
**Depends On**: [Spec 03](./03-navigator-enhancements.md), [Spec 07](./07-preview-service.md)

---

## Overview

This specification defines the Table of Contents (ToC) component that integrates into Protogen's existing Toolbar drawer system. The ToC provides multi-level navigation (Deck → Scenes → Slides/Pages) with thumbnail previews and state synchronization with the Navigator.

**Principle**: ToC is the primary navigation aid in authoring mode, always accessible in the left drawer.

---

## Integration with Toolbar System

### Using Existing Drawer Architecture

Protogen's Toolbar system already supports drawers (`shared/src/systems/toolbar/`):

```typescript
// Extend existing drawer configuration
interface ToolbarConfig {
  // Existing fields...
  
  // ✨ NEW: Left drawer configured as ToC
  leftDrawer?: {
    type: 'toc';              // ToC type
    defaultOpen: boolean;     // Open by default in author mode
    width: number;            // 280px typical
    config: ToCConfig;
  };
  
  rightDrawer?: {
    type: 'properties';       // Properties inspector
    defaultOpen: boolean;
    width: number;            // 320px typical
    config: PropertiesConfig;
  };
}

// ToC-specific configuration
interface ToCConfig {
  showThumbnails: boolean;      // Show preview thumbnails
  thumbnailSize: 'xs' | 'sm';   // Which size to use
  expandedByDefault: boolean;   // Expand all nodes initially
  showItemCounts: boolean;      // Show child counts
  enableSearch: boolean;        // Search filter
  syncWithNavigator: boolean;   // Highlight current location
}
```

---

## ToC Tree Structure

### Hierarchical Data Model

```typescript
interface ToCNode {
  id: string;
  type: 'deck' | 'scene' | 'slide' | 'page' | 'section';
  label: string;
  order: number;
  children?: ToCNode[];
  preview?: string;           // Data URL for thumbnail
  metadata?: {
    sceneType?: SceneType;
    itemCount?: number;
    duration?: number;        // For card/video scenes
    wordCount?: number;       // For document scenes
  };
  state?: {
    expanded: boolean;
    selected: boolean;
    current: boolean;         // Current navigator location
  };
}
```

**Example Tree**:
```typescript
const exampleToCTree: ToCNode = {
  id: 'deck-123',
  type: 'deck',
  label: 'Introduction to Protogen',
  order: 0,
  metadata: { itemCount: 15 },
  children: [
    {
      id: 'scene-welcome',
      type: 'scene',
      label: 'Welcome',
      order: 0,
      preview: 'data:image/png;base64,...',
      metadata: { sceneType: 'card', itemCount: 3 },
      children: [
        {
          id: 'slide-1',
          type: 'slide',
          label: 'Title Slide',
          order: 0,
          preview: 'data:image/png;base64,...',
          state: { current: true, selected: true }
        },
        {
          id: 'slide-2',
          type: 'slide',
          label: 'Features',
          order: 1,
          preview: 'data:image/png;base64,...'
        }
      ]
    },
    {
      id: 'scene-guide',
      type: 'scene',
      label: 'User Guide',
      order: 1,
      preview: 'data:image/png;base64,...',
      metadata: { sceneType: 'document', itemCount: 5 },
      children: [
        {
          id: 'page-1',
          type: 'page',
          label: 'Getting Started',
          order: 0,
          preview: 'data:image/png;base64,...',
          metadata: { wordCount: 450 }
        }
      ]
    }
  ]
};
```

---

## ToC Component

### Main ToC Component

```typescript
interface ToCProps {
  deckId?: string;
  sceneId?: string;
  config: ToCConfig;
}

function ToC({ deckId, sceneId, config }: ToCProps) {
  const [tree, setTree] = useState<ToCNode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const { locus } = useNavigator();
  
  // Load ToC structure
  useEffect(() => {
    loadToCStructure(deckId, sceneId).then(setTree);
  }, [deckId, sceneId]);
  
  // Sync with Navigator
  useEffect(() => {
    const currentId = locus.itemId || locus.sceneId || locus.deckId;
    if (currentId && config.syncWithNavigator) {
      // Expand path to current item
      const path = findPathToNode(tree, currentId);
      setExpandedNodes(new Set(path));
    }
  }, [locus, tree, config.syncWithNavigator]);
  
  // Filter by search
  const filteredTree = searchTerm
    ? filterTree(tree, searchTerm)
    : tree;
  
  return (
    <div className="toc-container">
      {/* Search filter */}
      {config.enableSearch && (
        <div className="toc-search">
          <input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="toc-search-input"
          />
        </div>
      )}
      
      {/* Tree view */}
      <div className="toc-tree" role="tree">
        {filteredTree.map(node => (
          <ToCTreeNode
            key={node.id}
            node={node}
            level={0}
            expanded={expandedNodes.has(node.id)}
            onToggle={(id) => toggleNode(id, expandedNodes, setExpandedNodes)}
            onSelect={(node) => handleNodeClick(node)}
            config={config}
          />
        ))}
      </div>
      
      {/* Empty state */}
      {filteredTree.length === 0 && (
        <div className="toc-empty">
          {searchTerm ? 'No results found' : 'No content yet'}
        </div>
      )}
    </div>
  );
}
```

### ToCTreeNode Component

```typescript
interface ToCTreeNodeProps {
  node: ToCNode;
  level: number;
  expanded: boolean;
  onToggle: (id: string) => void;
  onSelect: (node: ToCNode) => void;
  config: ToCConfig;
}

function ToCTreeNode({ node, level, expanded, onToggle, onSelect, config }: ToCTreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isCurrent = node.state?.current;
  const isSelected = node.state?.selected;
  
  return (
    <div
      className="toc-node"
      style={{ paddingLeft: `${level * 16}px` }}
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={isSelected}
      aria-current={isCurrent ? 'location' : undefined}
    >
      {/* Node content */}
      <div
        className={`toc-node-content ${isCurrent ? 'current' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(node)}
      >
        {/* Expand/collapse button */}
        {hasChildren && (
          <button
            className="toc-expand-button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <Icon name={expanded ? 'chevron-down' : 'chevron-right'} />
          </button>
        )}
        
        {/* Thumbnail */}
        {config.showThumbnails && node.preview && (
          <img
            src={node.preview}
            className="toc-thumbnail"
            alt=""
            role="presentation"
            loading="lazy"
          />
        )}
        
        {/* Icon (if no thumbnail) */}
        {!node.preview && (
          <Icon name={getToCIcon(node.type)} className="toc-icon" />
        )}
        
        {/* Label */}
        <span className="toc-label">{node.label}</span>
        
        {/* Item count badge */}
        {config.showItemCounts && node.metadata?.itemCount && (
          <span className="toc-count-badge">
            {node.metadata.itemCount}
          </span>
        )}
      </div>
      
      {/* Children (recursive) */}
      {hasChildren && expanded && (
        <div className="toc-children" role="group">
          {node.children.map(child => (
            <ToCTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expandedNodes.has(child.id)}
              onToggle={onToggle}
              onSelect={onSelect}
              config={config}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getToCIcon(type: string): string {
  switch (type) {
    case 'deck': return 'folder';
    case 'scene': return 'file';
    case 'slide': return 'square';
    case 'page': return 'document';
    case 'section': return 'heading';
    default: return 'circle';
  }
}
```

---

## State Synchronization

### Sync with Navigator

```typescript
class ToCStateSync {
  constructor(
    private navigator: NavigatorSystem,
    private toc: ToCComponent
  ) {
    // Listen to navigator changes
    navigator.on('NAVIGATE', this.handleNavigate.bind(this));
    navigator.on('FOCUS', this.handleFocus.bind(this));
    
    // Listen to ToC changes
    toc.on('item-clicked', this.handleToCClick.bind(this));
  }
  
  private handleNavigate(payload: NavigatePayload): void {
    // Update ToC to reflect current location
    const currentId = payload.itemId || payload.sceneId || payload.deckId;
    if (currentId) {
      this.toc.setCurrentItem(currentId);
      this.toc.expandPathTo(currentId);
    }
  }
  
  private handleFocus(payload: FocusPayload): void {
    // Highlight focused item in ToC
    this.toc.setCurrentItem(payload.itemId || payload.sceneId);
  }
  
  private handleToCClick(node: ToCNode): void {
    // Navigate when ToC item clicked
    switch (node.type) {
      case 'deck':
        this.navigator.navigateToDeck(node.id);
        break;
      case 'scene':
        this.navigator.navigateToScene(node.id);
        break;
      case 'slide':
      case 'page':
        this.navigator.navigateToItem(node.id, node.type);
        break;
    }
    
    // Emit event
    this.navigator.emit('TOC_ITEM_CLICKED', {
      itemId: node.id,
      itemType: node.type,
      modifiers: {
        ctrl: false,
        shift: false,
        alt: false
      }
    });
  }
}
```

---

## Preview Integration

### Loading ToC Thumbnails

```typescript
function useToCPreviews(nodes: ToCNode[], size: PreviewSize = 'xs'): Map<string, string> {
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  
  useEffect(() => {
    // Flatten tree to get all nodes with preview capability
    const flatNodes = flattenTree(nodes);
    const targets: PreviewTarget[] = flatNodes
      .filter(node => node.type !== 'deck')  // Decks don't have previews
      .map(node => ({
        type: node.type as 'scene' | 'slide' | 'page',
        [node.type + 'Id']: node.id
      }));
    
    // Load batch of previews
    if (targets.length > 0) {
      previewService.generateBatch(targets, size)
        .then(results => setPreviews(results));
    }
  }, [nodes, size]);
  
  return previews;
}

// Update ToC nodes with preview data URLs
function enhanceToCWithPreviews(
  tree: ToCNode[],
  previews: Map<string, string>
): ToCNode[] {
  return tree.map(node => ({
    ...node,
    preview: previews.get(node.id) || node.preview,
    children: node.children
      ? enhanceToCWithPreviews(node.children, previews)
      : undefined
  }));
}
```

---

## Keyboard Navigation

### ToC Keyboard Shortcuts

| Key | Action | Behavior |
|-----|--------|----------|
| `↑` | Previous item | Move selection up in tree |
| `↓` | Next item | Move selection down in tree |
| `→` | Expand | Expand selected node (if has children) |
| `←` | Collapse | Collapse selected node (if expanded) |
| `Enter` | Navigate | Navigate to selected item |
| `Space` | Toggle expand | Toggle expansion of selected node |
| `Home` | First item | Jump to first item in tree |
| `End` | Last item | Jump to last item in tree |
| `Ctrl+F` | Search | Focus search input |
| `/` | Search | Focus search input (alternative) |
| `Escape` | Clear/Close | Clear search or close ToC |

### Implementation

```typescript
function ToC({ config }: ToCProps) {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!focusedNodeId) return;
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          focusPreviousNode();
          break;
        
        case 'ArrowDown':
          event.preventDefault();
          focusNextNode();
          break;
        
        case 'ArrowRight':
          event.preventDefault();
          expandNode(focusedNodeId);
          break;
        
        case 'ArrowLeft':
          event.preventDefault();
          collapseNode(focusedNodeId);
          break;
        
        case 'Enter':
          event.preventDefault();
          navigateToNode(focusedNodeId);
          break;
        
        case 'Home':
          event.preventDefault();
          focusFirstNode();
          break;
        
        case 'End':
          event.preventDefault();
          focusLastNode();
          break;
        
        case '/':
        case 'f':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            focusSearch();
          }
          break;
      }
    };
    
    treeRef.current?.addEventListener('keydown', handleKeyDown);
    return () => treeRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [focusedNodeId]);
  
  // ... rest of component
}
```

---

## Mobile Drawer

### Single Drawer with Tabs

On mobile, combine left and right drawers into single drawer with tabs:

```typescript
function MobileDrawer() {
  const [activeTab, setActiveTab] = useState<'toc' | 'properties'>('toc');
  const { mode } = useNavigator();
  
  if (mode !== 'author') return null;
  
  return (
    <Drawer
      position="bottom"  // Bottom drawer on mobile
      height="60vh"
      className="mobile-authoring-drawer"
    >
      {/* Tab buttons */}
      <div className="drawer-tabs">
        <button
          className={`tab ${activeTab === 'toc' ? 'active' : ''}`}
          onClick={() => setActiveTab('toc')}
          aria-selected={activeTab === 'toc'}
        >
          <Icon name="list" />
          <span>Contents</span>
        </button>
        
        <button
          className={`tab ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
          aria-selected={activeTab === 'properties'}
        >
          <Icon name="settings" />
          <span>Properties</span>
        </button>
      </div>
      
      {/* Tab content */}
      <div className="drawer-content">
        {activeTab === 'toc' && <ToC config={tocConfig} />}
        {activeTab === 'properties' && <PropertyInspector />}
      </div>
    </Drawer>
  );
}
```

### Mobile Gestures

```typescript
// Swipe between tabs
function useTouchSwipe(onSwipe: (direction: 'left' | 'right') => void) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    const swipeThreshold = 50;
    if (Math.abs(diff) > swipeThreshold) {
      onSwipe(diff > 0 ? 'left' : 'right');
    }
    
    setTouchStart(null);
  };
  
  return { handleTouchStart, handleTouchEnd };
}
```

---

## ToC Actions

### Additional ToC Features

```typescript
interface ToCActions {
  // Expand/collapse all
  expandAll(): void;
  collapseAll(): void;
  
  // Jump to current
  scrollToCurrent(): void;
  
  // Filter by type
  filterByType(type: 'scene' | 'slide' | 'page'): void;
  clearFilter(): void;
  
  // Refresh structure
  refresh(): Promise<void>;
}

function ToCActionsMenu() {
  const { expandAll, collapseAll, scrollToCurrent, refresh } = useToCActions();
  
  return (
    <DropdownMenu
      trigger={<IconButton icon="more-vertical" />}
      items={[
        {
          id: 'expand-all',
          label: 'Expand All',
          icon: 'unfold',
          action: expandAll
        },
        {
          id: 'collapse-all',
          label: 'Collapse All',
          icon: 'fold',
          action: collapseAll
        },
        { type: 'separator' },
        {
          id: 'scroll-to-current',
          label: 'Scroll to Current',
          icon: 'locate',
          action: scrollToCurrent
        },
        {
          id: 'refresh',
          label: 'Refresh',
          icon: 'refresh',
          action: refresh
        }
      ]}
    />
  );
}
```

---

## Performance Optimization

### Virtual Scrolling

For large ToCs (100+ items):

```typescript
import { FixedSizeList } from 'react-window';

function VirtualToC({ nodes }: VirtualToCProps) {
  // Flatten tree for virtual list
  const flattenedNodes = useMemo(() => {
    return flattenTreeForVirtualization(nodes, expandedNodes);
  }, [nodes, expandedNodes]);
  
  return (
    <FixedSizeList
      height={600}
      itemCount={flattenedNodes.length}
      itemSize={40}  // Height per item
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ToCTreeNode
            node={flattenedNodes[index]}
            level={flattenedNodes[index].level}
            // ... other props
          />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### Lazy Preview Loading

```typescript
function ToCTreeNode({ node, config }: ToCTreeNodeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Intersection observer for lazy loading
  useEffect(() => {
    if (!config.showThumbnails) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: '50px' }  // Start loading 50px before visible
    );
    
    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }
    
    return () => observer.disconnect();
  }, [config.showThumbnails]);
  
  // Only load preview when visible
  const preview = usePreview(
    isVisible ? { type: node.type, [node.type + 'Id']: node.id } : null,
    config.thumbnailSize
  );
  
  return (
    <div ref={nodeRef} className="toc-node">
      {preview && <img src={preview} />}
      {/* ... rest of node */}
    </div>
  );
}
```

---

## Accessibility

### ARIA Tree Pattern

```typescript
function ToC({ config }: ToCProps) {
  return (
    <div
      role="tree"
      aria-label="Table of contents"
      aria-multiselectable="false"
    >
      {nodes.map(node => (
        <ToCTreeNode
          key={node.id}
          node={node}
          role="treeitem"
          aria-level={node.level}
          aria-setsize={getSiblingCount(node)}
          aria-posinset={node.order + 1}
          aria-expanded={node.children ? expanded : undefined}
        />
      ))}
    </div>
  );
}
```

### Screen Reader Announcements

```typescript
// Announce navigation to screen readers
function announceNavigation(node: ToCNode) {
  const message = formatNavigationAnnouncement(node);
  
  const liveRegion = document.getElementById('aria-live-navigation');
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}

function formatNavigationAnnouncement(node: ToCNode): string {
  switch (node.type) {
    case 'scene':
      return `Navigated to scene: ${node.label}. ${node.metadata?.itemCount || 0} items.`;
    case 'slide':
      return `Navigated to slide ${node.order + 1}: ${node.label}.`;
    case 'page':
      return `Navigated to page: ${node.label}.`;
    default:
      return `Navigated to ${node.label}.`;
  }
}
```

---

## Testing Strategy

### Component Tests

```typescript
describe('ToC Component', () => {
  it('should render tree structure', () => {
    const tree = createMockToCTree();
    render(<ToC tree={tree} config={defaultConfig} />);
    
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('User Guide')).toBeInTheDocument();
  });
  
  it('should expand/collapse nodes', () => {
    const tree = createMockToCTree();
    render(<ToC tree={tree} config={defaultConfig} />);
    
    const expandButton = screen.getByLabelText('Expand');
    fireEvent.click(expandButton);
    
    // Children should now be visible
    expect(screen.getByText('Title Slide')).toBeInTheDocument();
  });
  
  it('should navigate on item click', () => {
    const tree = createMockToCTree();
    render(<ToC tree={tree} config={defaultConfig} />);
    
    const slideItem = screen.getByText('Title Slide');
    fireEvent.click(slideItem);
    
    expect(navigatorSystem.navigateToItem).toHaveBeenCalledWith(
      'slide-1',
      'slide'
    );
  });
  
  it('should show thumbnails when configured', async () => {
    const config = { ...defaultConfig, showThumbnails: true };
    const tree = createMockToCTree();
    
    render(<ToC tree={tree} config={config} />);
    
    await waitFor(() => {
      const thumbnails = screen.getAllByRole('presentation');
      expect(thumbnails.length).toBeGreaterThan(0);
    });
  });
});

describe('ToC Keyboard Navigation', () => {
  it('should navigate with arrow keys', () => {
    render(<ToC tree={mockTree} config={defaultConfig} />);
    
    const tree = screen.getByRole('tree');
    
    // Arrow down
    fireEvent.keyDown(tree, { key: 'ArrowDown' });
    expect(getFirstNode()).toHaveFocus();
    
    // Arrow down again
    fireEvent.keyDown(tree, { key: 'ArrowDown' });
    expect(getSecondNode()).toHaveFocus();
  });
  
  it('should navigate on Enter key', () => {
    render(<ToC tree={mockTree} config={defaultConfig} />);
    
    const firstNode = screen.getAllByRole('treeitem')[0];
    firstNode.focus();
    
    fireEvent.keyDown(firstNode, { key: 'Enter' });
    
    expect(navigatorSystem.navigateToScene).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
describe('ToC Integration', () => {
  it('should sync with navigator state', () => {
    render(<ToC tree={mockTree} config={defaultConfig} />);
    
    // Navigate using navigator
    navigatorSystem.navigateToItem('slide-2', 'slide');
    
    // ToC should highlight current item
    const currentItem = screen.getByText('Slide 2');
    expect(currentItem).toHaveClass('current');
  });
  
  it('should load previews for visible items', async () => {
    render(<ToC tree={mockTree} config={{ showThumbnails: true }} />);
    
    await waitFor(() => {
      const thumbnails = screen.getAllByRole('presentation');
      expect(thumbnails).not.toHaveLength(0);
    });
    
    // Verify preview service was called
    expect(previewService.generateBatch).toHaveBeenCalled();
  });
});
```

---

## Acceptance Criteria

- [x] ToC component integrates with existing Toolbar drawer system
- [x] Tree structure: Deck → Scenes → Slides/Pages
- [x] ToCNode data model with type, label, children, preview
- [x] State synchronization with Navigator system
- [x] Preview thumbnail integration (XS size by default)
- [x] Keyboard navigation (arrow keys, Enter, Home/End)
- [x] Search/filter functionality
- [x] Expand/collapse nodes
- [x] Mobile single drawer with tabs
- [x] Performance optimization (virtual scrolling, lazy loading)
- [x] Accessibility (ARIA tree, screen reader announcements)
- [x] ToC actions menu (expand all, collapse all, refresh)
- [x] Testing strategy with component and integration tests

**Status**: ✅ Complete - Ready for Spec 08a

---

## References

- **Previous**: [Spec 07: Preview Service Specification](./07-preview-service.md)
- **Next**: [Spec 08a: Preview Carousel Widget](./08a-preview-carousel.md)
- **Related**: Toolbar system in `shared/src/systems/toolbar/`

---

## Changelog

**2025-10-14**: Initial specification created  
**Status**: Ready for stakeholder review

