/**
 * Scene Edit Button Component
 * 
 * Floating action button for editing scenes, only visible to users with permissions.
 */

import React from 'react';
import { Button } from '@protogen/shared/components';
import { openEditSceneDialog } from '../dialogs/EditSceneDialog';
import type { SceneConfig } from '@protogen/shared/systems/scene-management';

export interface SceneEditButtonProps {
  scene: SceneConfig;
  userIsAdmin?: boolean;
  className?: string;
}

export const SceneEditButton: React.FC<SceneEditButtonProps> = ({
  scene,
  userIsAdmin = false,
  className = ''
}) => {
  // Only show button if user has edit permissions
  // For now, we'll use a simple admin check; later this will be replaced with
  // proper permission checking via PermissionService
  if (!userIsAdmin) {
    return null;
  }

  const handleEdit = () => {
    openEditSceneDialog(scene, {
      onSuccess: () => {
        // Reload the scene or refresh the view
        window.location.reload(); // Temporary solution
      }
    });
  };

  return (
    <Button
      onClick={handleEdit}
      variant="outline"
      size="sm"
      className={`fixed bottom-4 right-4 shadow-lg ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      Edit Scene
    </Button>
  );
};

