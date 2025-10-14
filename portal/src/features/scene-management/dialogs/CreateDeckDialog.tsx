/**
 * Create Deck Dialog
 * 
 * Dialog for creating a new deck using FormFlow.
 */

import React, { useCallback } from 'react';
import { flowSystem, FlowRenderer } from '@protogen/shared/systems/flow';
import { dialogSystem } from '@protogen/shared/systems/dialog';
import { deckManagementService } from '@protogen/shared/systems/scene-management';
import type { CreateDeckInput } from '@protogen/shared/systems/scene-management';
import { createDeckFlow } from '../flows/createDeckFlow';

export interface CreateDeckDialogProps {
  sceneId?: string;
  onSuccess?: (deckId: string) => void;
  onCancel?: () => void;
}

export const CreateDeckDialog: React.FC<CreateDeckDialogProps> = ({ sceneId, onSuccess, onCancel }) => {
  const handleComplete = useCallback(async (data: Record<string, any>) => {
    try {
      // Create the deck
      const deckInput: CreateDeckInput = {
        name: data.name,
        description: data.description,
        type: data.type,
        sceneIds: sceneId ? [sceneId] : [],
        navigation: {
          autoPlay: data.autoPlay ?? false,
          autoPlayInterval: data.autoPlayInterval,
          loop: data.loop ?? false,
          allowRandomAccess: data.allowRandomAccess ?? true,
          keyboardNavigation: data.keyboardNavigation ?? true,
          showProgress: data.showProgress ?? true,
          showControls: data.showControls ?? true,
        },
        metadata: {},
      };

      const deck = await deckManagementService.createDeck(deckInput);

      // Close dialog
      dialogSystem.closeAll();

      // Show success toast
      dialogSystem.openToast({
        title: 'Deck Created',
        description: `Deck "${deck.name}" has been created successfully.`,
        variant: 'success',
        duration: 3000,
      });

      // Call success callback
      onSuccess?.(deck.id);
    } catch (error) {
      console.error('Failed to create deck:', error);
      dialogSystem.openToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create deck',
        variant: 'error',
        duration: 5000,
      });
    }
  }, [sceneId, onSuccess]);

  const handleCancel = useCallback(() => {
    dialogSystem.closeAll();
    onCancel?.();
  }, [onCancel]);

  return null; // Actual rendering handled by FlowSystem + DialogSystem
};

/**
 * Open Create Deck Dialog
 * 
 * Convenience function to open the create deck dialog.
 */
export const openCreateDeckDialog = (props?: CreateDeckDialogProps) => {
  // Register flow template if not already registered
  flowSystem.registerTemplate({
    id: 'create-deck-template',
    name: 'Create Deck Template',
    description: 'Template for creating new decks',
    category: 'scene-management',
    template: createDeckFlow
  });

  // Start flow
  const flowInstance = flowSystem.createFlowFromTemplate('create-deck-template', {
    onComplete: props?.onSuccess ? async (data) => {
      try {
        const deckInput: CreateDeckInput = {
          name: data.name,
          description: data.description,
          type: data.type,
          sceneIds: props.sceneId ? [props.sceneId] : [],
          navigation: {
            autoPlay: data.autoPlay ?? false,
            autoPlayInterval: data.autoPlayInterval,
            loop: data.loop ?? false,
            allowRandomAccess: data.allowRandomAccess ?? true,
            keyboardNavigation: data.keyboardNavigation ?? true,
            showProgress: data.showProgress ?? true,
            showControls: data.showControls ?? true,
          },
          metadata: {},
        };

        const deck = await deckManagementService.createDeck(deckInput);

        dialogSystem.closeAll();

        dialogSystem.openToast({
          title: 'Deck Created',
          description: `Deck "${deck.name}" has been created successfully.`,
          variant: 'success',
          duration: 3000,
        });

        props.onSuccess?.(deck.id);
      } catch (error) {
        console.error('Failed to create deck:', error);
        dialogSystem.openToast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create deck',
          variant: 'error',
          duration: 5000,
        });
      }
    } : undefined,
    onCancel: props?.onCancel,
  });

  // Register the flow instance so FlowRenderer can find it
  flowSystem['flows'].set(flowInstance.id, flowInstance);
  
  const instanceId = flowSystem.startFlow(flowInstance.id);

  // Open in modal
  dialogSystem.openModal({
    title: 'Create New Deck',
    size: 'lg',
    content: React.createElement(FlowRenderer, {
      flowId: flowInstance.id,
      instanceId,
      onComplete: async (data) => {
        try {
          const deckInput: CreateDeckInput = {
            name: data.name,
            description: data.description,
            type: data.type,
            sceneIds: props?.sceneId ? [props.sceneId] : [],
            navigation: {
              autoPlay: data.autoPlay ?? false,
              autoPlayInterval: data.autoPlayInterval,
              loop: data.loop ?? false,
              allowRandomAccess: data.allowRandomAccess ?? true,
              keyboardNavigation: data.keyboardNavigation ?? true,
              showProgress: data.showProgress ?? true,
              showControls: data.showControls ?? true,
            },
            metadata: {},
          };

          const deck = await deckManagementService.createDeck(deckInput);

          dialogSystem.closeAll();

          dialogSystem.openToast({
            title: 'Deck Created',
            description: `Deck "${deck.name}" has been created successfully.`,
            variant: 'success',
            duration: 3000,
          });

          props?.onSuccess?.(deck.id);
        } catch (error) {
          console.error('Failed to create deck:', error);
          dialogSystem.openToast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to create scene',
            variant: 'error',
            duration: 5000,
          });
        }
      },
      onCancel: () => {
        dialogSystem.closeAll();
        props?.onCancel?.();
      },
    }),
    closeOnEscape: true,
    showCloseButton: true,
  });

  return instanceId;
};

