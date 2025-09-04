import React, { useState, useEffect } from 'react';
import { Save, Eye, Plus, Trash2, Settings, Play, X } from 'lucide-react';
import { Button, Input, Label, Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Textarea } from '@progress/shared';

// Types for enhanced card scene authoring
export interface CardSceneData {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  metadata: Record<string, any>;
  slides: CardSlide[];
  layout: {
    aspectRatio: '16:9' | '4:3' | '1:1' | 'custom';
    customWidth?: number;
    customHeight?: number;
    responsive: boolean;
  };
  style: {
    globalFont?: string;
    globalColors?: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
  };
  config: {
    autoAdvance: boolean;
    autoAdvanceDelay: number; // in ms
    loopPresentation: boolean;
    showProgress: boolean;
    allowNavigation: boolean;
    transitionEffect: 'fade' | 'slide' | 'zoom' | 'flip' | 'none';
    fullScreenMode: boolean;
  };
}

export interface CardSlide {
  id: string;
  title?: string;
  background: {
    type: 'image' | 'video' | 'color' | 'gradient';
    source?: string; // URL for image/video
    color?: string; // Hex color
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      direction?: string; // for linear gradients
    };
    fit: 'fill' | 'fit' | 'center' | 'tile'; // CSS background-fit inspired options
  };
  text: {
    content: string; // Rich text HTML
    position: {
      x: number; // percentage
      y: number; // percentage
    };
    style: {
      fontSize: number;
      fontFamily: string;
      color: string;
      backgroundColor?: string;
      padding: number;
      borderRadius: number;
      shadow: {
        enabled: boolean;
        color: string;
        blur: number;
        offsetX: number;
        offsetY: number;
      };
      contrast: 'auto' | 'dark' | 'light' | 'custom';
    };
    animation?: {
      delay: number; // ms before text appears
      duration: number; // ms for fade in/out
      fadeIn: boolean;
      fadeOut: boolean;
    };
  };
  callToAction?: {
    type: 'button' | 'fullscreen' | 'timed';
    text: string;
    position: {
      x: number; // percentage
      y: number; // percentage
    };
    style: {
      backgroundColor: string;
      textColor: string;
      padding: number;
      borderRadius: number;
      fontSize: number;
    };
    timing?: {
      showAfter: number; // ms after slide starts
      duration?: number; // ms to show (for timed)
    };
    pulse?: boolean; // for fullscreen click trigger
  };
  duration?: number; // Custom duration for this slide in auto-advance mode
  metadata?: Record<string, any>;
}

export interface CardSceneAuthoringProps {
  scene?: CardSceneData;
  availableNodes: any[]; // For potential node integration in interactive cards
  onSave: (sceneData: CardSceneData) => void;
  onPreview: (sceneData: CardSceneData) => void;
  onCancel: () => void;
  className?: string;
}

const CardSceneAuthoring: React.FC<CardSceneAuthoringProps> = ({
  scene,
  availableNodes: _availableNodes, // Renamed to resolve linting
  onSave,
  onPreview,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState<CardSceneData>(
    scene || {
      name: '',
      slug: '',
      description: '',
      metadata: {},
      slides: [],
      layout: {
        aspectRatio: '16:9',
        responsive: true,
      },
      style: {
        globalFont: 'Inter',
        globalColors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          background: '#ffffff',
          text: '#1e293b'
        }
      },
      config: {
        autoAdvance: false,
        autoAdvanceDelay: 5000,
        loopPresentation: false,
        showProgress: true,
        allowNavigation: true,
        transitionEffect: 'fade',
        fullScreenMode: true,
      },
    }
  );

  // UI state
  const [activeTab, setActiveTab] = useState<'slides' | 'layout' | 'style' | 'config' | 'preview'>('slides');
  const [selectedSlide, setSelectedSlide] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (scene) {
      setFormData(scene);
    }
  }, [scene]);

  // Handle form field changes (for future use)
  // const handleFieldChange = (field: keyof CardSceneData, value: any) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     [field]: value
  //   }));
  // };

  const handleConfigChange = (field: keyof CardSceneData['config'], value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  const handleLayoutChange = (field: keyof CardSceneData['layout'], value: any) => {
    setFormData(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [field]: value
      }
    }));
  };

  const handleStyleChange = (field: keyof CardSceneData['style'], value: any) => {
    setFormData(prev => ({
      ...prev,
      style: {
        ...prev.style,
        [field]: value
      }
    }));
  };

  // Slide management
  const addSlide = () => {
    const newSlide: CardSlide = {
      id: `slide_${Date.now()}`,
      title: `Slide ${formData.slides.length + 1}`,
      background: {
        type: 'color',
        color: '#f8fafc',
        fit: 'fill'
      },
      text: {
        content: '<p>Enter your slide content here...</p>',
        position: { x: 50, y: 50 },
        style: {
          fontSize: 24,
          fontFamily: 'Inter',
          color: '#1e293b',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 16,
          borderRadius: 8,
          shadow: {
            enabled: true,
            color: 'rgba(0, 0, 0, 0.1)',
            blur: 4,
            offsetX: 0,
            offsetY: 2
          },
          contrast: 'auto'
        }
      }
    };
    setFormData(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    setSelectedSlide(newSlide.id);
  };

  const removeSlide = (slideId: string) => {
    setFormData(prev => ({
      ...prev,
      slides: prev.slides.filter(slide => slide.id !== slideId)
    }));
    if (selectedSlide === slideId) {
      setSelectedSlide(null);
    }
  };

  const updateSlide = (slideId: string, updates: Partial<CardSlide>) => {
    setFormData(prev => ({
      ...prev,
      slides: prev.slides.map(slide =>
        slide.id === slideId ? { ...slide, ...updates } : slide
      )
    }));
  };

  const getCurrentSlide = () => {
    return formData.slides.find(slide => slide.id === selectedSlide);
  };

  // Preview slide rendering
  const renderSlidePreview = (slide: CardSlide) => {
    const aspectRatio = formData.layout.aspectRatio;
    const ratioMap = {
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]',
      '1:1': 'aspect-square',
      'custom': 'aspect-video'
    };

    return (
      <div className={`relative ${ratioMap[aspectRatio]} bg-gray-100 rounded-lg overflow-hidden`}>
        {/* Background */}
        {slide.background.type === 'color' && (
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: slide.background.color }}
          />
        )}
        {slide.background.type === 'image' && slide.background.source && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${slide.background.source})`,
              backgroundSize: slide.background.fit === 'fill' ? 'cover' : 
                            slide.background.fit === 'fit' ? 'contain' : 'auto'
            }}
          />
        )}
        {slide.background.type === 'video' && slide.background.source && (
          <video 
            className="absolute inset-0 w-full h-full object-cover"
            src={slide.background.source}
            muted
            loop
          />
        )}

        {/* Text Content */}
        <div 
          className="absolute"
          style={{
            left: `${slide.text.position.x}%`,
            top: `${slide.text.position.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${slide.text.style.fontSize}px`,
            fontFamily: slide.text.style.fontFamily,
            color: slide.text.style.color,
            backgroundColor: slide.text.style.backgroundColor,
            padding: `${slide.text.style.padding}px`,
            borderRadius: `${slide.text.style.borderRadius}px`,
            boxShadow: slide.text.style.shadow.enabled 
              ? `${slide.text.style.shadow.offsetX}px ${slide.text.style.shadow.offsetY}px ${slide.text.style.shadow.blur}px ${slide.text.style.shadow.color}`
              : 'none'
          }}
          dangerouslySetInnerHTML={{ __html: slide.text.content }}
        />

        {/* Call to Action */}
        {slide.callToAction && (
          <div 
            className="absolute"
            style={{
              left: `${slide.callToAction.position.x}%`,
              top: `${slide.callToAction.position.y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: slide.callToAction.style.backgroundColor,
              color: slide.callToAction.style.textColor,
              padding: `${slide.callToAction.style.padding}px`,
              borderRadius: `${slide.callToAction.style.borderRadius}px`,
              fontSize: `${slide.callToAction.style.fontSize}px`,
              animation: slide.callToAction.pulse ? 'pulse 2s infinite' : 'none'
            }}
          >
            {slide.callToAction.text}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`card-scene-authoring flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {scene ? `Edit Card Scene: ${scene.name}` : 'Create New Card Scene'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye className="h-4 w-4 mr-2" /> {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          <Button variant="outline" onClick={() => onPreview(formData)}>
            <Play className="h-4 w-4 mr-2" /> Preview
          </Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="h-4 w-4 mr-2" /> Save Card Scene
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" /> Cancel
          </Button>
        </div>
      </div>

      {isPreviewMode ? (
        /* Preview Mode */
        <div className="flex-1 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-4">Card Scene Preview</h2>
            <div className="max-w-4xl mx-auto">
              {formData.slides.length === 0 ? (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🃏</div>
                    <p className="text-muted-foreground">No slides to preview</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.slides.map((slide, index) => (
                    <div key={slide.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Slide {index + 1}: {slide.title}</h3>
                        <Badge variant="outline">{slide.background.type}</Badge>
                      </div>
                      {renderSlidePreview(slide)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="slides">Slides</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="slides" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Slides ({formData.slides.length})</h3>
              <Button onClick={addSlide}>
                <Plus className="h-4 w-4 mr-2" /> Add Slide
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Slide List */}
              <div className="space-y-2">
                {formData.slides.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">🃏</div>
                    <p>No slides yet. Click "Add Slide" to begin.</p>
                  </div>
                ) : (
                  formData.slides.map((slide, index) => (
                    <Card 
                      key={slide.id} 
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedSlide === slide.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedSlide(slide.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Slide {index + 1}</h4>
                          <p className="text-sm text-muted-foreground">{slide.title}</p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {slide.background.type}
                            </Badge>
                            {slide.callToAction && (
                              <Badge variant="outline" className="text-xs">
                                CTA
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement slide editing
                          }}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            removeSlide(slide.id);
                          }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Slide Editor */}
              <div className="space-y-4">
                {selectedSlide && getCurrentSlide() ? (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Edit Slide: {getCurrentSlide()?.title}</h4>
                    
                    {/* Basic Slide Info */}
                    <div className="space-y-2">
                      <Label htmlFor="slideTitle">Slide Title</Label>
                      <Input
                        id="slideTitle"
                        value={getCurrentSlide()?.title || ''}
                        onChange={(e) => updateSlide(selectedSlide, { title: e.target.value })}
                        placeholder="Enter slide title"
                      />
                    </div>

                    {/* Background Settings */}
                    <div className="space-y-2">
                      <Label>Background</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={getCurrentSlide()?.background.type || 'color'}
                          onChange={(e) => updateSlide(selectedSlide, {
                            background: {
                              ...getCurrentSlide()?.background!,
                              type: e.target.value as any
                            }
                          })}
                          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                        >
                          <option value="color">Color</option>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                          <option value="gradient">Gradient</option>
                        </select>
                        <select
                          value={getCurrentSlide()?.background.fit || 'fill'}
                          onChange={(e) => updateSlide(selectedSlide, {
                            background: {
                              ...getCurrentSlide()?.background!,
                              fit: e.target.value as any
                            }
                          })}
                          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                        >
                          <option value="fill">Fill</option>
                          <option value="fit">Fit</option>
                          <option value="center">Center</option>
                          <option value="tile">Tile</option>
                        </select>
                      </div>
                      
                      {getCurrentSlide()?.background.type === 'color' && (
                        <Input
                          type="color"
                          value={getCurrentSlide()?.background.color || '#f8fafc'}
                          onChange={(e) => updateSlide(selectedSlide, {
                            background: {
                              ...getCurrentSlide()?.background!,
                              color: e.target.value
                            }
                          })}
                          className="w-full h-10"
                        />
                      )}
                      
                      {(getCurrentSlide()?.background.type === 'image' || getCurrentSlide()?.background.type === 'video') && (
                        <Input
                          type="url"
                          placeholder="Enter image/video URL"
                          value={getCurrentSlide()?.background.source || ''}
                          onChange={(e) => updateSlide(selectedSlide, {
                            background: {
                              ...getCurrentSlide()?.background!,
                              source: e.target.value
                            }
                          })}
                        />
                      )}
                    </div>

                    {/* Text Content */}
                    <div className="space-y-2">
                      <Label>Text Content</Label>
                      <Textarea
                        value={getCurrentSlide()?.text.content || ''}
                        onChange={(e) => updateSlide(selectedSlide, {
                          text: {
                            ...getCurrentSlide()?.text!,
                            content: e.target.value
                          }
                        })}
                        rows={4}
                        placeholder="Enter slide text content (HTML supported)"
                      />
                    </div>

                    {/* Call to Action */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Call to Action</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentSlide = getCurrentSlide();
                            if (currentSlide) {
                              updateSlide(selectedSlide, {
                                callToAction: currentSlide.callToAction ? undefined : {
                                  type: 'button',
                                  text: 'Click Here',
                                  position: { x: 50, y: 80 },
                                  style: {
                                    backgroundColor: '#3b82f6',
                                    textColor: '#ffffff',
                                    padding: 12,
                                    borderRadius: 6,
                                    fontSize: 16
                                  },
                                  pulse: false
                                }
                              });
                            }
                          }}
                        >
                          {getCurrentSlide()?.callToAction ? 'Remove CTA' : 'Add CTA'}
                        </Button>
                      </div>
                      
                      {getCurrentSlide()?.callToAction && (
                        <div className="space-y-2 p-3 border border-border rounded-md">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="CTA Text"
                              value={getCurrentSlide()?.callToAction?.text || ''}
                              onChange={(e) => updateSlide(selectedSlide, {
                                callToAction: {
                                  ...getCurrentSlide()?.callToAction!,
                                  text: e.target.value
                                }
                              })}
                            />
                            <select
                              value={getCurrentSlide()?.callToAction?.type || 'button'}
                              onChange={(e) => updateSlide(selectedSlide, {
                                callToAction: {
                                  ...getCurrentSlide()?.callToAction!,
                                  type: e.target.value as any
                                }
                              })}
                              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                            >
                              <option value="button">Button</option>
                              <option value="fullscreen">Fullscreen Click</option>
                              <option value="timed">Timed Display</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Slide Preview */}
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      {renderSlidePreview(getCurrentSlide()!)}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">👆</div>
                    <p>Select a slide to edit</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <h3 className="text-lg font-semibold">Layout Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                <select
                  id="aspectRatio"
                  value={formData.layout.aspectRatio}
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
                <Label>
                  <input
                    type="checkbox"
                    checked={formData.layout.responsive}
                    onChange={(e) => handleLayoutChange('responsive', e.target.checked)}
                    className="mr-2"
                  />
                  Responsive Design
                </Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <h3 className="text-lg font-semibold">Global Styling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="globalFont">Default Font</Label>
                <select
                  id="globalFont"
                  value={formData.style.globalFont || 'Inter'}
                  onChange={(e) => handleStyleChange('globalFont', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <h3 className="text-lg font-semibold">Presentation Configuration</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>
                    <input
                      type="checkbox"
                      checked={formData.config.autoAdvance}
                      onChange={(e) => handleConfigChange('autoAdvance', e.target.checked)}
                      className="mr-2"
                    />
                    Auto-Advance Slides
                  </Label>
                </div>
                
                <div>
                  <Label>
                    <input
                      type="checkbox"
                      checked={formData.config.loopPresentation}
                      onChange={(e) => handleConfigChange('loopPresentation', e.target.checked)}
                      className="mr-2"
                    />
                    Loop Presentation
                  </Label>
                </div>
                
                <div>
                  <Label>
                    <input
                      type="checkbox"
                      checked={formData.config.showProgress}
                      onChange={(e) => handleConfigChange('showProgress', e.target.checked)}
                      className="mr-2"
                    />
                    Show Progress Indicator
                  </Label>
                </div>
                
                <div>
                  <Label>
                    <input
                      type="checkbox"
                      checked={formData.config.allowNavigation}
                      onChange={(e) => handleConfigChange('allowNavigation', e.target.checked)}
                      className="mr-2"
                    />
                    Allow Manual Navigation
                  </Label>
                </div>
              </div>

              {formData.config.autoAdvance && (
                <div>
                  <Label htmlFor="autoAdvanceDelay">Auto-Advance Delay (ms)</Label>
                  <Input
                    id="autoAdvanceDelay"
                    type="number"
                    value={formData.config.autoAdvanceDelay}
                    onChange={(e) => handleConfigChange('autoAdvanceDelay', parseInt(e.target.value) || 0)}
                    min="1000"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="transitionEffect">Transition Effect</Label>
                <select
                  id="transitionEffect"
                  value={formData.config.transitionEffect}
                  onChange={(e) => handleConfigChange('transitionEffect', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                  <option value="flip">Flip</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default CardSceneAuthoring;