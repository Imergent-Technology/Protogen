/**
 * Wizard Dialog Types
 * 
 * For multi-step wizard workflows (will integrate with Flow System)
 */

import { BaseDialogConfig } from './base';

export interface WizardDialogConfig extends BaseDialogConfig {
  type: 'wizard';
  wizardId: string;
  title?: string;
  initialStep?: number;
  onComplete?: (data: any) => void;
  onCancel?: () => void;
}

