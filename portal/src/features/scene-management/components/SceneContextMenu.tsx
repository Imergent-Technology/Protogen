/**
 * Scene Context Menu Component
 * 
 * Context menu items for scene management, can be injected into the toolbar context menu.
 */

import React from 'react';
import type { SceneConfig } from '@protogen/shared/systems/scene-management';
import { openEditSceneDialog } from '../dialogs/EditSceneDialog';
import { openCreateDeckDialog } from '../dialogs/CreateDeckDialog';
import { dialogSystem } from '@protogen/shared/systems/dialog';
import { sceneManagementService } from '@protogen/shared/systems/scene-management';

export interface SceneContextMenuProps {
  scene: SceneConfig;
  userIsAdmin?: boolean;
  onAction?: () => void;
}

export const getSceneContextMenuItems = (
  scene: SceneConfig,
  userIsAdmin: boolean = false,
  onAction?: () => void
) => {
  if (!userIsAdmin) {
    return [];
  }

  return [
    {
      id: 'edit-scene',
      label: 'Edit Scene',
      icon: 'edit',
      onClick: () => {
        openEditSceneDialog(scene, {
          onSuccess: () => {
            onAction?.();
          }
        });
      }
    },
    {
      id: 'duplicate-scene',
      label: 'Duplicate Scene',
      icon: 'copy',
      onClick: async () => {
        try {
          const duplicate = await sceneManagementService.duplicateScene(
            scene.id,
            `${scene.name} (Copy)`
          );
          
          dialogSystem.openToast({
            title: 'Scene Duplicated',
            description: `Created "${duplicate.name}"`,
            variant: 'success',
            duration: 3000,
          });
          
          onAction?.();
        } catch (error) {
          dialogSystem.openToast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to duplicate scene',
            variant: 'error',
            duration: 5000,
          });
        }
      }
    },
    {
      id: 'create-deck',
      label: 'Create Deck for Scene',
      icon: 'layers',
      onClick: () => {
        openCreateDeckDialog({
          sceneId: scene.id,
          onSuccess: () => {
            onAction?.();
          }
        });
      }
    },
    {
      type: 'separator'
    },
    {
      id: 'publish-scene',
      label: scene.is_active ? 'Unpublish Scene' : 'Publish Scene',
      icon: scene.is_active ? 'eye-off' : 'eye',
      onClick: async () => {
        try {
          if (scene.is_active) {
            await sceneManagementService.unpublishScene(scene.id);
            dialogSystem.openToast({
              title: 'Scene Unpublished',
              description: `"${scene.name}" is now inactive`,
              variant: 'info',
              duration: 3000,
            });
          } else {
            await sceneManagementService.publishScene(scene.id);
            dialogSystem.openToast({
              title: 'Scene Published',
              description: `"${scene.name}" is now active`,
              variant: 'success',
              duration: 3000,
            });
          }
          
          onAction?.();
        } catch (error) {
          dialogSystem.openToast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update scene',
            variant: 'error',
            duration: 5000,
          });
        }
      }
    },
    {
      type: 'separator'
    },
    {
      id: 'delete-scene',
      label: 'Delete Scene',
      icon: 'trash',
      danger: true,
      onClick: () => {
        dialogSystem.openConfirmation({
          title: 'Delete Scene',
          description: `Are you sure you want to delete "${scene.name}"? This action cannot be undone.`,
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
          variant: 'danger',
          onConfirm: async () => {
            try {
              await sceneManagementService.deleteScene(scene.id);
              
              dialogSystem.openToast({
                title: 'Scene Deleted',
                description: `"${scene.name}" has been deleted`,
                variant: 'success',
                duration: 3000,
              });
              
              // Navigate away from deleted scene
              window.location.href = '/';
            } catch (error) {
              dialogSystem.openToast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to delete scene',
                variant: 'error',
                duration: 5000,
              });
            }
          }
        });
      }
    }
  ];
};

