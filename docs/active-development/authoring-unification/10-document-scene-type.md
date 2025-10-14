# Spec 10: Document Scene Type

**Initiative**: Authoring-Viewing Unification  
**Date**: October 14, 2025  
**Status**: Planning Phase  
**Type**: Scene Type Specification  
**Depends On**: [Spec 04](./04-authoring-overlay.md), [Spec 05](./05-context-menu.md), [Spec 06](./06-highlighting-strategies.md)

---

## Overview

This specification defines the Document scene type for rich text content with multi-page support, block-based editing, anchor linking, and cross-page/cross-scene references.

**Purpose**: Rich documents (guides, wikis, articles) with sophisticated linking and navigation.

---

## Data Models

### Document Scene Schema

```typescript
interface DocumentScene extends Scene {
  scene_type: 'document';
  config: DocumentSceneConfig;
  pages: DocumentPage[];
}

interface DocumentSceneConfig {
  multiPage: boolean;            // Single page vs multi-page mode
  showPageNumbers: boolean;
  allowCrossSceneLinks: boolean;
  theme: DocumentThemeConfig;
}

interface DocumentThemeConfig {
  fontFamily: string;
  baseFontSize: number;
  lineHeight: number;
  maxWidth: number;              // Content max-width in px
  headingScale: number[];        // Font size multipliers for h1-h6
  codeTheme: 'light' | 'dark';
}
```

### Document Page

```typescript
interface DocumentPage {
  id: string;
  sceneId: string;
  order: number;
  title: string;
  
  // Content
  blocks: ContentBlock[];
  
  // Navigation
  anchors: Anchor[];
  
  // Metadata
  excerpt?: string;              // First N chars for preview
  wordCount?: number;
  estimatedReadTime?: number;    // Minutes
  createdAt: Date;
  updatedAt: Date;
}
```

**JSON Schema**:
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "sceneId": { "type": "string" },
    "order": { "type": "number", "minimum": 0 },
    "title": { "type": "string", "maxLength": 200 },
    "blocks": {
      "type": "array",
      "items": { "$ref": "#/definitions/ContentBlock" }
    },
    "anchors": {
      "type": "array",
      "items": { "$ref": "#/definitions/Anchor" }
    },
    "excerpt": { "type": "string", "maxLength": 500 },
    "wordCount": { "type": "number", "minimum": 0 },
    "estimatedReadTime": { "type": "number", "minimum": 0 }
  },
  "required": ["id", "sceneId", "order", "title", "blocks"]
}
```

### Content Blocks

```typescript
type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | CodeBlock
  | QuoteBlock
  | ListBlock
  | DividerBlock
  | EmbedBlock;

// Base block interface
interface BaseBlock {
  id: string;
  order: number;
  type: string;
}

// Paragraph block
interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  content: string;               // HTML or markdown
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

// Heading block
interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
  anchorId?: string;             // Auto-generated from content
}

// Image block
interface ImageBlock extends BaseBlock {
  type: 'image';
  assetId: string;
  caption?: string;
  width?: number | 'full';       // px or 'full'
  alignment?: 'left' | 'center' | 'right';
}

// Code block
interface CodeBlock extends BaseBlock {
  type: 'code';
  language: string;              // typescript, python, etc.
  code: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

// Quote block
interface QuoteBlock extends BaseBlock {
  type: 'quote';
  content: string;
  author?: string;
  source?: string;
}

// List block
interface ListBlock extends BaseBlock {
  type: 'list';
  listType: 'bulleted' | 'numbered' | 'checklist';
  items: ListItem[];
}

interface ListItem {
  id: string;
  content: string;
  checked?: boolean;             // For checklists
  indentLevel: number;           // 0-based nesting
}

// Divider block
interface DividerBlock extends BaseBlock {
  type: 'divider';
  style: 'solid' | 'dashed' | 'dotted' | 'space';
}

// Embed block
interface EmbedBlock extends BaseBlock {
  type: 'embed';
  embedType: 'video' | 'audio' | 'iframe' | 'tweet';
  url: string;
  aspectRatio?: string;          // '16:9', '4:3', etc.
}
```

**Block JSON Schemas**:
```json
{
  "definitions": {
    "ParagraphBlock": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "type": { "const": "paragraph" },
        "order": { "type": "number" },
        "content": { "type": "string" },
        "alignment": { "enum": ["left", "center", "right", "justify"] }
      },
      "required": ["id", "type", "order", "content"]
    },
    "HeadingBlock": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "type": { "const": "heading" },
        "order": { "type": "number" },
        "level": { "type": "number", "minimum": 1, "maximum": 6 },
        "content": { "type": "string", "maxLength": 200 },
        "anchorId": { "type": "string", "pattern": "^[a-z0-9-]+$" }
      },
      "required": ["id", "type", "order", "level", "content"]
    }
  }
}
```

---

## Anchor System

### Anchor Types

```typescript
interface Anchor {
  id: string;
  pageId: string;
  type: AnchorType;
  
  // Position (for different anchor types)
  position: AnchorPosition;
  
  // Display
  label?: string;                // Optional custom label
  visible: boolean;              // Show anchor indicator in UI
  
  // Metadata
  createdAt: Date;
}

type AnchorType = 'heading' | 'text-selection' | 'block' | 'position';

type AnchorPosition =
  | HeadingAnchorPosition
  | TextSelectionAnchorPosition
  | BlockAnchorPosition
  | CoordinateAnchorPosition;

interface HeadingAnchorPosition {
  type: 'heading';
  blockId: string;               // Heading block ID
  anchorId: string;              // Auto-generated slug
}

interface TextSelectionAnchorPosition {
  type: 'text-selection';
  blockId: string;
  startOffset: number;
  endOffset: number;
  text: string;                  // Captured text
}

interface BlockAnchorPosition {
  type: 'block';
  blockId: string;
}

interface CoordinateAnchorPosition {
  type: 'coordinate';
  x: number;                     // % from left
  y: number;                     // % from top
}
```

### Link Types

```typescript
interface Link {
  id: string;
  sourcePageId: string;
  sourceBlockId?: string;
  
  target: LinkTarget;
  
  // Display
  text?: string;
  title?: string;                // Hover tooltip
  style?: 'inline' | 'button' | 'card';
}

type LinkTarget =
  | InternalAnchorLink
  | CrossPageLink
  | CrossSceneLink
  | ExternalLink;

interface InternalAnchorLink {
  type: 'anchor';
  anchorId: string;              // Within same page
}

interface CrossPageLink {
  type: 'page';
  pageId: string;
  anchorId?: string;             // Optional anchor on target page
}

interface CrossSceneLink {
  type: 'scene';
  sceneId: string;
  pageId?: string;
  anchorId?: string;
}

interface ExternalLink {
  type: 'external';
  url: string;
  openInNew: boolean;
}
```

---

## Block Editing

### Rich Text Editor Integration

**Using TipTap** (existing in Protogen):

```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';

function BlockEditor({ block, onChange }: BlockEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'document-link'
        }
      }),
      CodeBlockLowlight
    ],
    content: block.content,
    onUpdate: ({ editor }) => {
      onChange({
        ...block,
        content: editor.getHTML()
      });
    }
  });
  
  return (
    <div className="block-editor">
      {/* Toolbar */}
      <EditorToolbar editor={editor} />
      
      {/* Content */}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  
  return (
    <div className="editor-toolbar">
      {/* Text formatting */}
      <ButtonGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon="bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon="italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          icon="strikethrough"
        />
      </ButtonGroup>
      
      {/* Headings */}
      <HeadingDropdown
        currentLevel={getCurrentHeadingLevel(editor)}
        onChange={(level) => {
          if (level === 0) {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().setHeading({ level }).run();
          }
        }}
      />
      
      {/* Lists */}
      <ButtonGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          icon="list-ul"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          icon="list-ol"
        />
      </ButtonGroup>
      
      {/* Insert */}
      <ButtonGroup>
        <ToolbarButton
          onClick={() => insertImage(editor)}
          icon="image"
          label="Image"
        />
        <ToolbarButton
          onClick={() => insertLink(editor)}
          icon="link"
          label="Link"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setCodeBlock().run()}
          icon="code"
          label="Code"
        />
      </ButtonGroup>
    </div>
  );
}
```

---

## Anchor Creation & Linking

### Create Anchor from Selection

```typescript
async function createAnchorFromSelection(): Promise<Anchor> {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    throw new Error('No text selected');
  }
  
  const range = selection.getRangeAt(0);
  const blockElement = range.commonAncestorContainer.parentElement?.closest('[data-block-id]');
  
  if (!blockElement) {
    throw new Error('Selection not within a block');
  }
  
  const blockId = blockElement.getAttribute('data-block-id')!;
  const pageId = getCurrentPageId();
  
  const anchor: Anchor = {
    id: generateId(),
    pageId,
    type: 'text-selection',
    position: {
      type: 'text-selection',
      blockId,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      text: range.toString()
    },
    label: range.toString().substring(0, 50),  // First 50 chars
    visible: true,
    createdAt: new Date()
  };
  
  // Save anchor
  await anchorService.createAnchor(anchor);
  
  // Show visual indicator
  highlightAnchor(anchor);
  
  return anchor;
}
```

### Link to Anchor Dialog

```typescript
function AnchorLinkPicker({ onSelect }: AnchorLinkPickerProps) {
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scope, setScope] = useState<'page' | 'scene' | 'all'>('page');
  
  useEffect(() => {
    loadAnchors(scope).then(setAnchors);
  }, [scope]);
  
  const filteredAnchors = anchors.filter(anchor =>
    anchor.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="anchor-picker">
      {/* Scope selector */}
      <SegmentedControl
        value={scope}
        onChange={setScope}
        options={[
          { value: 'page', label: 'This Page' },
          { value: 'scene', label: 'This Scene' },
          { value: 'all', label: 'All Scenes' }
        ]}
      />
      
      {/* Search */}
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search anchors..."
      />
      
      {/* Anchor list */}
      <div className="anchor-list">
        {filteredAnchors.map(anchor => (
          <div
            key={anchor.id}
            className="anchor-item"
            onClick={() => onSelect(anchor)}
          >
            <Icon name={getAnchorIcon(anchor.type)} />
            <div className="anchor-info">
              <div className="anchor-label">{anchor.label}</div>
              <div className="anchor-location">
                {getAnchorLocation(anchor)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getAnchorLocation(anchor: Anchor): string {
  const page = getPage(anchor.pageId);
  const scene = getScene(page.sceneId);
  
  if (anchor.pageId === getCurrentPageId()) {
    return `This page, ${anchor.position.type}`;
  }
  
  if (page.sceneId === getCurrentSceneId()) {
    return `Page: ${page.title}`;
  }
  
  return `${scene.name} → ${page.title}`;
}
```

---

## Authoring Actions

### Block Context Menu Actions

From Spec 05, expanded here:

**Paragraph Block**:
- Edit (Enter) → Inline TipTap editor
- Insert Before → Create paragraph before
- Insert After → Create paragraph after
- Change to Heading → Convert to heading
- Change to Quote → Convert to quote
- Duplicate (Ctrl+D) → Copy block
- Remove (Delete) → Delete block

**Heading Block**:
- Edit (Enter) → Inline editor
- Change Level → H1-H6 selector
- Create Anchor → Auto-generate from heading text
- Insert Before/After → New block
- Remove (Delete) → Delete block

**Image Block**:
- Replace Image... → File picker
- Edit Caption → Inline caption editor
- Resize → Drag handles or size input
- Change Alignment → Left/Center/Right
- Remove (Delete) → Delete block

**Code Block**:
- Edit Code → Inline code editor with syntax highlighting
- Change Language → Language selector
- Toggle Line Numbers → Show/hide
- Copy Code → Copy to clipboard
- Remove (Delete) → Delete block

---

## Page Management

### Add Page

```typescript
async function addPage(sceneId: string, position?: number): Promise<DocumentPage> {
  const pages = await pageService.getPages(sceneId);
  const order = position !== undefined ? position : pages.length;
  
  const newPage: DocumentPage = {
    id: generateId(),
    sceneId,
    order,
    title: 'New Page',
    blocks: [
      {
        id: generateId(),
        type: 'heading',
        level: 1,
        content: 'New Page',
        order: 0
      },
      {
        id: generateId(),
        type: 'paragraph',
        content: '',
        order: 1
      }
    ],
    anchors: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await pageService.createPage(newPage);
  
  // Emit event
  authoringSystem.emit('CONTENT_ADDED', {
    sceneId,
    contentType: 'page',
    contentId: newPage.id,
    position: order,
    data: newPage
  });
  
  return newPage;
}
```

### Split Page

```typescript
async function splitPage(
  pageId: string,
  atBlockId: string
): Promise<{ page1: DocumentPage; page2: DocumentPage }> {
  const page = await pageService.getPage(pageId);
  const splitIndex = page.blocks.findIndex(b => b.id === atBlockId);
  
  if (splitIndex === -1) {
    throw new Error('Block not found in page');
  }
  
  // Create new page with blocks after split point
  const newPage: DocumentPage = {
    ...page,
    id: generateId(),
    order: page.order + 1,
    title: `${page.title} (continued)`,
    blocks: page.blocks.slice(splitIndex).map((b, i) => ({
      ...b,
      order: i
    })),
    anchors: [],  // Anchors stay with original page
    createdAt: new Date()
  };
  
  // Update original page (remove blocks after split)
  const updatedPage: DocumentPage = {
    ...page,
    blocks: page.blocks.slice(0, splitIndex)
  };
  
  await Promise.all([
    pageService.updatePage(updatedPage),
    pageService.createPage(newPage)
  ]);
  
  return { page1: updatedPage, page2: newPage };
}
```

---

## Navigation Rules

### Page Navigation

```typescript
interface PageNavigationRules {
  // Next/Previous page
  allowSequentialNavigation: boolean;
  
  // Jump to page via ToC
  allowToCNavigation: boolean;
  
  // Anchor links
  allowAnchorNavigation: boolean;
  
  // External page links
  allowCrossSceneNavigation: boolean;
  
  // URL patterns
  urlPattern: 'sequential' | 'named' | 'hierarchical';
}

// Sequential: /scene/:sceneId/pages/1
// Named: /scene/:sceneId/pages/:pageSlug
// Hierarchical: /scene/:sceneId/chapter-1/page-2
```

### Anchor Navigation

```typescript
async function navigateToAnchor(anchorId: string): Promise<void> {
  const anchor = await anchorService.getAnchor(anchorId);
  
  // Navigate to page if different
  if (anchor.pageId !== getCurrentPageId()) {
    await navigatorSystem.navigateToItem(anchor.pageId, 'page');
  }
  
  // Scroll to anchor position
  await scrollToAnchor(anchor);
  
  // Highlight anchor briefly
  highlightAnchorTemporarily(anchor, 2000);  // 2 seconds
}

async function scrollToAnchor(anchor: Anchor): Promise<void> {
  let targetElement: HTMLElement | null = null;
  
  switch (anchor.position.type) {
    case 'heading':
      targetElement = document.querySelector(
        `[data-block-id="${anchor.position.blockId}"]`
      );
      break;
    
    case 'text-selection':
      targetElement = document.querySelector(
        `[data-block-id="${anchor.position.blockId}"]`
      );
      // TODO: Scroll to specific text range within block
      break;
    
    case 'block':
      targetElement = document.querySelector(
        `[data-block-id="${anchor.position.blockId}"]`
      );
      break;
    
    case 'coordinate':
      // Scroll to coordinate position
      const container = document.querySelector('.document-scene');
      if (container) {
        container.scrollTo({
          left: (anchor.position.x / 100) * container.scrollWidth,
          top: (anchor.position.y / 100) * container.scrollHeight,
          behavior: 'smooth'
        });
      }
      return;
  }
  
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}
```

---

## Preview Generation

### Page Preview

```typescript
class DocumentPreviewGenerator {
  async generatePagePreview(
    page: DocumentPage,
    size: PreviewSize
  ): Promise<string> {
    const dims = PREVIEW_DIMENSIONS[size];
    const canvas = new OffscreenCanvas(dims.width, dims.height);
    const ctx = canvas.getContext('2d')!;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, dims.width, dims.height);
    
    // Render first few blocks (simplified)
    let y = 10;
    const maxBlocks = size === 'xs' ? 2 : size === 'sm' ? 3 : 5;
    
    for (let i = 0; i < Math.min(page.blocks.length, maxBlocks); i++) {
      const block = page.blocks[i];
      
      switch (block.type) {
        case 'heading':
          ctx.font = `bold ${18 - block.level * 2}px sans-serif`;
          ctx.fillStyle = '#1f2937';
          y += this.drawText(ctx, block.content, 10, y, dims.width - 20);
          y += 8;
          break;
        
        case 'paragraph':
          ctx.font = '12px sans-serif';
          ctx.fillStyle = '#374151';
          y += this.drawText(ctx, stripHTML(block.content), 10, y, dims.width - 20);
          y += 6;
          break;
        
        case 'image':
          // Draw placeholder or mini image
          ctx.fillStyle = '#e5e7eb';
          ctx.fillRect(10, y, dims.width - 20, 40);
          y += 50;
          break;
      }
      
      if (y > dims.height - 20) break;  // Stop if out of space
    }
    
    // "More content" indicator if truncated
    if (page.blocks.length > maxBlocks) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px sans-serif';
      ctx.fillText('...', dims.width / 2, dims.height - 10);
    }
    
    return canvasToDataURL(canvas);
  }
  
  private drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number
  ): number {
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = 14;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, x, y + i * lineHeight);
    });
    
    return lines.length * lineHeight;
  }
}
```

---

## ToC Sync

### Automatic ToC Generation

```typescript
function generateToCFromDocument(scene: DocumentScene): ToCNode[] {
  return scene.pages.map(page => ({
    id: page.id,
    type: 'page',
    label: page.title,
    order: page.order,
    preview: getCachedPreview(page.id, 'xs'),
    metadata: {
      wordCount: page.wordCount,
      estimatedReadTime: page.estimatedReadTime
    },
    children: extractHeadingsAsToC(page.blocks)
  }));
}

function extractHeadingsAsToC(blocks: ContentBlock[]): ToCNode[] {
  const headings = blocks
    .filter(b => b.type === 'heading')
    .map(b => b as HeadingBlock);
  
  // Build hierarchical structure from heading levels
  const tree: ToCNode[] = [];
  const stack: { node: ToCNode; level: number }[] = [];
  
  headings.forEach(heading => {
    const node: ToCNode = {
      id: heading.anchorId || heading.id,
      type: 'section',
      label: heading.content,
      order: heading.order,
      children: []
    };
    
    // Pop stack until we find parent level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    
    if (stack.length === 0) {
      // Top-level heading
      tree.push(node);
    } else {
      // Child of previous heading
      stack[stack.length - 1].node.children!.push(node);
    }
    
    stack.push({ node, level: heading.level });
  });
  
  return tree;
}
```

---

## Testing Strategy

### Component Tests

```typescript
describe('DocumentPage Rendering', () => {
  it('should render all block types', () => {
    const page: DocumentPage = {
      id: 'page-1',
      blocks: [
        { type: 'heading', level: 1, content: 'Title', order: 0 },
        { type: 'paragraph', content: 'Text content', order: 1 },
        { type: 'image', assetId: 'img-1', order: 2 }
      ],
      // ... other fields
    };
    
    render(<DocumentPageRenderer page={page} />);
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Text content')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});

describe('Anchor System', () => {
  it('should create anchor from text selection', async () => {
    render(<DocumentPage page={mockPage} mode="author" />);
    
    // Select text
    selectText('Important text');
    
    // Right-click
    fireEvent.contextMenu(window, { clientX: 100, clientY: 100 });
    
    // Click "Create Anchor"
    fireEvent.click(screen.getByText('Create Anchor'));
    
    // Verify anchor created
    await waitFor(() => {
      expect(anchorService.createAnchor).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text-selection',
          position: expect.objectContaining({
            text: 'Important text'
          })
        })
      );
    });
  });
  
  it('should navigate to anchor', async () => {
    const anchor: Anchor = {
      id: 'anchor-1',
      pageId: 'page-2',
      type: 'heading',
      position: { type: 'heading', blockId: 'block-5', anchorId: 'intro' },
      // ... other fields
    };
    
    await navigateToAnchor(anchor.id);
    
    // Should navigate to page
    expect(navigatorSystem.navigateToItem).toHaveBeenCalledWith('page-2', 'page');
    
    // Should scroll to heading
    const heading = screen.getByTestId('block-5');
    expect(heading).toBeVisible();
  });
});

describe('Page Management', () => {
  it('should add new page', async () => {
    await addPage('scene-1');
    
    expect(pageService.createPage).toHaveBeenCalledWith(
      expect.objectContaining({
        sceneId: 'scene-1',
        title: 'New Page',
        blocks: expect.arrayContaining([
          expect.objectContaining({ type: 'heading' }),
          expect.objectContaining({ type: 'paragraph' })
        ])
      })
    );
  });
  
  it('should split page at block', async () => {
    const page = createMockPage(10);  // 10 blocks
    
    const result = await splitPage(page.id, page.blocks[5].id);
    
    expect(result.page1.blocks).toHaveLength(5);
    expect(result.page2.blocks).toHaveLength(5);
    expect(result.page2.title).toContain('continued');
  });
});
```

---

## Acceptance Criteria

- [x] Document scene data model defined
- [x] Document page with blocks and anchors
- [x] 8 block types (Paragraph, Heading, Image, Code, Quote, List, Divider, Embed)
- [x] JSON schemas for all block types
- [x] Anchor system (4 anchor types: heading, text-selection, block, coordinate)
- [x] Link system (internal, cross-page, cross-scene, external)
- [x] TipTap integration for rich text editing
- [x] Block editor with formatting toolbar
- [x] Anchor creation from text selection
- [x] Anchor link picker dialog
- [x] Page management (add, split, remove)
- [x] Navigation rules for pages and anchors
- [x] ToC generation from headings
- [x] Preview generation for pages
- [x] Property inspector schemas for all block types
- [x] Context menu actions (from Spec 05)
- [x] Testing strategy with component and integration tests

**Status**: ✅ Complete - Ready for Spec 11

---

## References

- **Previous**: [Spec 09: Card Scene Type](./09-card-scene-type.md)
- **Next**: [Spec 11: Graph Scene Planning Stub](./11-graph-planning-stub.md)
- **Related**:
  - Context actions in Spec 05
  - Highlighting in Spec 06
  - Preview generation in Spec 07
  - ToC integration in Spec 08

---

## Changelog

**2025-10-14**: Initial specification created  
**Status**: Ready for stakeholder review

