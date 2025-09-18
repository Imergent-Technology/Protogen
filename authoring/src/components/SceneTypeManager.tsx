import React, { useState } from 'react';
import { Plus, FileText, Grid, Layers, Image, Code, Settings } from 'lucide-react';
import { Button, Card, Badge } from '@protogen/shared';
import { SceneType, SceneTypeManagerProps, SceneTypeId } from '../types';
import { useAuthoringPermissions } from '../hooks/useAuthoringPermissions';

const SceneTypeManager: React.FC<SceneTypeManagerProps> = ({
  availableTypes = [],
  onCreateScene,
  onEditType,
  onToggleType,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const permissions = useAuthoringPermissions();

  // Built-in scene types
  const builtInTypes: SceneType[] = [
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
      id: 'dashboard',
      name: 'Dashboard Scene',
      description: 'Custom dashboard with multiple components',
      icon: Grid,
      category: 'interactive',
      features: ['Widgets', 'Data visualization', 'Real-time updates', 'Customizable'],
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

  // Combine built-in and available types
  const allTypes = [...builtInTypes, ...availableTypes.filter(type => !type.isBuiltIn)];

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(allTypes.map(type => type.category)))];

  // Filter types by category
  const filteredTypes = selectedCategory === 'all' 
    ? allTypes 
    : allTypes.filter(type => type.category === selectedCategory);

  // Check if user can create specific scene type
  const canCreateSceneType = (typeId: string): boolean => {
    return permissions.canCreateScene(typeId as SceneTypeId);
  };

  // Handle scene creation with permission check
  const handleCreateScene = (type: SceneType) => {
    if (!canCreateSceneType(type.id)) {
      return;
    }
    onCreateScene(type);
  };

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
          const canCreate = canCreateSceneType(type.id);
          
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !type.isEnabled || !canCreate ? 'opacity-50' : ''
              }`}
              onClick={() => type.isEnabled && canCreate && handleCreateScene(type)}
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
                        {!canCreate && (
                          <Badge variant="destructive" className="text-xs">
                            Restricted
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
                    disabled={!type.isEnabled || !canCreate}
                    onClick={() => type.isEnabled && canCreate && handleCreateScene(type)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {!canCreate ? 'Permission Required' : `Create ${type.name}`}
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

      {/* Permission info */}
      {filteredTypes.some(type => !canCreateSceneType(type.id)) && (
        <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Some scene types require higher access levels. Upgrade your account to unlock more features.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneTypeManager;
