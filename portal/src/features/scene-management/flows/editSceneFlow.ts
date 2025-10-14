/**
 * Edit Scene Flow Definition
 * 
 * Multi-step form flow for editing an existing scene.
 */

import type { Flow } from '@protogen/shared/systems/flow';
import type { FormField } from '@protogen/shared/systems/flow/form';

export const editSceneFlow: Flow = {
  id: 'edit-scene',
  name: 'Edit Scene',
  description: 'Modify scene configuration and content',
  mode: 'guided',
  steps: [
    {
      id: 'basic-details',
      order: 1,
      title: 'Basic Details',
      description: 'Update the basic information for your scene',
      type: 'form',
      data: {
        fields: [
          {
            id: 'name',
            label: 'Scene Name',
            type: 'text',
            required: true,
            validation: {
              required: true,
              minLength: 3,
              maxLength: 100,
            },
          },
          {
            id: 'slug',
            label: 'URL Slug',
            type: 'text',
            required: true,
            helpText: 'Used in the URL: /s/your-slug-here',
            validation: {
              required: true,
              pattern: /^[a-z0-9-]+$/,
              minLength: 3,
              maxLength: 50,
            },
          },
          {
            id: 'description',
            label: 'Description',
            type: 'textarea',
            rows: 3,
          },
        ] as FormField[],
      },
    },
    {
      id: 'visibility',
      order: 2,
      title: 'Visibility & Access',
      description: 'Configure who can access this scene',
      type: 'form',
      data: {
        fields: [
          {
            id: 'is_public',
            label: 'Make scene public',
            type: 'checkbox',
            helpText: 'Public scenes can be viewed by anyone',
          },
          {
            id: 'is_active',
            label: 'Scene is active',
            type: 'checkbox',
            helpText: 'Active scenes are visible in navigation',
          },
        ] as FormField[],
      },
    },
    {
      id: 'review',
      order: 3,
      title: 'Review & Save',
      description: 'Review your changes',
      type: 'review',
      data: {
        sections: [
          {
            title: 'Basic Details',
            fields: ['name', 'slug', 'description'],
          },
          {
            title: 'Configuration',
            fields: ['is_public', 'is_active'],
          },
        ],
      },
    },
  ],
  metadata: {
    canGoBack: true,
    showProgress: true,
    cancelable: true,
  },
};

