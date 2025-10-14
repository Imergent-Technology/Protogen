/**
 * Create Deck Flow Definition
 * 
 * Multi-step form flow for creating a new deck.
 */

import type { Flow } from '@protogen/shared/systems/flow';
import type { FormField } from '@protogen/shared/systems/flow/form';

export const createDeckFlow: Flow = {
  id: 'create-deck',
  name: 'Create Deck',
  description: 'Create a new deck for organizing slides',
  mode: 'guided',
  steps: [
    {
      id: 'basic-details',
      order: 1,
      title: 'Basic Details',
      description: 'Enter the basic information for your deck',
      type: 'form',
      guidance: {
        highlight: true,
        message: 'Decks are collections of slides that can be presented sequentially.',
      },
      data: {
        fields: [
          {
            id: 'name',
            label: 'Deck Name',
            type: 'text',
            placeholder: 'My Presentation Deck',
            required: true,
            validation: {
              required: true,
              minLength: 3,
              maxLength: 100,
            },
          },
          {
            id: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Describe what this deck contains...',
            rows: 3,
          },
          {
            id: 'type',
            label: 'Deck Type',
            type: 'select',
            required: true,
            options: [
              { value: 'presentation', label: 'Presentation', description: 'Linear slide presentation' },
              { value: 'graph', label: 'Graph', description: 'Non-linear graph exploration' },
              { value: 'hybrid', label: 'Hybrid', description: 'Combination of both' },
            ],
            defaultValue: 'presentation',
            validation: {
              required: true,
            },
          },
        ] as FormField[],
      },
    },
    {
      id: 'navigation',
      order: 2,
      title: 'Navigation Settings',
      description: 'Configure how users navigate through this deck',
      type: 'form',
      data: {
        fields: [
          {
            id: 'autoPlay',
            label: 'Enable auto-play',
            type: 'checkbox',
            defaultValue: false,
            helpText: 'Automatically advance to next slide',
          },
          {
            id: 'autoPlayInterval',
            label: 'Auto-play interval (seconds)',
            type: 'number',
            defaultValue: 5,
            min: 1,
            max: 60,
            condition: {
              field: 'autoPlay',
              operator: 'equals',
              value: true,
            },
          },
          {
            id: 'loop',
            label: 'Loop deck',
            type: 'checkbox',
            defaultValue: false,
            helpText: 'Return to first slide after last',
          },
          {
            id: 'allowRandomAccess',
            label: 'Allow random access',
            type: 'checkbox',
            defaultValue: true,
            helpText: 'Users can jump to any slide',
          },
          {
            id: 'keyboardNavigation',
            label: 'Enable keyboard navigation',
            type: 'checkbox',
            defaultValue: true,
            helpText: 'Use arrow keys to navigate',
          },
          {
            id: 'showProgress',
            label: 'Show progress indicator',
            type: 'checkbox',
            defaultValue: true,
          },
          {
            id: 'showControls',
            label: 'Show navigation controls',
            type: 'checkbox',
            defaultValue: true,
          },
        ] as FormField[],
      },
    },
    {
      id: 'review',
      order: 3,
      title: 'Review & Create',
      description: 'Review your deck configuration',
      type: 'review',
      data: {
        sections: [
          {
            title: 'Basic Details',
            fields: ['name', 'description', 'type'],
          },
          {
            title: 'Navigation Settings',
            fields: ['autoPlay', 'autoPlayInterval', 'loop', 'allowRandomAccess', 'keyboardNavigation', 'showProgress', 'showControls'],
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

