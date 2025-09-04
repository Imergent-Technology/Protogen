// Preview Thumbnail Generator Service
// Generates low-quality base64 thumbnails for scene previews

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality: number; // 0-1, lower = smaller file size
  format: 'jpeg' | 'png';
}

export interface SceneThumbnailData {
  type: 'graph' | 'document' | 'card' | 'custom';
  content: any;
  metadata: {
    title?: string;
    author?: string;
    tags?: string[];
  };
}

class PreviewThumbnailGenerator {
  private defaultOptions: ThumbnailOptions = {
    width: 320,
    height: 180, // 16:9 aspect ratio
    quality: 0.3, // Low quality for small file size
    format: 'jpeg'
  };

  /**
   * Generate a thumbnail for a scene
   */
  async generateSceneThumbnail(
    sceneData: SceneThumbnailData,
    options: Partial<ThumbnailOptions> = {}
  ): Promise<string> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      switch (sceneData.type) {
        case 'graph':
          return await this.generateGraphThumbnail(sceneData, opts);
        case 'document':
          return await this.generateDocumentThumbnail(sceneData, opts);
        case 'card':
          return await this.generateCardThumbnail(sceneData, opts);
        default:
          return await this.generateDefaultThumbnail(sceneData, opts);
      }
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return this.generateFallbackThumbnail(sceneData.type, opts);
    }
  }

  /**
   * Generate thumbnail for graph scenes
   */
  private async generateGraphThumbnail(
    sceneData: SceneThumbnailData,
    options: ThumbnailOptions
  ): Promise<string> {
    // Create a canvas to render the graph preview
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return this.generateFallbackThumbnail('graph', options);
    }

    // Set background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, options.width, options.height);

    // Draw graph representation
    const centerX = options.width / 2;
    const centerY = options.height / 2;
    const radius = Math.min(options.width, options.height) * 0.3;

    // Draw nodes as circles
    const nodeCount = Math.min(sceneData.content?.nodes?.length || 3, 8);
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Node circle
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Node label
      ctx.fillStyle = '#1e40af';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`N${i + 1}`, x, y + 3);
    }

    // Draw edges
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    for (let i = 0; i < nodeCount; i++) {
      const angle1 = (i / nodeCount) * 2 * Math.PI;
      const angle2 = ((i + 1) / nodeCount) * 2 * Math.PI;
      const x1 = centerX + Math.cos(angle1) * radius;
      const y1 = centerY + Math.sin(angle1) * radius;
      const x2 = centerX + Math.cos(angle2) * radius;
      const y2 = centerY + Math.sin(angle2) * radius;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Add title if available
    if (sceneData.metadata.title) {
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sceneData.metadata.title, centerX, 20);
    }

    return canvas.toDataURL(`image/${options.format}`, options.quality);
  }

  /**
   * Generate thumbnail for document scenes
   */
  private async generateDocumentThumbnail(
    sceneData: SceneThumbnailData,
    options: ThumbnailOptions
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return this.generateFallbackThumbnail('document', options);
    }

    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, options.width, options.height);

    // Draw document content representation
    const padding = 20;
    const contentHeight = options.height - (padding * 2);

    // Draw text lines
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    
    const lines = [
      sceneData.metadata.title || 'Document Title',
      'This is a sample of the document content...',
      'Multiple lines of text are displayed here',
      'to represent the document structure.',
      'Additional content would be shown...'
    ];

    lines.forEach((line, index) => {
      const y = padding + 20 + (index * 16);
      if (y < contentHeight) {
        ctx.fillText(line, padding, y);
      }
    });

    // Add document icon
    ctx.fillStyle = '#10b981';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📄', options.width - 30, 30);

    return canvas.toDataURL(`image/${options.format}`, options.quality);
  }

  /**
   * Generate thumbnail for card scenes
   */
  private async generateCardThumbnail(
    sceneData: SceneThumbnailData,
    options: ThumbnailOptions
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return this.generateFallbackThumbnail('card', options);
    }

    // Set background with gradient
    const gradient = ctx.createLinearGradient(0, 0, options.width, options.height);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, options.width, options.height);

    // Draw card content
    const centerX = options.width / 2;
    const centerY = options.height / 2;

    // Card title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sceneData.metadata.title || 'Card Title', centerX, centerY - 10);

    // Card content
    ctx.font = '12px sans-serif';
    ctx.fillText('Slide content preview...', centerX, centerY + 10);

    // Add card icon
    ctx.font = '32px sans-serif';
    ctx.fillText('🃏', centerX, centerY + 40);

    return canvas.toDataURL(`image/${options.format}`, options.quality);
  }

  /**
   * Generate default thumbnail for unknown scene types
   */
  private async generateDefaultThumbnail(
    sceneData: SceneThumbnailData,
    options: ThumbnailOptions
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return this.generateFallbackThumbnail('custom', options);
    }

    // Set background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, options.width, options.height);

    // Draw generic content
    const centerX = options.width / 2;
    const centerY = options.height / 2;

    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sceneData.metadata.title || 'Scene', centerX, centerY);

    ctx.font = '32px sans-serif';
    ctx.fillText('📋', centerX, centerY + 30);

    return canvas.toDataURL(`image/${options.format}`, options.quality);
  }

  /**
   * Generate fallback thumbnail when canvas rendering fails
   */
  private generateFallbackThumbnail(type: string, options: ThumbnailOptions): string {
    // Return a simple colored rectangle as base64
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      // Ultimate fallback - return a 1x1 transparent pixel
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }

    // Set type-appropriate background color
    const colors = {
      graph: '#3b82f6',
      document: '#10b981',
      card: '#8b5cf6',
      custom: '#6b7280'
    };

    ctx.fillStyle = colors[type as keyof typeof colors] || colors.custom;
    ctx.fillRect(0, 0, options.width, options.height);

    // Add type icon
    const icons = {
      graph: '📊',
      document: '📄',
      card: '🃏',
      custom: '📋'
    };

    ctx.fillStyle = '#ffffff';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(icons[type as keyof typeof icons] || icons.custom, options.width / 2, options.height / 2);

    return canvas.toDataURL(`image/${options.format}`, options.quality);
  }

  /**
   * Generate thumbnail from existing image/video element
   */
  async generateFromMedia(
    mediaElement: HTMLImageElement | HTMLVideoElement,
    options: Partial<ThumbnailOptions> = {}
  ): Promise<string> {
    const opts = { ...this.defaultOptions, ...options };
    
    const canvas = document.createElement('canvas');
    canvas.width = opts.width;
    canvas.height = opts.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return this.generateFallbackThumbnail('custom', opts);
    }

    // Calculate scaling to maintain aspect ratio
    const mediaAspect = mediaElement instanceof HTMLImageElement 
      ? mediaElement.naturalWidth / mediaElement.naturalHeight
      : mediaElement.videoWidth / mediaElement.videoHeight;
    const canvasAspect = opts.width / opts.height;
    
    let drawWidth = opts.width;
    let drawHeight = opts.height;
    let offsetX = 0;
    let offsetY = 0;

    if (mediaAspect > canvasAspect) {
      // Media is wider than canvas
      drawHeight = opts.height;
      drawWidth = drawHeight * mediaAspect;
      offsetX = (opts.width - drawWidth) / 2;
    } else {
      // Media is taller than canvas
      drawWidth = opts.width;
      drawHeight = drawWidth / mediaAspect;
      offsetY = (opts.height - drawHeight) / 2;
    }

    // Fill background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, opts.width, opts.height);

    // Draw media
    ctx.drawImage(mediaElement, offsetX, offsetY, drawWidth, drawHeight);

    return canvas.toDataURL(`image/${opts.format}`, opts.quality);
  }
}

// Export singleton instance
export const previewThumbnailGenerator = new PreviewThumbnailGenerator();
export default previewThumbnailGenerator;
