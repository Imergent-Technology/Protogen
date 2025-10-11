/**
 * Form Dialog Types
 */

import { ReactNode } from 'react';
import { BaseDialogConfig } from './base';

export interface FormDialogConfig extends BaseDialogConfig {
  type: 'form';
  title: string;
  description?: string;
  formContent: ReactNode;
  onSubmit?: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  showFooter?: boolean;
}

