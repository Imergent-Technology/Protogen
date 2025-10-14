/**
 * Create Scene Flow Definition
 * 
 * Multi-step form flow for creating a new scene.
 */

import type { Flow } from '@protogen/shared/systems/flow';
import type { FormField } from '@protogen/shared/systems/flow/form';

export const createSceneFlow: Flow = {
  id: 'create-scene',
  name: 'Create Scene',
  description: 'Create a new scene with basic configuration',
  mode: 'guided',
  steps: [
    {
      id: 'basic-details',
      order: 1,
      title: 'Basic Details',
      description: 'Enter the basic information for your scene',
      type: 'form',
      guidance: {
        highlight: true,
        message: 'Provide a unique name and slug for your scene. The slug will be used in URLs.',
      },
      data: {
        fields: [
          {
            id: 'name',
            label: 'Scene Name',
            type: 'text',
            placeholder: 'My Awesome Scene',
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
            placeholder: 'my-awesome-scene',
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
            placeholder: 'Describe what this scene is about...',
            rows: 3,
          },
        ] as FormField[],
      },
    },
    {
      id: 'scene-type',
      order: 2,
      title: 'Scene Type',
      description: 'Choose the type of scene you want to create',
      type: 'form',
      guidance: {
        highlight: true,
        message: 'Different scene types support different content structures.',
      },
      data: {
        fields: [
          {
            id: 'type',
            label: 'Scene Type',
            type: 'select',
            required: true,
            options: [
              { value: 'card', label: 'Card Scene', description: 'Slide-based presentations with rich media' },
              { value: 'graph', label: 'Graph Scene', description: 'Interactive node-based explorations' },
              { value: 'document', label: 'Document Scene', description: 'Long-form text content' },
              { value: 'custom', label: 'Custom Scene', description: 'Custom scene configuration' },
            ],
            validation: {
              required: true,
            },
          },
        ] as FormField[],
      },
    },
    {
      id: 'visibility',
      order: 3,
      title: 'Visibility & Access',
      description: 'Configure who can access this scene',
      type: 'form',
      data: {
        fields: [
          {
            id: 'is_public',
            label: 'Make scene public',
            type: 'checkbox',
            defaultValue: false,
            helpText: 'Public scenes can be viewed by anyone',
          },
          {
            id: 'is_active',
            label: 'Activate scene immediately',
            type: 'checkbox',
            defaultValue: true,
            helpText: 'Active scenes are visible in navigation',
          },
        ] as FormField[],
      },
    },
    {
      id: 'review',
      order: 4,
      title: 'Review & Create',
      description: 'Review your scene configuration',
      type: 'review',
      data: {
        sections: [
          {
            title: 'Basic Details',
            fields: ['name', 'slug', 'description'],
          },
          {
            title: 'Configuration',
            fields: ['type', 'is_public', 'is_active'],
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

