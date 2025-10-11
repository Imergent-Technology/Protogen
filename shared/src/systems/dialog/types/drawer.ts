/**
 * Drawer/Sheet Dialog Types
 */

import { ReactNode } from 'react';
import { BaseDialogConfig } from './base';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerDialogConfig extends BaseDialogConfig {
  type: 'drawer';
  title?: string;
  description?: string;
  content: ReactNode;
  footer?: ReactNode;
  side?: DrawerSide;
  width?: string | number;
  height?: string | number;
}

