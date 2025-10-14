# Spec 07: Preview Service Specification

**Initiative**: Authoring-Viewing Unification  
**Date**: October 14, 2025  
**Status**: Planning Phase  
**Type**: Interaction System Specification  
**Depends On**: [Spec 01](./01-module-integration.md), [Spec 02](./02-event-taxonomy.md)

---

## Overview

This specification defines the Preview Service for generating and managing scene/slide/page thumbnails. The service extends Protogen's existing snapshot system and integrates with the authoring workflow.

**Principle**: Previews generated on save (debounced), cached aggressively, invalidated on content changes.

---

## Integration with Snapshot System

### Extending Existing Architecture

Protogen has an existing snapshot system (`docs/snapshot-system.md`):

```typescript
// Existing snapshot system
class SnapshotBuilderService {
  buildSnapshot(sceneId: string): Promise<SceneSnapshot>;
  publishSnapshot(snapshot: SceneSnapshot): Promise<void>;
}
```

**Preview Service extends this**:
- Uses same rendering pipeline
- Adds size tiers (XS, SM, MD)
- Generates image thumbnails instead of full snapshots
- Faster generation (simplified rendering)
- Different caching strategy (CDN vs local cache)

---

## Preview Service Architecture

### Core Service Interface

```typescript
class PreviewService {
  private static instance: PreviewService;
  private cache: PreviewCache;
  private generator: ThumbnailGenerator;
  private queue: PreviewQueue;
  
  static getInstance(): PreviewService {
    if (!PreviewService.instance) {
      PreviewService.instance = new PreviewService();
    }
    return PreviewService.instance;
  }
  
  // Single preview generation
  async generatePreview(
    target: PreviewTarget,
    size: PreviewSize = 'sm',
    options?: GenerateOptions
  ): Promise<string> {
    const cacheKey = this.getCacheKey(target, size);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isStale(cached, target)) {
      return cached.dataUrl;
    }
    
    // Queue generation
    return this.queue.enqueue({
      target,
      size,
      options
    });
  }
  
  // Batch generation (for initial load)
  async generateBatch(
    targets: PreviewTarget[],
    size: PreviewSize = 'sm'
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    // Generate in parallel (max 4 concurrent)
    const chunks = chunkArray(targets, 4);
    for (const chunk of chunks) {
      const previews = await Promise.all(
        chunk.map(target => this.generatePreview(target, size))
      );
      
      chunk.forEach((target, i) => {
        results.set(this.getTargetKey(target), previews[i]);
      });
    }
    
    return results;
  }
  
  // Cache management
  getCached(target: PreviewTarget, size: PreviewSize): string | null {
    const cacheKey = this.getCacheKey(target, size);
    const cached = this.cache.get(cacheKey);
    
    return cached && !this.isStale(cached, target) ? cached.dataUrl : null;
  }
  
  invalidate(target: PreviewTarget): void {
    // Invalidate all sizes for target
    ['xs', 'sm', 'md'].forEach(size => {
      const key = this.getCacheKey(target, size as PreviewSize);
      this.cache.delete(key);
    });
    
    this.emit('cache-invalidated', { target });
  }
  
  invalidateScene(sceneId: string): void {
    // Invalidate all previews for scene
    this.cache.deletePattern(`scene:${sceneId}:*`);
  }
  
  // Staleness detection
  private isStale(cached: CachedPreview, target: PreviewTarget): boolean {
    // Check hash against current data
    const currentHash = this.getContentHash(target);
    return cached.hash !== currentHash;
  }
  
  private getContentHash(target: PreviewTarget): string {
    // Simple hash of content (for staleness detection)
    const content = JSON.stringify(target);
    return simpleHash(content);
  }
}
```

---

## Preview Targets

### Target Types

```typescript
type PreviewTarget =
  | ScenePreviewTarget
  | SlidePreviewTarget
  | PagePreviewTarget
  | NodePreviewTarget;  // For graph scenes

interface ScenePreviewTarget {
  type: 'scene';
  sceneId: string;
  variant?: 'default' | 'poster' | 'thumbnail';
}

interface SlidePreviewTarget {
  type: 'slide';
  sceneId: string;
  slideId: string;
}

interface PagePreviewTarget {
  type: 'page';
  sceneId: string;
  pageId: string;
  includeHeader?: boolean;
}

interface NodePreviewTarget {
  type: 'node';
  sceneId: string;
  nodeId: string;
  includeNeighbors?: boolean;  // Include connected nodes
}
```

---

## Size Tiers

### Preview Size Specifications

```typescript
type PreviewSize = 'xs' | 'sm' | 'md';

const PREVIEW_DIMENSIONS: Record<PreviewSize, { width: number; height: number }> = {
  xs: { width: 80, height: 60 },      // ToC thumbnails
  sm: { width: 160, height: 120 },    // Carousel items
  md: { width: 320, height: 240 }     // Overview boards
};

const PREVIEW_QUALITY: Record<PreviewSize, number> = {
  xs: 0.6,   // Lower quality for small size
  sm: 0.8,   // Medium quality
  md: 0.9    // High quality
};

// Usage map
const PREVIEW_USAGE = {
  xs: ['ToC tree items', 'Breadcrumb icons'],
  sm: ['Preview Carousel', 'Quick preview popup', 'Deck overview'],
  md: ['Scene selection board', 'Full preview modal', 'Share preview']
};
```

---

## Thumbnail Generator

### Offscreen Rendering

```typescript
class ThumbnailGenerator {
  private offscreenCanvas: OffscreenCanvas;
  private renderContext: CanvasRenderingContext2D;
  
  async generate(
    target: PreviewTarget,
    size: PreviewSize,
    options?: GenerateOptions
  ): Promise<string> {
    const dims = PREVIEW_DIMENSIONS[size];
    const quality = PREVIEW_QUALITY[size];
    
    // Emit generating event
    this.emit('PREVIEW_GENERATING', {
      targetType: target.type,
      targetId: this.getTargetId(target),
      size,
      estimatedTime: this.estimateTime(target, size)
    });
    
    try {
      // Render to offscreen canvas
      await this.renderToCanvas(target, dims, options);
      
      // Convert to data URL
      const dataUrl = await this.canvasToDataURL(quality);
      
      // Generate hash
      const hash = this.hashDataURL(dataUrl);
      
      // Cache result
      const metadata: PreviewMetadata = {
        targetType: target.type,
        targetId: this.getTargetId(target),
        size,
        hash,
        width: dims.width,
        height: dims.height,
        generatedAt: Date.now(),
        dataUrl
      };
      
      this.cache.set(this.getCacheKey(target, size), metadata);
      
      // Emit ready event
      this.emit('PREVIEW_READY', metadata);
      
      return dataUrl;
    } catch (error) {
      this.emit('PREVIEW_FAILED', {
        targetId: this.getTargetId(target),
        size,
        error,
        retryable: this.isRetryable(error)
      });
      
      throw error;
    }
  }
  
  private async renderToCanvas(
    target: PreviewTarget,
    dims: { width: number; height: number },
    options?: GenerateOptions
  ): Promise<void> {
    // Create offscreen canvas
    this.offscreenCanvas = new OffscreenCanvas(dims.width, dims.height);
    this.renderContext = this.offscreenCanvas.getContext('2d')!;
    
    // Clear canvas
    this.renderContext.clearRect(0, 0, dims.width, dims.height);
    
    // Render based on target type
    switch (target.type) {
      case 'scene':
        await this.renderScene(target, dims, options);
        break;
      case 'slide':
        await this.renderSlide(target, dims, options);
        break;
      case 'page':
        await this.renderPage(target, dims, options);
        break;
      case 'node':
        await this.renderNode(target, dims, options);
        break;
    }
  }
  
  private async renderSlide(
    target: SlidePreviewTarget,
    dims: { width: number; height: number },
    options?: GenerateOptions
  ): Promise<void> {
    // Load slide data
    const slide = await slideService.getSlide(target.slideId);
    
    if (slide.kind === 'text') {
      // Render text slide
      this.renderContext.fillStyle = slide.backgroundColor || '#ffffff';
      this.renderContext.fillRect(0, 0, dims.width, dims.height);
      
      this.renderContext.fillStyle = slide.textColor || '#000000';
      this.renderContext.font = `${slide.fontSize * 0.5}px ${slide.fontFamily || 'sans-serif'}`;
      this.renderContext.textAlign = slide.alignment || 'center';
      this.renderContext.fillText(
        slide.text,
        dims.width / 2,
        dims.height / 2
      );
    } else if (slide.kind === 'image') {
      // Render image slide
      const image = await this.loadImage(slide.imageAssetId);
      this.drawImageCovered(image, dims);
    } else if (slide.kind === 'layered') {
      // Render layered slide (background + text)
      const bgImage = await this.loadImage(slide.backgroundImageId);
      this.drawImageCovered(bgImage, dims);
      
      // Text overlay (without animation for preview)
      this.renderContext.fillStyle = slide.textColor || '#ffffff';
      this.renderContext.font = `${slide.fontSize * 0.5}px ${slide.fontFamily}`;
      this.renderContext.fillText(
        slide.text,
        dims.width / 2,
        dims.height / 2
      );
    }
  }
  
  private drawImageCovered(
    image: HTMLImageElement,
    dims: { width: number; height: number }
  ): void {
    // Cover the canvas (like CSS background-size: cover)
    const imgRatio = image.width / image.height;
    const canvasRatio = dims.width / dims.height;
    
    let srcX = 0, srcY = 0, srcW = image.width, srcH = image.height;
    
    if (imgRatio > canvasRatio) {
      // Image wider than canvas
      srcW = image.height * canvasRatio;
      srcX = (image.width - srcW) / 2;
    } else {
      // Image taller than canvas
      srcH = image.width / canvasRatio;
      srcY = (image.height - srcH) / 2;
    }
    
    this.renderContext.drawImage(
      image,
      srcX, srcY, srcW, srcH,
      0, 0, dims.width, dims.height
    );
  }
  
  private async canvasToDataURL(quality: number): Promise<string> {
    const blob = await this.offscreenCanvas.convertToBlob({
      type: 'image/png',
      quality
    });
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
```

---

## Cache Management

### Preview Cache

```typescript
class PreviewCache {
  private storage = new Map<string, CachedPreview>();
  private maxSize = 100;  // Max cached previews
  private maxAge = 1000 * 60 * 60 * 24;  // 24 hours
  
  get(key: string): CachedPreview | null {
    const cached = this.storage.get(key);
    if (!cached) return null;
    
    // Check age
    if (Date.now() - cached.metadata.generatedAt > this.maxAge) {
      this.delete(key);
      return null;
    }
    
    // Update access time
    cached.lastAccessed = Date.now();
    
    return cached;
  }
  
  set(key: string, metadata: PreviewMetadata): void {
    // Evict old entries if cache full
    if (this.storage.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.storage.set(key, {
      metadata,
      lastAccessed: Date.now()
    });
  }
  
  delete(key: string): void {
    this.storage.delete(key);
  }
  
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    Array.from(this.storage.keys())
      .filter(key => regex.test(key))
      .forEach(key => this.delete(key));
  }
  
  private evictLRU(): void {
    // Find least recently used entry
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, cached] of this.storage.entries()) {
      if (cached.lastAccessed < oldestTime) {
        oldestTime = cached.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
  
  // Stats
  getStats(): CacheStats {
    return {
      size: this.storage.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      averageAge: this.calculateAverageAge()
    };
  }
}

interface CachedPreview {
  metadata: PreviewMetadata;
  lastAccessed: number;
}

interface PreviewMetadata {
  targetType: string;
  targetId: string;
  size: PreviewSize;
  hash: string;
  width: number;
  height: number;
  generatedAt: number;
  dataUrl: string;
}
```

---

## Generation Queue

### Debounced & Prioritized Queue

```typescript
class PreviewQueue {
  private queue: PreviewRequest[] = [];
  private processing = false;
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  
  enqueue(request: PreviewRequest): Promise<string> {
    return new Promise((resolve, reject) => {
      const key = this.getRequestKey(request);
      
      // Debounce rapid requests for same target
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key)!);
      }
      
      this.debounceTimers.set(key, setTimeout(() => {
        this.queue.push({ ...request, resolve, reject });
        this.debounceTimers.delete(key);
        this.processQueue();
      }, request.options?.debounce || 500));
    });
  }
  
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    // Sort by priority
    this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      
      try {
        const dataUrl = await this.generator.generate(
          request.target,
          request.size,
          request.options
        );
        request.resolve(dataUrl);
      } catch (error) {
        request.reject(error);
      }
    }
    
    this.processing = false;
  }
  
  // Set priority for specific request
  setPriority(requestKey: string, priority: number): void {
    const request = this.queue.find(r => this.getRequestKey(r) === requestKey);
    if (request) {
      request.priority = priority;
    }
  }
}

interface PreviewRequest {
  target: PreviewTarget;
  size: PreviewSize;
  options?: GenerateOptions;
  priority?: number;
  resolve?: (dataUrl: string) => void;
  reject?: (error: Error) => void;
}

interface GenerateOptions {
  debounce?: number;      // Debounce delay (default 500ms)
  quality?: number;       // 0-1 quality (overrides size default)
  background?: string;    // Background color for transparent elements
  simplified?: boolean;   // Skip animations, effects
}
```

---

## Performance Budget

### Generation Performance Targets

| Target Type | Size | Max Generation Time | Notes |
|-------------|------|---------------------|-------|
| Scene | XS | 100ms | Simplified render |
| Scene | SM | 200ms | Standard render |
| Scene | MD | 500ms | High quality |
| Slide | XS | 50ms | Fast, minimal detail |
| Slide | SM | 100ms | Standard quality |
| Slide | MD | 250ms | High quality |
| Page | XS | 75ms | Text-based, fast |
| Page | SM | 150ms | Rich content |
| Page | MD | 300ms | Full fidelity |
| Node | XS | 25ms | Single node only |
| Node | SM | 50ms | Node + context |
| Node | MD | 100ms | Node + neighbors |

### Optimization Strategies

```typescript
interface OptimizationConfig {
  // Simplified rendering for previews
  simplifications: {
    skipAnimations: true,
    reduceTextDetail: true,
    downsampleImages: true,
    skipShadows: boolean;     // Size-dependent
    skipGradients: boolean;   // Size-dependent
  };
  
  // Caching strategy
  caching: {
    cacheTTL: number;         // 24 hours default
    maxCacheSize: number;     // 100 previews default
    persistToStorage: boolean; // LocalStorage for common previews
  };
  
  // Rendering optimizations
  rendering: {
    useOffscreenCanvas: true,
    enableHardwareAccel: true,
    reuseCanvasInstance: true,
    lazyLoadImages: false     // Preload all for previews
  };
}
```

---

## Staleness Detection

### Content Hashing

```typescript
interface StalenessDetector {
  // Generate hash from content
  hashContent(target: PreviewTarget): string;
  
  // Check if preview is stale
  isStale(cached: PreviewMetadata, current: PreviewTarget): boolean;
  
  // Get content version
  getVersion(target: PreviewTarget): number;
}

class ContentHasher {
  async hashContent(target: PreviewTarget): Promise<string> {
    switch (target.type) {
      case 'scene':
        return this.hashScene(target.sceneId);
      case 'slide':
        return this.hashSlide(target.slideId);
      case 'page':
        return this.hashPage(target.pageId);
      case 'node':
        return this.hashNode(target.nodeId);
    }
  }
  
  private async hashScene(sceneId: string): Promise<string> {
    const scene = await sceneService.getScene(sceneId);
    
    // Include all relevant fields in hash
    const hashInput = {
      name: scene.name,
      type: scene.scene_type,
      config: scene.config,
      theme: scene.theme,
      updatedAt: scene.updated_at,
      itemCount: await this.getItemCount(sceneId)
    };
    
    return simpleHash(JSON.stringify(hashInput));
  }
  
  private async hashSlide(slideId: string): Promise<string> {
    const slide = await slideService.getSlide(slideId);
    
    const hashInput = {
      kind: slide.kind,
      text: slide.text,
      imageAssetId: slide.imageAssetId,
      timing: slide.timing,
      style: slide.style,
      updatedAt: slide.updated_at
    };
    
    return simpleHash(JSON.stringify(hashInput));
  }
}

// Simple hash function (FNV-1a)
function simpleHash(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash.toString(36);
}
```

---

## Usage Patterns

### Usage Map

**Where previews are used**:

1. **ToC (Table of Contents)** - Size: XS
   ```typescript
   function ToCItem({ item }: ToCItemProps) {
     const preview = usePreview({ type: 'slide', slideId: item.id }, 'xs');
     
     return (
       <div className="toc-item">
         <img src={preview} className="toc-thumbnail" />
         <span>{item.label}</span>
       </div>
     );
   }
   ```

2. **Preview Carousel** - Size: SM
   ```typescript
   function PreviewCarousel({ sceneId }: CarouselProps) {
     const slides = useSceneSlides(sceneId);
     const previews = useBatchPreviews(
       slides.map(s => ({ type: 'slide', slideId: s.id })),
       'sm'
     );
     
     return (
       <div className="preview-carousel">
         {slides.map(slide => (
           <img key={slide.id} src={previews.get(slide.id)} />
         ))}
       </div>
     );
   }
   ```

3. **Deck Overview** - Size: SM
   ```typescript
   function DeckOverview({ deckId }: DeckOverviewProps) {
     const scenes = useDeckScenes(deckId);
     const previews = useBatchPreviews(
       scenes.map(s => ({ type: 'scene', sceneId: s.id })),
       'sm'
     );
     
     return (
       <div className="deck-overview">
         {scenes.map(scene => (
           <SceneCard
             key={scene.id}
             scene={scene}
             preview={previews.get(scene.id)}
           />
         ))}
       </div>
     );
   }
   ```

4. **Scene Selection Board** - Size: MD
   ```typescript
   function SceneSelectionBoard({ scenes }: SelectionBoardProps) {
     return (
       <div className="scene-grid">
         {scenes.map(scene => {
           const preview = usePreview({ type: 'scene', sceneId: scene.id }, 'md');
           
           return (
             <div key={scene.id} className="scene-card-large">
               <img src={preview} />
               <h3>{scene.name}</h3>
             </div>
           );
         })}
       </div>
     );
   }
   ```

---

## React Hooks

### usePreview Hook

```typescript
function usePreview(
  target: PreviewTarget | null,
  size: PreviewSize = 'sm'
): string | null {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!target) return;
    
    // Check cache
    const cached = previewService.getCached(target, size);
    if (cached) {
      setPreview(cached);
      return;
    }
    
    // Generate preview
    setLoading(true);
    previewService.generatePreview(target, size)
      .then(dataUrl => {
        setPreview(dataUrl);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to generate preview:', error);
        setLoading(false);
      });
    
    // Listen for preview ready
    const handlePreviewReady = (payload: PreviewReadyPayload) => {
      if (payload.targetId === getTargetId(target) && payload.size === size) {
        setPreview(payload.dataUrl);
        setLoading(false);
      }
    };
    
    previewService.on('PREVIEW_READY', handlePreviewReady);
    return () => previewService.off('PREVIEW_READY', handlePreviewReady);
  }, [target, size]);
  
  return preview;
}
```

### useBatchPreviews Hook

```typescript
function useBatchPreviews(
  targets: PreviewTarget[],
  size: PreviewSize = 'sm'
): Map<string, string> {
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (targets.length === 0) return;
    
    setLoading(true);
    previewService.generateBatch(targets, size)
      .then(results => {
        setPreviews(results);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to generate batch previews:', error);
        setLoading(false);
      });
  }, [targets, size]);
  
  return previews;
}
```

---

## Persistence

### Preview Storage Schema

```sql
-- Database schema for preview metadata
CREATE TABLE previews (
    id BIGSERIAL PRIMARY KEY,
    target_type VARCHAR(50) NOT NULL,  -- 'scene', 'slide', 'page', 'node'
    target_id VARCHAR(255) NOT NULL,
    size VARCHAR(10) NOT NULL,         -- 'xs', 'sm', 'md'
    hash VARCHAR(255) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    data_url TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(target_type, target_id, size),
    INDEX idx_previews_target (target_type, target_id),
    INDEX idx_previews_hash (hash)
);
```

**API Endpoints**:
```
GET    /api/previews/:type/:id?size=sm
POST   /api/previews/generate
DELETE /api/previews/:type/:id
PUT    /api/previews/invalidate/:type/:id
GET    /api/previews/batch?targets[]=...&size=sm
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('PreviewService', () => {
  it('should generate preview at specified size', async () => {
    const target: PreviewTarget = {
      type: 'slide',
      sceneId: 'scene-1',
      slideId: 'slide-1'
    };
    
    const preview = await previewService.generatePreview(target, 'sm');
    
    expect(preview).toMatch(/^data:image\/png;base64,/);
  });
  
  it('should cache generated previews', async () => {
    const target: PreviewTarget = { type: 'slide', slideId: 'slide-1' };
    
    // First call generates
    const preview1 = await previewService.generatePreview(target, 'sm');
    
    // Second call uses cache
    const preview2 = await previewService.generatePreview(target, 'sm');
    
    expect(preview1).toBe(preview2);
    expect(generateSpy).toHaveBeenCalledTimes(1); // Only once
  });
  
  it('should detect stale previews', async () => {
    const target: PreviewTarget = { type: 'slide', slideId: 'slide-1' };
    
    // Generate initial
    await previewService.generatePreview(target, 'sm');
    
    // Modify content (changes hash)
    await slideService.update('slide-1', { text: 'Updated' });
    
    // Should regenerate (not use cache)
    const preview = await previewService.generatePreview(target, 'sm');
    
    expect(generateSpy).toHaveBeenCalledTimes(2);
  });
});

describe('PreviewQueue', () => {
  it('should debounce rapid requests', async () => {
    const target: PreviewTarget = { type: 'slide', slideId: 'slide-1' };
    
    // Rapid requests
    const p1 = queue.enqueue({ target, size: 'sm' });
    const p2 = queue.enqueue({ target, size: 'sm' });
    const p3 = queue.enqueue({ target, size: 'sm' });
    
    await Promise.all([p1, p2, p3]);
    
    // Should only generate once (debounced)
    expect(generateSpy).toHaveBeenCalledTimes(1);
  });
  
  it('should process queue in priority order', async () => {
    const generated: string[] = [];
    
    queue.enqueue({ target: target1, size: 'sm', priority: 1 });
    queue.enqueue({ target: target2, size: 'sm', priority: 3 });
    queue.enqueue({ target: target3, size: 'sm', priority: 2 });
    
    await queue.waitForComplete();
    
    // Should process in order: target2, target3, target1
    expect(generated).toEqual(['target-2', 'target-3', 'target-1']);
  });
});
```

### Performance Tests

```typescript
describe('Preview Performance', () => {
  it('should generate XS preview within budget', async () => {
    const start = performance.now();
    await previewService.generatePreview(slideTarget, 'xs');
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50); // 50ms budget for XS
  });
  
  it('should generate batch efficiently', async () => {
    const targets = Array.from({ length: 20 }, (_, i) => ({
      type: 'slide',
      slideId: `slide-${i}`
    }));
    
    const start = performance.now();
    await previewService.generateBatch(targets, 'sm');
    const duration = performance.now() - start;
    
    // Should be faster than sequential (parallelization)
    const sequentialEstimate = 20 * 100; // 20 slides × 100ms each
    expect(duration).toBeLessThan(sequentialEstimate * 0.5);
  });
});
```

---

## Acceptance Criteria

- [x] PreviewService class interface defined
- [x] Integration with existing snapshot system
- [x] Three size tiers (XS, SM, MD) specified
- [x] ThumbnailGenerator with offscreen rendering
- [x] Preview cache with LRU eviction
- [x] Preview queue with debouncing and prioritization
- [x] Content hashing for staleness detection
- [x] Performance budgets defined per target type
- [x] Optimization strategies documented
- [x] Database schema for preview persistence
- [x] API endpoints for preview operations
- [x] React hooks (usePreview, useBatchPreviews)
- [x] Usage map showing all preview use cases
- [x] Testing strategy with performance tests
- [x] Event integration (PREVIEW_GENERATING, PREVIEW_READY, PREVIEW_FAILED)

**Status**: ✅ Complete - Phase 2 Complete!

---

## References

- **Previous**: [Spec 06: Selection & Highlighting Strategies](./06-highlighting-strategies.md)
- **Next**: [Spec 08: ToC Drawer Integration](./08-toc-integration.md)
- **Related**: Snapshot system in `docs/snapshot-system.md`

---

## Changelog

**2025-10-14**: Initial specification created  
**Status**: Ready for stakeholder review

