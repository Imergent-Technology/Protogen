/**
 * WizardDialogService - Helper for opening wizards in Dialog System
 */

import React from 'react';
import { WizardConfig } from '../types';
import { dialogSystem } from '../../../dialog';
import { Wizard } from '../components/Wizard';

export interface OpenWizardDialogOptions {
  presentationMode?: 'modal' | 'drawer' | 'full-screen';
  dialogTitle?: string;
  dialogSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  drawerPosition?: 'left' | 'right' | 'top' | 'bottom';
}

export class WizardDialogService {
  /**
   * Open a wizard in a modal dialog
   */
  openWizardModal(
    config: WizardConfig,
    options?: OpenWizardDialogOptions
  ): string {
    const { dialogSize = 'lg' } = options || {};

    return dialogSystem.openModal({
      title: config.title,
      description: config.description,
      content: React.createElement(Wizard, { config }),
      size: dialogSize,
      closeOnEscape: false
    });
  }

  /**
   * Open a wizard in a drawer dialog
   */
  openWizardDrawer(
    config: WizardConfig,
    options?: OpenWizardDialogOptions
  ): string {
    const { drawerPosition = 'right' } = options || {};

    return dialogSystem.openDrawer({
      title: config.title,
      content: React.createElement(Wizard, { config }),
      position: drawerPosition,
      closeOnEscape: false
    });
  }

  /**
   * Open a wizard in the appropriate dialog based on presentation mode
   */
  openWizard(
    config: WizardConfig,
    options?: OpenWizardDialogOptions
  ): string {
    const presentationMode = options?.presentationMode || config.options?.presentationMode || 'modal';

    switch (presentationMode) {
      case 'drawer':
        return this.openWizardDrawer(config, options);
      case 'full-screen':
        return this.openWizardModal(config, { ...options, dialogSize: 'full' });
      case 'modal':
      default:
        return this.openWizardModal(config, options);
    }
  }
}

// Export singleton instance
export const wizardDialogService = new WizardDialogService();

