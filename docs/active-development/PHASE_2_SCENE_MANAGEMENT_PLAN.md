# Phase 2: Scene Management Migration - Detailed Plan

## Overview

Phase 2 focuses on migrating scene, deck, and slide management from the admin site to the portal with a scene-centric, dialog-based approach. This phase leverages the newly completed Flow System (Form Flow) for all management dialogs.

## Current State

**What Exists:**
- ✅ Dialog System (modals, drawers, toasts, confirmations)
- ✅ Flow System with Form Flow sub-module
- ✅ Toolbar System with widget support
- ✅ Navigator System with URL sync
- ✅ Scene System with default scenes
- ✅ Admin site with scene/deck/slide management UI

**What's in Admin (to migrate):**
- `admin/src/components/scenes/SceneManager.tsx` - Grid/list view of scenes
- `admin/src/components/scenes/SceneCard.tsx` - Individual scene card
- `admin/src/components/decks/DeckManager.tsx` - Deck management
- `admin/src/components/workflows/scene/` - Scene creation workflow
- `admin/src/stores/deckStore.ts` - Scene/deck state management
- Card/Graph/Document authoring components

## Phase 2 Breakdown

### 2.1: Scene Management Services (Shared Library)

**Goal:** Create type-safe services for scene/deck/slide CRUD operations in the shared library.

**Files to Create:**
```
shared/src/systems/scene-management/
├── types/
│   ├── scene-config.ts
│   ├── deck-config.ts
│   ├── slide-config.ts
│   └── index.ts
├── services/
│   ├── SceneManagementService.ts
│   ├── DeckManagementService.ts
│   ├── SlideManagementService.ts
│   └── index.ts
├── hooks/
│   ├── useSceneManagement.ts
│   ├── useDeckManagement.ts
│   ├── useSlideManagement.ts
│   └── index.ts
└── index.ts
```

**Types to Define:**

```typescript
// scene-config.ts
export interface SceneConfig {
  id: string;
  name: string;
  slug: string;
  type: 'graph' | 'card' | 'document' | 'custom';
  description?: string;
  is_active: boolean;
  is_public: boolean;
  deckIds: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateSceneInput {
  name: string;
  slug: string;
  type: SceneConfig['type'];
  description?: string;
  deckIds?: string[];
}

export interface UpdateSceneInput {
  name?: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  is_public?: boolean;
  deckIds?: string[];
}

// deck-config.ts
export interface DeckConfig {
  id: string;
  name: string;
  type: 'presentation' | 'graph' | 'hybrid';
  sceneIds: string[];
  slideOrder: string[];
  navigation: DeckNavigation;
  created_at: string;
  updated_at: string;
}

export interface DeckNavigation {
  autoPlay: boolean;
  loop: boolean;
  allowRandomAccess: boolean;
  keyboardNavigation: boolean;
}

// slide-config.ts
export interface SlideConfig {
  id: string;
  sceneId: string;
  deckId: string;
  order: number;
  content: SlideContent;
  style: SlideStyle;
  transition: TransitionConfig;
}

export interface SlideContent {
  type: 'card' | 'graph' | 'document';
  data: Record<string, any>;
}
```

**Services:**

```typescript
// SceneManagementService.ts
export class SceneManagementServiceClass {
  private apiClient: ApiClient;
  
  async getScenes(): Promise<SceneConfig[]>;
  async getScene(id: string): Promise<SceneConfig>;
  async createScene(input: CreateSceneInput): Promise<SceneConfig>;
  async updateScene(id: string, input: UpdateSceneInput): Promise<SceneConfig>;
  async deleteScene(id: string): Promise<void>;
  async publishScene(id: string): Promise<void>;
}

export const sceneManagementService = new SceneManagementServiceClass();
```

**Hooks:**

```typescript
// useSceneManagement.ts
export function useSceneManagement() {
  const [scenes, setScenes] = useState<SceneConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadScenes = async () => { /* ... */ };
  const createScene = async (input: CreateSceneInput) => { /* ... */ };
  const updateScene = async (id: string, input: UpdateSceneInput) => { /* ... */ };
  const deleteScene = async (id: string) => { /* ... */ };
  
  return { scenes, loading, error, loadScenes, createScene, updateScene, deleteScene };
}
```

### 2.2: Dialog-Based Management UI (Portal)

**Goal:** Create Form Flow-powered dialogs for scene/deck/slide management.

**Files to Create:**
```
portal/src/features/scene-management/
├── dialogs/
│   ├── CreateSceneDialog.tsx
│   ├── EditSceneDialog.tsx
│   ├── ManageDeckDialog.tsx
│   ├── SlideEditorDialog.tsx
│   └── index.ts
├── components/
│   ├── SceneList.tsx
│   ├── SceneCard.tsx
│   ├── DeckPanel.tsx
│   ├── SlideManager.tsx
│   └── index.ts
├── flows/
│   ├── createSceneFlow.ts
│   ├── editSceneFlow.ts
│   └── index.ts
└── index.ts
```

**Create Scene Flow:**

```typescript
// flows/createSceneFlow.ts
import { FormFlow, FormStep, SelectionStep, ReviewStep, validationService } from '@protogen/shared/systems/flow';

export const createCreateSceneFlow = (availableDecks: DeckConfig[]): FormFlow => ({
  id: 'create-scene',
  name: 'Create Scene',
  mode: 'guided',
  steps: [
    {
      id: 'basic-details',
      order: 1,
      title: 'Basic Details',
      description: 'Enter the basic information for your scene',
      step_type: 'form',
      component: FormStep,
      props: {
        fields: [
          {
            id: 'name',
            label: 'Scene Name',
            type: 'text',
            required: true,
            placeholder: 'Enter scene name',
            helperText: 'A descriptive name for your scene'
          },
          {
            id: 'slug',
            label: 'URL Slug',
            type: 'text',
            required: true,
            placeholder: 'scene-slug',
            helperText: 'URL-friendly identifier',
            autoGenerateFrom: 'name',
            autoGenerateTransform: (value: string) => value.toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
          },
          {
            id: 'type',
            label: 'Scene Type',
            type: 'select',
            required: true,
            options: [
              { value: 'card', label: 'Card Scene' },
              { value: 'graph', label: 'Graph Scene' },
              { value: 'document', label: 'Document Scene' },
              { value: 'custom', label: 'Custom Scene' }
            ],
            helperText: 'The type determines available features'
          },
          {
            id: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Describe your scene...',
            rows: 3
          }
        ],
        layout: 'single-column'
      },
      validation: validationService.combine(['required']),
    },
    {
      id: 'deck-selection',
      order: 2,
      title: 'Link to Decks',
      description: 'Select decks to include in this scene',
      step_type: 'selection',
      component: SelectionStep,
      condition: {
        field: 'type',
        operator: 'not_equals',
        value: 'custom'
      },
      props: {
        options: availableDecks.map(deck => ({
          value: deck.id,
          label: deck.name,
          description: `${deck.type} deck`
        })),
        mode: 'multi',
        displayMode: 'card'
      }
    },
    {
      id: 'review',
      order: 3,
      title: 'Review',
      description: 'Review your scene configuration',
      step_type: 'review',
      component: ReviewStep,
      props: {
        sections: [
          {
            title: 'Basic Information',
            stepId: 'basic-details',
            items: [
              { label: 'Name', value: 'name' },
              { label: 'Slug', value: 'slug' },
              { label: 'Type', value: 'type' },
              { label: 'Description', value: 'description' }
            ]
          },
          {
            title: 'Linked Decks',
            stepId: 'deck-selection',
            items: [
              { label: 'Selected Decks', value: 'deckIds', render: (ids) => `${ids?.length || 0} deck(s) selected` }
            ]
          }
        ]
      }
    }
  ],
  settings: {
    showProgress: true,
    allowBack: true,
    autoSave: false
  },
  onComplete: async (data) => {
    await sceneManagementService.createScene({
      name: data.name,
      slug: data.slug,
      type: data.type,
      description: data.description,
      deckIds: data.selectedValues || []
    });
  }
});
```

**Create Scene Dialog:**

```typescript
// dialogs/CreateSceneDialog.tsx
import React, { useEffect } from 'react';
import { flowSystem, dialogSystem } from '@protogen/shared/systems/flow';
import { FormFlowContainer } from '@protogen/shared/systems/flow/form';
import { navigateTo } from '@protogen/shared/systems/navigator';
import { createCreateSceneFlow } from '../flows/createSceneFlow';
import { useDeckManagement } from '@protogen/shared/systems/scene-management';

export const openCreateSceneDialog = () => {
  const { decks } = useDeckManagement();
  
  // Create flow
  const flow = createCreateSceneFlow(decks);
  flowSystem.registerFlow(flow);
  const instanceId = flowSystem.startFlow('create-scene');
  
  // Open in modal
  dialogSystem.openModal({
    title: 'Create New Scene',
    size: 'lg',
    content: <FormFlowContainer instanceId={instanceId} />,
    closeOnEscape: false
  });
};
```

**Scene List Component:**

```typescript
// components/SceneList.tsx
import React, { useEffect } from 'react';
import { useSceneManagement } from '@protogen/shared/systems/scene-management';
import { SceneCard } from './SceneCard';
import { Button } from '@protogen/shared/components';
import { Plus } from 'lucide-react';
import { openCreateSceneDialog } from '../dialogs/CreateSceneDialog';

export const SceneList: React.FC = () => {
  const { scenes, loading, loadScenes } = useSceneManagement();
  
  useEffect(() => {
    loadScenes();
  }, []);
  
  if (loading) return <div>Loading scenes...</div>;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Scenes</h2>
        <Button onClick={openCreateSceneDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Scene
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenes.map(scene => (
          <SceneCard key={scene.id} scene={scene} />
        ))}
      </div>
    </div>
  );
};
```

### 2.3: Integration with Scene Viewer

**Goal:** Add edit/manage capabilities to the scene viewer for authorized users.

**Approach:**
1. Add "Edit Scene" button to scene viewer (visible based on permissions)
2. Button opens `EditSceneDialog` with current scene data
3. Deck management accessible via context menu
4. Slide management opens full-screen dialog

**Implementation:**

```typescript
// In SceneContainer.tsx or similar
import { useCurrentContext, navigateTo } from '@protogen/shared/systems/navigator';
import { useSceneManagement } from '@protogen/shared/systems/scene-management';
import { Button } from '@protogen/shared/components';
import { Edit, Settings } from 'lucide-react';

const SceneActions: React.FC = () => {
  const context = useCurrentContext();
  const { getScene } = useSceneManagement();
  const scene = getScene(context.sceneId);
  
  const canEdit = checkEditPermission(scene); // TODO: Permission check
  
  if (!canEdit) return null;
  
  return (
    <div className="absolute top-4 right-4 flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => openEditSceneDialog(scene)}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Scene
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => openManageDeckDialog(scene)}
      >
        <Settings className="h-4 w-4 mr-2" />
        Manage Decks
      </Button>
    </div>
  );
};
```

### 2.4: Card Slide Editor (Priority 1)

**Goal:** Migrate card slide authoring from admin with enhanced UX.

**Files to Create:**
```
portal/src/features/scene-management/slide-editors/
├── card/
│   ├── CardSlideEditor.tsx
│   ├── CardContentEditor.tsx
│   ├── CardLayoutSelector.tsx
│   ├── CardMediaUploader.tsx
│   └── index.ts
├── components/
│   ├── SlidePreview.tsx
│   ├── TransitionSelector.tsx
│   └── index.ts
└── index.ts
```

**CardSlideEditor Component:**

```typescript
// slide-editors/card/CardSlideEditor.tsx
import React, { useState } from 'react';
import { SlideConfig, SlideContent } from '@protogen/shared/systems/scene-management';
import { CardContentEditor } from './CardContentEditor';
import { CardLayoutSelector } from './CardLayoutSelector';
import { CardMediaUploader } from './CardMediaUploader';
import { TransitionSelector } from '../components/TransitionSelector';
import { SlidePreview } from '../components/SlidePreview';
import { Button } from '@protogen/shared/components';

export interface CardSlideEditorProps {
  slide?: SlideConfig;
  onSave: (slide: Partial<SlideConfig>) => Promise<void>;
  onCancel: () => void;
}

export const CardSlideEditor: React.FC<CardSlideEditorProps> = ({
  slide,
  onSave,
  onCancel
}) => {
  const [content, setContent] = useState<SlideContent>(slide?.content || {
    type: 'card',
    data: {}
  });
  const [layout, setLayout] = useState(slide?.content?.data?.layout || 'single-column');
  const [showPreview, setShowPreview] = useState(false);
  
  const handleSave = async () => {
    await onSave({
      content: { ...content, data: { ...content.data, layout } },
      style: slide?.style,
      transition: slide?.transition
    });
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {slide ? 'Edit Card Slide' : 'Create Card Slide'}
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {showPreview ? (
          <SlidePreview slide={{ ...slide, content }} />
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-auto">
            {/* Left: Content Editor */}
            <div className="space-y-4">
              <CardLayoutSelector layout={layout} onChange={setLayout} />
              <CardContentEditor content={content} onChange={setContent} />
              <CardMediaUploader content={content} onChange={setContent} />
            </div>
            
            {/* Right: Live Preview */}
            <div className="border rounded-lg overflow-hidden">
              <SlidePreview slide={{ ...slide, content }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 2.5-2.6: Graph & Document Editors (Deferred)

These will follow the same pattern as the Card Editor but are deferred to later phases.

## Implementation Order

1. **Week 1: Services & Types**
   - 2.1: Create scene-management services in shared library
   - Set up API client integration
   - Create React hooks for state management

2. **Week 2: Dialog-Based UI**
   - 2.2: Create Form Flows for scene/deck management
   - Build dialog components
   - Integrate with toolbar (add "Manage Scenes" menu item)

3. **Week 3: Scene Viewer Integration**
   - 2.3: Add edit buttons to scene viewer
   - Wire up permission checks
   - Create context menu items

4. **Week 4: Card Slide Editor**
   - 2.4: Build card slide editor
   - Implement content/layout/media editing
   - Add live preview
   - Test end-to-end workflow

## Success Criteria

- [ ] Scene CRUD operations work via Form Flow dialogs
- [ ] Users can create, edit, and delete scenes from portal
- [ ] Deck management accessible from scene context
- [ ] Card slide editor functional with all features
- [ ] Permission checks in place (basic)
- [ ] Integration tests pass
- [ ] Documentation updated

## Dependencies

- ✅ Flow System (Phase 1 - Completed)
- ✅ Dialog System (Previously completed)
- ✅ Toolbar System (Previously completed)
- ⏳ Permission System (Phase 3 - Basic checks only for now)

## Next Steps After Phase 2

- **Phase 3**: Permission System (full implementation)
- **Phase 4**: Bookmarks & Comments System
- **Phase 5**: Graph & Document Slide Editors
- **Phase 6**: Admin toolbar configuration UI

## Notes

- All dialogs use Form Flow for consistency
- Scene viewer remains the primary UX
- Admin site management UI can coexist during migration
- Gradual migration: Start with card scenes, expand to others
- API endpoints need to support both admin and portal

