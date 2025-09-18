import React, { useState, useEffect } from 'react';
import { Save, Eye, Plus, Trash2, Settings, Play, X } from 'lucide-react';
import { Button, Input, Label, Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Textarea } from '@protogen/shared';
import { CardSceneData, CardSlide, CardSceneAuthoringProps } from '../types';
import { NodeMetadata } from '../types/node-selection';
import { useAuthoringPermissions } from '../hooks/useAuthoringPermissions';
import { useSceneAuthoring } from '../hooks/useSceneAuthoring';

const CardSceneAuthoring: React.FC<CardSceneAuthoringProps> = ({
  scene,
  availableNodes,
  onSave,
  onPreview,
  onCancel,
  className = '',
  permissions
}) => {
  const authoringPermissions = useAuthoringPermissions();
  const effectivePermissions = permissions || authoringPermissions;
  
  const {
    scene: formData,
    state,
    updateScene,
    saveScene,
    previewScene,
    canPerformAction
  } = useSceneAuthoring<CardSceneData>(scene);

  // UI state
  const [activeTab, setActiveTab] = useState<'slides' | 'layout' | 'style' | 'config' | 'preview'>('slides');
  const [selectedSlide, setSelectedSlide] = useState<string | null>(null);

  // Check permissions
  const canUseCardAuthoring = effectivePermissions.canUseCardAuthoring();
  const canSave = canPerformAction('save', 'card');
  const canPreview = canPerformAction('preview', 'card');

  // Handle form field changes
  const handleFieldChange = (field: keyof CardSceneData, value: any) => {
    updateScene({ [field]: value } as Partial<CardSceneData>);
  };

  const handleConfigChange = (field: keyof CardSceneData['config'], value: any) => {
    updateScene({
      config: {
        ...formData?.config,
        [field]: value
      }
    } as Partial<CardSceneData>);
  };

  const handleLayoutChange = (field: keyof CardSceneData['layout'], value: any) => {
    updateScene({
      layout: {
        ...formData?.layout,
        [field]: value
      }
    } as Partial<CardSceneData>);
  };

  const handleStyleChange = (field: keyof CardSceneData['style'], value: any) => {
    updateScene({
      style: {
        ...formData?.style,
        [field]: value
      }
    } as Partial<CardSceneData>);
  };

  // Slide management
  const addSlide = () => {
    if (!canUseCardAuthoring) return;
    
    const newSlide: CardSlide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${(formData?.slides.length || 0) + 1}`,
      background: {
        type: 'color',
        color: '#ffffff',
        fit: 'fill'
      },
      text: {
        content: '',
        position: { x: 50, y: 50 },
        style: {
          fontSize: 24,
          fontFamily: 'Inter',
          color: '#1e293b',
          padding: 16,
          borderRadius: 8,
          shadow: {
            enabled: false,
            color: '#000000',
            blur: 4,
            offsetX: 0,
            offsetY: 2
          },
          contrast: 'auto'
        }
      }
    };

    updateScene({
      slides: [...(formData?.slides || []), newSlide]
    } as Partial<CardSceneData>);
  };

  const removeSlide = (slideId: string) => {
    if (!canUseCardAuthoring) return;
    
    updateScene({
      slides: formData?.slides.filter(slide => slide.id !== slideId) || []
    } as Partial<CardSceneData>);
  };

  const updateSlide = (slideId: string, updates: Partial<CardSlide>) => {
    if (!canUseCardAuthoring) return;
    
    updateScene({
      slides: formData?.slides.map(slide => 
        slide.id === slideId ? { ...slide, ...updates } : slide
      ) || []
    } as Partial<CardSceneData>);
  };

  // Handle save
  const handleSave = async () => {
    if (!canSave || !formData) return;
    
    const success = await saveScene(formData);
    if (success) {
      onSave(formData);
    }
  };

  // Handle preview
  const handlePreview = async () => {
    if (!canPreview || !formData) return;
    
    const success = await previewScene(formData);
    if (success) {
      onPreview(formData);
    }
  };

  // Permission denied component
  if (!canUseCardAuthoring) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold mb-2">Permission Required</h3>
        <p className="text-muted-foreground mb-4">
          You need Member level access to use card authoring tools.
        </p>
        <Button onClick={onCancel} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </Card>
    );
  }

  return (
    <div className={`card-scene-authoring ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Card Scene Authoring</h2>
          <p className="text-sm text-muted-foreground">
            Create interactive card-based presentations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={!canPreview || state.isPreviewing}
          >
            <Eye className="h-4 w-4 mr-2" />
            {state.isPreviewing ? 'Previewing...' : 'Preview'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave || state.isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {state.isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Error display */}
      {state.errors.length > 0 && (
        <Card className="p-4 border-destructive/20 bg-destructive/5 mb-4">
          <h4 className="font-medium text-destructive mb-2">Validation Errors</h4>
          <ul className="text-sm text-destructive space-y-1">
            {state.errors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="slides">
            <Settings className="h-4 w-4 mr-2" />
            Slides ({formData?.slides.length || 0})
          </TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Slides Tab */}
        <TabsContent value="slides" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Slides</h3>
            <Button onClick={addSlide} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Slide
            </Button>
          </div>

          {formData?.slides.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">🃏</div>
              <h4 className="font-medium mb-2">No Slides Yet</h4>
              <p className="text-muted-foreground mb-4">
                Add your first slide to get started with your card presentation.
              </p>
              <Button onClick={addSlide}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Slide
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData?.slides.map((slide, index) => (
                <Card
                  key={slide.id}
                  className={`cursor-pointer transition-all ${
                    selectedSlide === slide.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedSlide(slide.id)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">
                        {slide.title || `Slide ${index + 1}`}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSlide(slide.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {slide.background.type} background
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          <h3 className="text-lg font-medium">Layout Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
              <select
                id="aspect-ratio"
                value={formData?.layout.aspectRatio}
                onChange={(e) => handleLayoutChange('aspectRatio', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="16:9">16:9 (Widescreen)</option>
                <option value="4:3">4:3 (Standard)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <Label htmlFor="responsive">Responsive</Label>
              <input
                id="responsive"
                type="checkbox"
                checked={formData?.layout.responsive}
                onChange={(e) => handleLayoutChange('responsive', e.target.checked)}
                className="ml-2"
              />
            </div>
          </div>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-4">
          <h3 className="text-lg font-medium">Style Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="global-font">Global Font</Label>
              <Input
                id="global-font"
                value={formData?.style.globalFont}
                onChange={(e) => handleStyleChange('globalFont', e.target.value)}
                placeholder="Inter"
              />
            </div>
          </div>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-4">
          <h3 className="text-lg font-medium">Configuration</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-advance"
                checked={formData?.config.autoAdvance}
                onChange={(e) => handleConfigChange('autoAdvance', e.target.checked)}
              />
              <Label htmlFor="auto-advance">Auto Advance</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="loop-presentation"
                checked={formData?.config.loopPresentation}
                onChange={(e) => handleConfigChange('loopPresentation', e.target.checked)}
              />
              <Label htmlFor="loop-presentation">Loop Presentation</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-progress"
                checked={formData?.config.showProgress}
                onChange={(e) => handleConfigChange('showProgress', e.target.checked)}
              />
              <Label htmlFor="show-progress">Show Progress</Label>
            </div>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <h3 className="text-lg font-medium">Preview</h3>
          <div className="border border-border rounded-lg p-8 text-center bg-muted/20">
            <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Preview functionality will be implemented here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CardSceneAuthoring;
