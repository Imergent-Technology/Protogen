/**
 * Modal Dialog Types
 */

import { ReactNode } from 'react';
import { BaseDialogConfig } from './base';

export interface ModalDialogConfig extends BaseDialogConfig {
  type: 'modal';
  title?: string;
  description?: string;
  content: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

