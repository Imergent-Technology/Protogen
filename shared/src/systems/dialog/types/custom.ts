/**
 * Custom Dialog Types
 * 
 * Allows for fully custom dialog implementations
 */

import { ReactNode } from 'react';
import { BaseDialogConfig } from './base';

export interface CustomDialogConfig extends BaseDialogConfig {
  type: 'custom';
  content: ReactNode;
  customType?: string; // For identifying specific custom dialog types
  props?: Record<string, any>;
}

