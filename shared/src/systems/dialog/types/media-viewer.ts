/**
 * Media Viewer Dialog Types
 */

import { BaseDialogConfig } from './base';

export type MediaType = 'image' | 'video' | 'audio' | 'document';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface MediaViewerDialogConfig extends BaseDialogConfig {
  type: 'media-viewer';
  media: MediaItem | MediaItem[];
  initialIndex?: number;
  showNavigation?: boolean;
  showThumbnails?: boolean;
  allowDownload?: boolean;
  allowShare?: boolean;
}

