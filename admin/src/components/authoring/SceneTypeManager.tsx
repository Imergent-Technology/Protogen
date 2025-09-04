import React, { useState } from 'react';
import { Plus, FileText, Grid, Layers, Image, Code, Settings } from 'lucide-react';
import { Button, Card, Badge } from '@progress/shared';

// Types for scene types
export interface SceneType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'content' | 'interactive' | 'presentation' | 'custom';
  features: string[];
  isBuiltIn: boolean;
  isEnabled: boolean;
}

export interface SceneTypeManagerProps {
  availableTypes: SceneType[];
  onCreateScene: (type: SceneType) => void;
  onEditType?: (type: SceneType) => void;
  onToggleType?: (type: SceneType) => void;
  className?: string;
}

const SceneTypeManager: React.FC<SceneTypeManagerProps> = ({
  availableTypes: _availableTypes,
  onCreateScene,
  onEditType: _onEditType,
  onToggleType,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Built-in scene types
  const _builtInTypes: SceneType[] = [
    {
      id: 'graph',
      name: 'Graph Scene',
      description: 'Interactive graph visualization with nodes and edges',
      icon: Grid,
      category: 'interactive',
      features: ['Node selection', 'Edge management', 'Interactive layout', 'Real-time updates'],
      isBuiltIn: true,
      isEnabled: true
    },
    {
      id: 'card',
      name: 'Card Scene',
      description: 'Card-based presentation with rich media content',
      icon: Layers,
      category: 'presentation',
      features: ['Rich media', 'Card layouts', 'Navigation', 'Responsive design'],
      isBuiltIn: true,
      isEnabled: true
    },
    {
      id: 'document',
      name: 'Document Scene',
      description: 'Text-based content with formatting and structure',
      icon: FileText,
      category: 'content',
      features: ['Rich text', 'Markdown support', 'TOC generation', 'Search'],
      isBuiltIn: true,
      isEnabled: true
    },
    {
      id: 'image',
      name: 'Image Scene',
      description: 'Image gallery and media presentation',
      icon: Image,
      category: 'presentation',
      features: ['Image gallery', 'Zoom controls', 'Lightbox', 'Responsive'],
      isBuiltIn: true,
      isEnabled: true
    },
    {
      id: 'custom',
      name: 'Custom Scene',
      description: 'Fully customizable scene with custom components',
      icon: Code,
      category: 'custom',
      features: ['Custom components', 'Flexible layout', 'API integration', 'Extensible'],
      isBuiltIn: true,
      isEnabled: true
    }
  ];

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(_builtInTypes.map(type => type.category)))];

  // Filter types by category
  const filteredTypes = selectedCategory === 'all' 
    ? _builtInTypes 
    : _builtInTypes.filter(type => type.category === selectedCategory);

  // Combine built-in and available types (for future use)
  // const _allTypes = [..._builtInTypes, ...availableTypes.filter(type => !type.isBuiltIn)];

  return (
    <div className={`scene-type-manager ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create New Scene</h2>
        <p className="text-muted-foreground">
          Choose a scene type to get started with your content creation
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Types' : category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Scene types grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !type.isEnabled ? 'opacity-50' : ''
              }`}
              onClick={() => type.isEnabled && onCreateScene(type)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{type.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {type.category}
                        </Badge>
                        {type.isBuiltIn && (
                          <Badge variant="secondary" className="text-xs">
                            Built-in
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {onToggleType && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleType(type);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {type.description}
                </p>

                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Features
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {type.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {type.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{type.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    className="w-full"
                    disabled={!type.isEnabled}
                    onClick={() => type.isEnabled && onCreateScene(type)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create {type.name}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredTypes.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No scene types found</h3>
          <p className="text-muted-foreground">
            No scene types match the selected category. Try selecting a different category.
          </p>
        </div>
      )}
    </div>
  );
};

export default SceneTypeManager;
