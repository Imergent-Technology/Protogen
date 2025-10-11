/**
 * Popover Dialog Types
 */

import { ReactNode } from 'react';
import { BaseDialogConfig } from './base';

export type PopoverPlacement = 
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end';

export interface PopoverDialogConfig extends BaseDialogConfig {
  type: 'popover';
  content: ReactNode;
  triggerRef?: React.RefObject<HTMLElement>;
  placement?: PopoverPlacement;
  offset?: number;
  arrow?: boolean;
}

