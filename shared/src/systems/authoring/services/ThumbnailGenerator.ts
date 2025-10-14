/**
 * ThumbnailGenerator - M1 Week 5
 * 
 * Generates thumbnail images using offscreen canvas rendering.
 * Scene-type aware rendering for Card, Document, Graph scenes.
 * 
 * Based on Spec 07: Preview Service Specification
 */

import type {
  PreviewTarget,
  PreviewSize,
  PreviewMetadata,
  GenerateOptions,
  PREVIEW_DIMENSIONS,
  PREVIEW_QUALITY
} from '../types/preview';

// Import dimensions and quality
const dimensions: typeof PREVIEW_DIMENSIONS = {
  xs: { width: 80, height: 60 },
  sm: { width: 160, height: 120 },
  md: { width: 320, height: 240 }
};

const quality: typeof PREVIEW_QUALITY = {
  xs: 0.6,
  sm: 0.8,
  md: 0.9
};

export class ThumbnailGenerator {
  private static instance: ThumbnailGenerator;
  private eventHandlers: Map<string, Function[]> = new Map();
  private rendering = false;

  private constructor() {}

  // ============================================================================
  // Singleton Pattern
  // ============================================================================

  static getInstance(): ThumbnailGenerator {
    if (!ThumbnailGenerator.instance) {
      ThumbnailGenerator.instance = new ThumbnailGenerator();
    }
    return ThumbnailGenerator.instance;
  }

  // ============================================================================
  // Generation
  // ============================================================================

  async generate(
    target: PreviewTarget,
    size: PreviewSize,
    options?: GenerateOptions
  ): Promise<string> {
    const dims = dimensions[size];
    const qual = options?.quality || quality[size];

    // Emit generating event
    if (!options?.skipEvents) {
      this.emit('preview-generating', {
        targetType: target.type,
        targetId: this.getTargetId(target),
        size,
        estimatedTime: this.estimateTime(target, size)
      });
    }

    try {
      this.rendering = true;

      // Render to data URL
      const dataUrl = await this.renderToDataURL(target, dims, qual, options);

      // Generate hash
      const hash = this.hashDataURL(dataUrl);

      // Create metadata
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

      // Emit ready event
      if (!options?.skipEvents) {
        this.emit('preview-ready', metadata);
      }

      this.rendering = false;
      return dataUrl;
    } catch (error) {
      this.rendering = false;

      // Emit failed event
      if (!options?.skipEvents) {
        this.emit('preview-failed', {
          targetId: this.getTargetId(target),
          size,
          error,
          retryable: this.isRetryable(error)
        });
      }

      throw error;
    }
  }

  // ============================================================================
  // Rendering
  // ============================================================================

  private async renderToDataURL(
    target: PreviewTarget,
    dims: { width: number; height: number },
    quality: number,
    options?: GenerateOptions
  ): Promise<string> {
    // For M1, we'll use a placeholder rendering system
    // In production, this will render actual scene content

    const canvas = this.createCanvas(dims.width, dims.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Clear canvas
    ctx.clearRect(0, 0, dims.width, dims.height);

    // Render based on target type
    await this.renderTarget(ctx, target, dims, options);

    // Convert to data URL
    return canvas.toDataURL('image/jpeg', quality);
  }

  private createCanvas(width: number, height: number): HTMLCanvasElement {
    if (typeof document === 'undefined') {
      throw new Error('Canvas rendering requires browser environment');
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  private async renderTarget(
    ctx: CanvasRenderingContext2D,
    target: PreviewTarget,
    dims: { width: number; height: number },
    options?: GenerateOptions
  ): Promise<void> {
    switch (target.type) {
      case 'scene':
        await this.renderScene(ctx, target, dims, options);
        break;
      case 'slide':
        await this.renderSlide(ctx, target, dims, options);
        break;
      case 'page':
        await this.renderPage(ctx, target, dims, options);
        break;
      case 'node':
        await this.renderNode(ctx, target, dims, options);
        break;
      default:
        this.renderPlaceholder(ctx, dims, 'Unknown');
    }
  }

  // ============================================================================
  // Scene-Type Rendering (M1 - Placeholder implementations)
  // ============================================================================

  private async renderScene(
    ctx: CanvasRenderingContext2D,
    target: any,
    dims: { width: number; height: number },
    _options?: GenerateOptions
  ): Promise<void> {
    // TODO: Implement actual scene rendering in M1 Week 7-8
    // For now, render placeholder
    this.renderPlaceholder(ctx, dims, `Scene ${target.sceneId}`);
  }

  private async renderSlide(
    ctx: CanvasRenderingContext2D,
    target: any,
    dims: { width: number; height: number },
    _options?: GenerateOptions
  ): Promise<void> {
    // M1 Week 7-8: Render Card slide content
    try {
      // TODO: Fetch slide data from API
      // For now, use placeholder data
      const slide = await this.fetchSlideData(target.slideId);

      if (!slide) {
        this.renderPlaceholder(ctx, dims, `Slide ${target.slideId}`);
        return;
      }

      // Render based on slide kind
      switch (slide.kind) {
        case 'text':
          this.renderTextSlide(ctx, slide, dims);
          break;
        case 'image':
          await this.renderImageSlide(ctx, slide, dims);
          break;
        case 'layered':
          await this.renderLayeredSlide(ctx, slide, dims);
          break;
        default:
          this.renderPlaceholder(ctx, dims, `Slide ${target.slideId}`);
      }
    } catch (error) {
      this.renderPlaceholder(ctx, dims, `Error: Slide ${target.slideId}`);
    }
  }

  private async fetchSlideData(slideId: string): Promise<any> {
    // TODO: Implement API call in production
    // For now, return mock data
    return {
      id: slideId,
      kind: 'text',
      text: 'Sample Slide',
      fontSize: 24,
      textColor: '#000000',
      backgroundColor: '#ffffff',
      alignment: 'center',
      padding: 32
    };
  }

  private renderTextSlide(ctx: CanvasRenderingContext2D, slide: any, dims: { width: number; height: number }): void {
    // Background
    ctx.fillStyle = slide.backgroundColor;
    ctx.fillRect(0, 0, dims.width, dims.height);

    // Text
    ctx.fillStyle = slide.textColor;
    ctx.font = `${Math.min(slide.fontSize, dims.height / 4)}px ${slide.fontFamily || 'sans-serif'}`;
    ctx.textAlign = slide.alignment;
    ctx.textBaseline = 'middle';

    const x = slide.alignment === 'left' ? slide.padding :
               slide.alignment === 'right' ? dims.width - slide.padding :
               dims.width / 2;

    this.wrapText(ctx, slide.text, x, dims.height / 2, dims.width - (slide.padding * 2));
  }

  private async renderImageSlide(ctx: CanvasRenderingContext2D, slide: any, dims: { width: number; height: number }): Promise<void> {
    // For preview, just show a placeholder with image indicator
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, dims.width, dims.height);

    ctx.fillStyle = '#666';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🖼️ Image Slide', dims.width / 2, dims.height / 2);

    // Caption if present
    if (slide.caption) {
      const captionY = slide.caption.position === 'top' ? 20 : dims.height - 20;
      ctx.fillStyle = slide.caption.backgroundColor;
      ctx.fillRect(0, captionY - 10, dims.width, 20);
      ctx.fillStyle = slide.caption.textColor;
      ctx.fillText(slide.caption.text, dims.width / 2, captionY);
    }
  }

  private async renderLayeredSlide(ctx: CanvasRenderingContext2D, slide: any, dims: { width: number; height: number }): Promise<void> {
    // Background image (placeholder)
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, dims.width, dims.height);

    // Dim overlay
    ctx.fillStyle = `rgba(0, 0, 0, ${slide.backgroundDim / 100})`;
    ctx.fillRect(0, 0, dims.width, dims.height);

    // Text overlay
    ctx.fillStyle = slide.textColor;
    ctx.font = `${Math.min(slide.fontSize, dims.height / 3)}px ${slide.fontFamily || 'sans-serif'}`;
    ctx.textAlign = slide.alignment;
    ctx.textBaseline = 'middle';

    const x = slide.alignment === 'left' ? 32 :
               slide.alignment === 'right' ? dims.width - 32 :
               dims.width / 2;

    const y = slide.textPosition.vertical === 'top' ? dims.height / 4 :
               slide.textPosition.vertical === 'bottom' ? (dims.height * 3) / 4 :
               dims.height / 2;

    this.wrapText(ctx, slide.text, x, y, dims.width - 64);
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number): void {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    // Draw lines
    const lineHeight = parseInt(ctx.font) * 1.2;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + (index * lineHeight));
    });
  }

  private async renderPage(
    ctx: CanvasRenderingContext2D,
    target: any,
    dims: { width: number; height: number },
    _options?: GenerateOptions
  ): Promise<void> {
    // TODO: Implement in M2
    this.renderPlaceholder(ctx, dims, `Page ${target.pageId}`);
  }

  private async renderNode(
    ctx: CanvasRenderingContext2D,
    target: any,
    dims: { width: number; height: number },
    _options?: GenerateOptions
  ): Promise<void> {
    // TODO: Implement in M3
    this.renderPlaceholder(ctx, dims, `Node ${target.nodeId}`);
  }

  private renderPlaceholder(
    ctx: CanvasRenderingContext2D,
    dims: { width: number; height: number },
    text: string
  ): void {
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, dims.width, dims.height);

    // Border
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, dims.width, dims.height);

    // Text
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, dims.width / 2, dims.height / 2);
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  private getTargetId(target: PreviewTarget): string {
    switch (target.type) {
      case 'scene':
        return target.sceneId;
      case 'slide':
        return target.slideId;
      case 'page':
        return target.pageId;
      case 'node':
        return target.nodeId;
      default:
        return 'unknown';
    }
  }

  private hashDataURL(dataUrl: string): string {
    // Simple hash for staleness detection
    let hash = 0;
    for (let i = 0; i < Math.min(dataUrl.length, 1000); i++) {
      const char = dataUrl.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private estimateTime(target: PreviewTarget, size: PreviewSize): number {
    // Rough estimation in milliseconds
    const baseTime = 50;
    const sizeMultiplier = size === 'xs' ? 0.5 : size === 'sm' ? 1 : 2;
    const typeMultiplier = target.type === 'scene' ? 2 : 1;

    return baseTime * sizeMultiplier * typeMultiplier;
  }

  private isRetryable(error: any): boolean {
    // Network errors, timeouts are retryable
    // Rendering errors usually are not
    return error?.message?.includes('timeout') || error?.message?.includes('network');
  }

  isRendering(): boolean {
    return this.rendering;
  }

  // ============================================================================
  // Event System
  // ============================================================================

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, payload: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }
}

