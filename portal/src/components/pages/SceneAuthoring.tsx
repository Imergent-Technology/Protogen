import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '@protogen/shared';
import { apiClient } from '../../services/apiClient';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Layers,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';
import { useSlide } from '../../systems/slide';
import { SlideContainer, SlideControls, SlidePreview } from '../slide';

interface Scene {
  id: number;
  guid: string;
  name: string;
  slug: string;
  description?: string;
  scene_type: 'graph' | 'card' | 'document' | 'dashboard';
  config?: any;
  meta?: any;
  style?: any;
  is_active: boolean;
  is_public: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  items?: SceneItem[];
  slides?: Slide[];
}

interface SceneItem {
  id: number;
  scene_id: number;
  slide_id?: number;
  item_type: string;
  item_id?: number;
  item_guid?: string;
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number };
  style?: any;
  meta?: any;
  is_visible: boolean;
  z_index: number;
}

interface Slide {
  id: number;
  scene_id: number;
  name: string;
  description?: string;
  slide_index: number;
  is_active: boolean;
  transition_config?: any;
  slide_items?: SlideItem[];
}

interface SlideItem {
  id: number;
  slide_id: number;
  node_id: number;
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  opacity: number;
  visible: boolean;
  style?: any;
  transition_config?: any;
}

export const SceneAuthoring: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [isCreatingScene, setIsCreatingScene] = useState(false);
  const [isCreatingSlide, setIsCreatingSlide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Slide system integration
  const slideSystem = useSlide(selectedScene?.id?.toString() || '');

  // Load scenes on component mount
  useEffect(() => {
    loadScenes();
  }, []);

  const loadScenes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get('/scenes');
      setScenes(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scenes');
    } finally {
      setLoading(false);
    }
  };

  const createScene = async (sceneData: Partial<Scene>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.post('/scenes', sceneData);
      setScenes(prev => [data.data, ...prev]);
      setIsCreatingScene(false);
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scene');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createSampleScene = async () => {
    const sampleScene = await createScene({
      name: 'Sample Presentation Scene',
      slug: `sample-scene-${Date.now()}`,
      description: 'A sample scene for testing slide functionality',
      scene_type: 'card',
      config: {
        layout: 'grid',
        columns: 3,
        spacing: 20
      },
      is_active: true,
      is_public: true,
    });

    if (sampleScene) {
      // Create sample scene items
      await createSampleSceneItems(sampleScene.id);
      // Create sample slides
      await createSampleSlides(sampleScene.id);
      // Load the new scene
      await loadScenes();
      setSelectedScene(sampleScene);
    }
  };

  const createSampleSceneItems = async (sceneId: number) => {
    const sampleItems = [
      {
        scene_id: sceneId,
        item_type: 'text',
        position: { x: 100, y: 100, z: 0 },
        dimensions: { width: 200, height: 100 },
        style: { backgroundColor: '#e3f2fd', padding: '16px' },
        meta: { content: 'Welcome to our presentation!' },
        is_visible: true,
        z_index: 1
      },
      {
        scene_id: sceneId,
        item_type: 'image',
        position: { x: 400, y: 100, z: 0 },
        dimensions: { width: 300, height: 200 },
        style: { borderRadius: '8px' },
        meta: { src: 'https://via.placeholder.com/300x200', alt: 'Sample image' },
        is_visible: true,
        z_index: 1
      },
      {
        scene_id: sceneId,
        item_type: 'text',
        position: { x: 100, y: 350, z: 0 },
        dimensions: { width: 600, height: 150 },
        style: { backgroundColor: '#f3e5f5', padding: '16px' },
        meta: { content: 'This is a sample scene with multiple items that can be animated between different slides.' },
        is_visible: true,
        z_index: 1
      }
    ];

    for (const item of sampleItems) {
      await apiClient.post('/scenes/scene-items', item);
    }
  };

  const createSampleSlides = async (sceneId: number) => {
    const sampleSlides = [
      {
        scene_id: sceneId,
        name: 'Introduction',
        description: 'Welcome slide',
        slide_index: 0,
        is_active: true,
        transition_config: { duration: 500, easing: 'ease-in-out' }
      },
      {
        scene_id: sceneId,
        name: 'Main Content',
        description: 'Primary content slide',
        slide_index: 1,
        is_active: false,
        transition_config: { duration: 750, easing: 'ease-out' }
      },
      {
        scene_id: sceneId,
        name: 'Conclusion',
        description: 'Closing slide',
        slide_index: 2,
        is_active: false,
        transition_config: { duration: 500, easing: 'ease-in' }
      }
    ];

    for (const slide of sampleSlides) {
      const slideData = await apiClient.post(`/slides/scene/${sceneId}`, slide);
      // Create slide items for this slide
      await createSampleSlideItems(slideData.id, slide.slide_index);
    }
  };

  const createSampleSlideItems = async (slideId: number, slideIndex: number) => {
    // Different positions for each slide to show animation
    const positions = [
      { x: 100, y: 100 }, // Introduction
      { x: 200, y: 150 }, // Main Content
      { x: 300, y: 200 }, // Conclusion
    ];

    const scales = [
      { x: 1, y: 1 }, // Introduction
      { x: 1.2, y: 1.2 }, // Main Content
      { x: 0.8, y: 0.8 }, // Conclusion
    ];

    const opacities = [
      1.0, // Introduction
      0.8, // Main Content
      0.6, // Conclusion
    ];

    // Create slide items for each scene item (assuming we have 3 scene items)
    for (let nodeId = 1; nodeId <= 3; nodeId++) {
      const slideItem = {
        slide_id: slideId,
        node_id: nodeId,
        position: positions[slideIndex] || positions[0],
        scale: scales[slideIndex] || scales[0],
        rotation: slideIndex * 10, // Slight rotation for each slide
        opacity: opacities[slideIndex] || 1.0,
        visible: true,
        style: { 
          filter: `hue-rotate(${slideIndex * 60}deg)`,
          transform: `rotate(${slideIndex * 5}deg)`
        },
        transition_config: { duration: 1000, easing: 'ease-in-out' }
      };

      await apiClient.post(`/slide-items/slide/${slideId}`, slideItem);
    }
  };

  const loadSceneSlides = async (sceneId: number) => {
    try {
      const slides = await apiClient.get(`/slides/scene/${sceneId}`);
      return slides;
    } catch (err) {
      console.error('Failed to load slides:', err);
    }
    return [];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scene Authoring</h1>
          <p className="text-muted-foreground">
            Create and manage scenes with slides for interactive presentations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={createSampleScene} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Sample Scene</span>
          </Button>
          <Button onClick={() => setIsCreatingScene(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Scene
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scene List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Scenes</CardTitle>
              <CardDescription>Select a scene to edit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <div className="text-center py-4">Loading scenes...</div>
              ) : scenes.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No scenes found. Create one to get started.
                </div>
              ) : (
                scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedScene?.id === scene.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedScene(scene)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm">{scene.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {scene.scene_type} • {scene.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scene Editor */}
        <div className="lg:col-span-2">
          {selectedScene ? (
            <div className="space-y-6">
              {/* Scene Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Layers className="h-5 w-5" />
                    <span>{selectedScene.name}</span>
                  </CardTitle>
                  <CardDescription>{selectedScene.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {selectedScene.scene_type}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {selectedScene.is_active ? 'Active' : 'Inactive'}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(selectedScene.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Public:</span> {selectedScene.is_public ? 'Yes' : 'No'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Slide Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Slides</CardTitle>
                      <CardDescription>Manage slides for this scene</CardDescription>
                    </div>
                    <Button onClick={() => setIsCreatingSlide(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Slide
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Slide Controls */}
                    <SlideControls sceneId={selectedScene.id.toString()} />
                    
                    {/* Slide Container */}
                    <div className="border border-border rounded-lg p-4 min-h-[400px]">
                      <SlideContainer sceneId={selectedScene.id.toString()} />
                    </div>
                    
                    {/* Slide Previews */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* This would show slide previews */}
                      <div className="text-center py-8 text-muted-foreground">
                        Slide previews will appear here
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Scene Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a scene from the list to start editing, or create a new one.
                </p>
                <Button onClick={createSampleScene}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sample Scene
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
