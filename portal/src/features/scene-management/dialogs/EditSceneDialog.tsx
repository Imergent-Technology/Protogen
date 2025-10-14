/**
 * Edit Scene Dialog
 * 
 * Dialog for editing an existing scene using FormFlow.
 */

import React, { useCallback } from 'react';
import { flowSystem, FlowRenderer } from '@protogen/shared/systems/flow';
import { dialogSystem } from '@protogen/shared/systems/dialog';
import { sceneManagementService } from '@protogen/shared/systems/scene-management';
import type { UpdateSceneInput, SceneConfig } from '@protogen/shared/systems/scene-management';
import { editSceneFlow } from '../flows/editSceneFlow';

export interface EditSceneDialogProps {
  scene: SceneConfig;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditSceneDialog: React.FC<EditSceneDialogProps> = ({ scene, onSuccess, onCancel }) => {
  const handleComplete = useCallback(async (data: Record<string, any>) => {
    try {
      // Update the scene
      const sceneInput: UpdateSceneInput = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        is_public: data.is_public,
        is_active: data.is_active,
      };

      await sceneManagementService.updateScene(scene.id, sceneInput);

      // Close dialog
      dialogSystem.closeAll();

      // Show success toast
      dialogSystem.openToast({
        title: 'Scene Updated',
        description: `Scene "${data.name}" has been updated successfully.`,
        variant: 'success',
        duration: 3000,
      });

      // Call success callback
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update scene:', error);
      dialogSystem.openToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update scene',
        variant: 'error',
        duration: 5000,
      });
    }
  }, [scene.id, onSuccess]);

  const handleCancel = useCallback(() => {
    dialogSystem.closeAll();
    onCancel?.();
  }, [onCancel]);

  return null; // Actual rendering handled by FlowSystem + DialogSystem
};

/**
 * Open Edit Scene Dialog
 * 
 * Convenience function to open the edit scene dialog.
 */
export const openEditSceneDialog = (scene: SceneConfig, props?: Omit<EditSceneDialogProps, 'scene'>) => {
  // Register flow template if not already registered
  flowSystem.registerTemplate({
    id: 'edit-scene-template',
    name: 'Edit Scene Template',
    description: 'Template for editing existing scenes',
    category: 'scene-management',
    template: editSceneFlow
  });

  // Start flow with initial data
  const flowInstance = flowSystem.createFlowFromTemplate('edit-scene-template', {
    onComplete: props?.onSuccess ? async (data) => {
      try {
        const sceneInput: UpdateSceneInput = {
          name: data.name,
          slug: data.slug,
          description: data.description,
          is_public: data.is_public,
          is_active: data.is_active,
        };

        await sceneManagementService.updateScene(scene.id, sceneInput);

        dialogSystem.closeAll();

        dialogSystem.openToast({
          title: 'Scene Updated',
          description: `Scene "${data.name}" has been updated successfully.`,
          variant: 'success',
          duration: 3000,
        });

        props.onSuccess?.();
      } catch (error) {
        console.error('Failed to update scene:', error);
        dialogSystem.openToast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update scene',
          variant: 'error',
          duration: 5000,
        });
      }
    } : undefined,
    onCancel: props?.onCancel,
  });

  // Register the flow instance so FlowRenderer can find it
  flowSystem['flows'].set(flowInstance.id, flowInstance);
  
  const instanceId = flowSystem.startFlow(flowInstance.id, {
    name: scene.name,
    slug: scene.slug,
    description: scene.description,
    is_public: scene.is_public,
    is_active: scene.is_active,
  });

  // Open in modal
  dialogSystem.openModal({
    title: `Edit Scene: ${scene.name}`,
    size: 'lg',
    content: React.createElement(FlowRenderer, {
      flowId: flowInstance.id,
      instanceId,
      onComplete: async (data) => {
        try {
          const sceneInput: UpdateSceneInput = {
            name: data.name,
            slug: data.slug,
            description: data.description,
            is_public: data.is_public,
            is_active: data.is_active,
          };

          await sceneManagementService.updateScene(scene.id, sceneInput);

          dialogSystem.closeAll();

          dialogSystem.openToast({
            title: 'Scene Updated',
            description: `Scene "${data.name}" has been updated successfully.`,
            variant: 'success',
            duration: 3000,
          });

          props?.onSuccess?.();
        } catch (error) {
          console.error('Failed to update scene:', error);
          dialogSystem.openToast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update scene',
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

