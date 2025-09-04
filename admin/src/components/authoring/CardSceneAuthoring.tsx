import React, { useState, useEffect } from 'react';
import { Save, Eye, Plus, Trash2, Move, Settings } from 'lucide-react';
import { Button, Input, Label, Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@progress/shared';

// Types for card scene authoring
export interface CardSceneData {
  id?: string;
  name: string;
  description?: string;
  type: 'card';
  metadata: {
    title?: string;
    subtitle?: string;
    author?: string;
    version?: string;
    tags?: string[];
  };
  content: {
    slides: CardSlide[];
    layout: CardLayout;
    transitions: CardTransition[];
  };
  style: {
    theme?: string;
    typography?: Record<string, any>;
    colors?: Record<string, any>;
  };
  config: {
    autoAdvance?: boolean;
    showProgress?: boolean;
    allowNavigation?: boolean;
    loopPresentation?: boolean;
  };
}

export interface CardSlide {
  id: string;
  title: string;
  content: CardSlideContent;
  order: number;
  duration?: number; // in seconds
  transition?: string;
}

export interface CardSlideContent {
  type: 'text' | 'image' | 'video' | 'mixed' | 'interactive';
  text?: string;
  media?: {
    url: string;
    alt?: string;
    caption?: string;
  };
  layout?: 'center' | 'left' | 'right' | 'split' | 'grid';
  background?: {
    color?: string;
    image?: string;
    gradient?: string;
  };
}

export interface CardLayout {
  aspectRatio: '16:9' | '4:3' | '1:1' | 'custom';
  width?: number;
  height?: number;
  padding?: string;
  margin?: string;
}

export interface CardTransition {
  type: 'fade' | 'slide' | 'zoom' | 'flip' | 'none';
  duration: number;
  easing?: string;
}

export interface CardSceneAuthoringProps {
  scene?: CardSceneData;
  availableNodes: any[];
  onSave: (scene: CardSceneData) => void;
  onPreview: (scene: CardSceneData) => void;
  onCancel: () => void;
  className?: string;
}

const CardSceneAuthoring: React.FC<CardSceneAuthoringProps> = ({
  scene,
  availableNodes: _availableNodes,
  onSave,
  onPreview,
  onCancel,
  className = ''
}) => {
  // Form state
  const [formData, setFormData] = useState<CardSceneData>({
    name: '',
    description: '',
    type: 'card',
    metadata: {
      title: '',
      subtitle: '',
      author: '',
      version: '1.0.0',
      tags: []
    },
    content: {
      slides: [],
      layout: {
        aspectRatio: '16:9',
        padding: '2rem',
        margin: '0 auto'
      },
      transitions: []
    },
    style: {
      theme: 'default',
      typography: {},
      colors: {}
    },
    config: {
      autoAdvance: false,
      showProgress: true,
      allowNavigation: true,
      loopPresentation: false
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'slides' | 'layout' | 'style' | 'config'>('slides');
  const [_selectedSlide, _setSelectedSlide] = useState<string | null>(null);

  // Initialize form data
  useEffect(() => {
    if (scene) {
      setFormData(scene);
    }
  }, [scene]);

  // Handle form field changes (for future use)
  // const handleFieldChange = (field: string, value: any) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     [field]: value
  //   }));
  // };

  // const handleMetadataChange = (field: string, value: any) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     metadata: {
  //       ...prev.metadata,
  //       [field]: value
  //     }
  //   }));
  // };

  const handleConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  // Handle slide management
  const addSlide = () => {
    const newSlide: CardSlide = {
      id: `slide_${Date.now()}`,
      title: `Slide ${formData.content.slides.length + 1}`,
      content: {
        type: 'text',
        text: 'Enter your slide content here...',
        layout: 'center'
      },
      order: formData.content.slides.length,
      duration: 5
    };
    
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        slides: [...prev.content.slides, newSlide]
      }
    }));
  };

  const removeSlide = (slideId: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        slides: prev.content.slides.filter(slide => slide.id !== slideId)
      }
    }));
  };

  const updateSlide = (slideId: string, updates: Partial<CardSlide>) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        slides: prev.content.slides.map(slide => 
          slide.id === slideId ? { ...slide, ...updates } : slide
        )
      }
    }));
  };

  // Handle save
  const handleSave = () => {
    onSave(formData);
  };

  // Handle preview
  const handlePreview = () => {
    onPreview(formData);
  };

  return (
    <div className={`card-scene-authoring ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {scene ? 'Edit Card Scene' : 'Create Card Scene'}
          </h2>
          <p className="text-muted-foreground">
            🚨 **DESIGN MILESTONE** - Card Scene Authoring requires detailed user feedback for powerful presentation capabilities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Scene
          </Button>
        </div>
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="slides">Slides</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>

        {/* Slides Tab */}
        <TabsContent value="slides" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Slide Management</h3>
              <Button onClick={addSlide}>
                <Plus className="h-4 w-4 mr-2" />
                Add Slide
              </Button>
            </div>
            
            {formData.content.slides.length > 0 ? (
              <div className="space-y-4">
                {formData.content.slides.map((slide, index) => (
                  <div key={slide.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <Input
                          value={slide.title}
                          onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                          className="font-medium"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Move className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSlide(slide.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Type: {slide.content.type} | Duration: {slide.duration}s
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No slides created yet</p>
                <p className="text-sm">Add slides to create your presentation</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Layout Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                <select
                  id="aspectRatio"
                  value={formData.content.layout.aspectRatio}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      layout: {
                        ...prev.content.layout,
                        aspectRatio: e.target.value as any
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="16:9">16:9 (Widescreen)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Visual Styling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={formData.style.theme || 'default'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    style: { ...prev.style, theme: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="colorful">Colorful</option>
                </select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Presentation Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoAdvance">Auto Advance</Label>
                  <p className="text-sm text-muted-foreground">Automatically advance to next slide</p>
                </div>
                <input
                  type="checkbox"
                  id="autoAdvance"
                  checked={formData.config.autoAdvance || false}
                  onChange={(e) => handleConfigChange('autoAdvance', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showProgress">Show Progress</Label>
                  <p className="text-sm text-muted-foreground">Display progress indicator</p>
                </div>
                <input
                  type="checkbox"
                  id="showProgress"
                  checked={formData.config.showProgress || false}
                  onChange={(e) => handleConfigChange('showProgress', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowNavigation">Allow Navigation</Label>
                  <p className="text-sm text-muted-foreground">Enable manual slide navigation</p>
                </div>
                <input
                  type="checkbox"
                  id="allowNavigation"
                  checked={formData.config.allowNavigation || false}
                  onChange={(e) => handleConfigChange('allowNavigation', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="loopPresentation">Loop Presentation</Label>
                  <p className="text-sm text-muted-foreground">Restart from beginning when finished</p>
                </div>
                <input
                  type="checkbox"
                  id="loopPresentation"
                  checked={formData.config.loopPresentation || false}
                  onChange={(e) => handleConfigChange('loopPresentation', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Design Milestone Notice */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">🚨 Design Milestone: Card Scene Authoring</h4>
        <p className="text-yellow-700 text-sm">
          This component requires detailed user feedback to implement powerful presentation capabilities. 
          The current implementation is a basic structure that will be enhanced based on your specifications.
        </p>
      </div>
    </div>
  );
};

export default CardSceneAuthoring;
