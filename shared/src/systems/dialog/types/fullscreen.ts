/**
 * Full-Screen Dialog Types
 */

import { ReactNode } from 'react';
import { BaseDialogConfig } from './base';

export type FullScreenSize = 'default' | 'large' | 'xlarge';

export interface FullScreenDialogConfig extends BaseDialogConfig {
  type: 'fullscreen';
  title?: string;
  description?: string;
  content: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  fullscreenSize?: FullScreenSize; // Different name to avoid conflict
}

