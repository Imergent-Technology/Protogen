/**
 * Create Scene Dialog
 * 
 * Dialog for creating a new scene using FormFlow.
 */

import React, { useCallback } from 'react';
import { flowSystem, FlowRenderer } from '@protogen/shared/systems/flow';
import { dialogSystem } from '@protogen/shared/systems/dialog';
import { useNavigator } from '@protogen/shared/systems/navigator';
import { sceneManagementService } from '@protogen/shared/systems/scene-management';
import type { CreateSceneInput } from '@protogen/shared/systems/scene-management';
import { createSceneFlow } from '../flows/createSceneFlow';

export interface CreateSceneDialogProps {
  onSuccess?: (sceneId: string) => void;
  onCancel?: () => void;
}

export const CreateSceneDialog: React.FC<CreateSceneDialogProps> = ({ onSuccess, onCancel }) => {
  const { navigateTo } = useNavigator();

  const handleComplete = useCallback(async (data: Record<string, any>) => {
    try {
      // Create the scene
      const sceneInput: CreateSceneInput = {
        name: data.name,
        slug: data.slug,
        type: data.type,
        description: data.description,
        is_public: data.is_public ?? false,
        metadata: {},
      };

      const scene = await sceneManagementService.createScene(sceneInput);

      // Close dialog
      dialogSystem.closeAll();

      // Show success toast
      dialogSystem.openToast({
        title: 'Scene Created',
        description: `Scene "${scene.name}" has been created successfully.`,
        variant: 'success',
        duration: 3000,
      });

      // Navigate to new scene
      navigateTo({ contextPath: `/s/${scene.slug}` });

      // Call success callback
      onSuccess?.(scene.id);
    } catch (error) {
      console.error('Failed to create scene:', error);
      dialogSystem.openToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create scene',
        variant: 'error',
        duration: 5000,
      });
    }
  }, [navigateTo, onSuccess]);

  const handleCancel = useCallback(() => {
    dialogSystem.closeAll();
    onCancel?.();
  }, [onCancel]);

  return null; // Actual rendering handled by FlowSystem + DialogSystem
};

/**
 * Open Create Scene Dialog
 * 
 * Convenience function to open the create scene dialog.
 */
export const openCreateSceneDialog = (props?: CreateSceneDialogProps) => {
  // Register flow template if not already registered
  flowSystem.registerTemplate({
    id: 'create-scene-template',
    name: 'Create Scene Template',
    description: 'Template for creating new scenes',
    category: 'scene-management',
    template: createSceneFlow
  });

  // Start flow
  const flowInstance = flowSystem.createFlowFromTemplate('create-scene-template', {
    onComplete: props?.onSuccess ? async (data) => {
      const handleComplete = async (data: Record<string, any>) => {
        try {
          const sceneInput: CreateSceneInput = {
            name: data.name,
            slug: data.slug,
            type: data.type,
            description: data.description,
            is_public: data.is_public ?? false,
            metadata: {},
          };

          const scene = await sceneManagementService.createScene(sceneInput);

          dialogSystem.closeAll();

          dialogSystem.openToast({
            title: 'Scene Created',
            description: `Scene "${scene.name}" has been created successfully.`,
            variant: 'success',
            duration: 3000,
          });

          props.onSuccess?.(scene.id);
        } catch (error) {
          console.error('Failed to create scene:', error);
          dialogSystem.openToast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to create scene',
            variant: 'error',
            duration: 5000,
          });
        }
      };
      await handleComplete(data);
    } : undefined,
    onCancel: props?.onCancel,
  });

  // Register the flow instance so FlowRenderer can find it
  flowSystem['flows'].set(flowInstance.id, flowInstance);
  
  const instanceId = flowSystem.startFlow(flowInstance.id);

  // Open in modal
  dialogSystem.openModal({
    title: 'Create New Scene',
    size: 'lg',
    content: React.createElement(FlowRenderer, {
      flowId: flowInstance.id,
      instanceId,
      onComplete: async (data) => {
        try {
          const sceneInput: CreateSceneInput = {
            name: data.name,
            slug: data.slug,
            type: data.type,
            description: data.description,
            is_active: data.is_active ?? true,
            is_public: data.is_public ?? false,
          };

          const scene = await sceneManagementService.createScene(sceneInput);

          dialogSystem.closeAll();

          dialogSystem.openToast({
            title: 'Scene Created',
            description: `Scene "${scene.name}" has been created successfully.`,
            variant: 'success',
            duration: 3000,
          });

          props?.onSuccess?.(scene.id);
        } catch (error) {
          console.error('Failed to create scene:', error);
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

