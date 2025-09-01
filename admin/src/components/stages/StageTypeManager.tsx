import { useState } from 'react';
import { Stage } from '@progress/shared';
import { Button } from '@progress/shared';
import { Modal } from '../common/Modal';
import { DocumentStageConfig as DocumentStageConfigComponent } from './DocumentStageConfig';
import { 
  FileText, 
  Network, 
  Table, 
  Code, 
  Eye, 
  EyeOff,
  Edit,
  Save,
  X
} from 'lucide-react';

interface StageTypeManagerProps {
  stage: Stage;
  onUpdate: (stage: Stage) => void;
  onClose: () => void;
}

const stageTypeConfigs = {
  basic: {
    name: 'Basic Stage',
    description: 'Simple content display with text and basic formatting',
    icon: FileText,
    color: 'text-blue-500',
    features: ['Text content', 'Basic formatting', 'Simple layout']
  },
  document: {
    name: 'Document Stage',
    description: 'Rich text document with advanced formatting options',
    icon: FileText,
    color: 'text-green-500',
    features: ['Rich text editor', 'Advanced formatting', 'Media support']
  },
  graph: {
    name: 'Graph Stage',
    description: 'Interactive graph visualization with nodes and edges',
    icon: Network,
    color: 'text-purple-500',
    features: ['Interactive graphs', 'Node/edge management', 'Sigma.js integration']
  },
  table: {
    name: 'Table Stage',
    description: 'Data table with rows, columns, and spreadsheet-like functionality',
    icon: Table,
    color: 'text-orange-500',
    features: ['Data tables', 'Row/column management', 'Export functionality']
  },
  custom: {
    name: 'Custom Stage',
    description: 'Extensible custom content with plugin support',
    icon: Code,
    color: 'text-gray-500',
    features: ['Custom components', 'Plugin system', 'Flexible content']
  }
};

export function StageTypeManager({ stage, onUpdate, onClose }: StageTypeManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState({
    title: stage.config.title || stage.name || '',
    description: stage.description || '',
    icon: stage.config.icon || '',
    isActive: stage.is_active,
    sortOrder: stage.sort_order,
    showFallback: stage.config.showFallback || false,
    customConfig: stage.config.customConfig || {}
  });

  const handleSave = async () => {
    const updatedStage: Stage = {
      ...stage,
      name: config.title,
      description: config.description,
      is_active: config.isActive,
      sort_order: config.sortOrder,
      config: {
        ...stage.config,
        title: config.title,
        icon: config.icon,
        showFallback: config.showFallback,
        customConfig: config.customConfig
      }
    };

    await onUpdate(updatedStage);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setConfig({
      title: stage.config.title || stage.name || '',
      description: stage.description || '',
      icon: stage.config.icon || '',
      isActive: stage.is_active,
      sortOrder: stage.sort_order,
      showFallback: stage.config.showFallback || false,
      customConfig: stage.config.customConfig || {}
    });
    setIsEditing(false);
  };

  const currentTypeConfig = stageTypeConfigs[stage.type as keyof typeof stageTypeConfigs];
  const IconComponent = currentTypeConfig?.icon || FileText;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Stage Type Manager"
      size="xl"
    >
      <div className="p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <IconComponent className={`h-6 w-6 ${currentTypeConfig?.color}`} />
            <div>
              <h2 className="text-xl font-semibold">Stage Type Manager</h2>
              <p className="text-sm text-muted-foreground">
                Configure {currentTypeConfig?.name.toLowerCase()} settings
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stage Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Stage Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stage Type
                  </label>
                  <div className="flex items-center space-x-2 p-3 border border-border rounded-lg bg-muted/50">
                    <IconComponent className={`h-5 w-5 ${currentTypeConfig?.color}`} />
                    <span className="font-medium">{currentTypeConfig?.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => setConfig({ ...config, title: e.target.value })}
                      className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="p-2 border border-border rounded-lg bg-muted/50">
                      {config.title}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={config.description}
                      onChange={(e) => setConfig({ ...config, description: e.target.value })}
                      rows={3}
                      className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  ) : (
                    <div className="p-2 border border-border rounded-lg bg-muted/50">
                      {config.description || 'No description'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Icon
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={config.icon}
                      onChange={(e) => setConfig({ ...config, icon: e.target.value })}
                      className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="📄 or icon-class"
                    />
                  ) : (
                    <div className="p-2 border border-border rounded-lg bg-muted/50">
                      {config.icon || 'No icon'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4">Display Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Active</label>
                    <p className="text-xs text-muted-foreground">
                      Show this stage in navigation
                    </p>
                  </div>
                  {isEditing ? (
                    <Button
                      variant={config.isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setConfig({ ...config, isActive: !config.isActive })}
                      className="flex items-center"
                    >
                      {config.isActive ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                      {config.isActive ? 'Active' : 'Inactive'}
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {config.isActive ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-gray-500" />}
                      <span className="text-sm">{config.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sort Order
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={config.sortOrder}
                      onChange={(e) => setConfig({ ...config, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="p-2 border border-border rounded-lg bg-muted/50">
                      {config.sortOrder}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stage Type Features */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Stage Type Features</h3>
              
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <IconComponent className={`h-5 w-5 ${currentTypeConfig?.color}`} />
                    <h4 className="font-medium">{currentTypeConfig?.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {currentTypeConfig?.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Available Features:</h5>
                    <ul className="space-y-1">
                      {currentTypeConfig?.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Stage Type Specific Configuration */}
                {stage.type === 'graph' && (
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-3">Graph Configuration</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Sigma.js integration ready</p>
                      <p>• Node and edge management</p>
                      <p>• Interactive visualization</p>
                      <p>• Cross-stage linking support</p>
                    </div>
                  </div>
                )}

                {stage.type === 'document' && (
                  <div className="p-4 border border-border rounded-lg">
                    <DocumentStageConfigComponent
                      stage={stage}
                      onConfigChange={(config) => {
                        const updatedStage = {
                          ...stage,
                          config: {
                            ...stage.config,
                            ...config
                          }
                        };
                        onUpdate(updatedStage);
                      }}
                    />
                  </div>
                )}

                {stage.type === 'custom' && (
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-3">Custom Configuration</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Plugin system support</p>
                      <p>• Custom component rendering</p>
                      <p>• Flexible content types</p>
                      <p>• Extensible architecture</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stage Statistics */}
            <div>
              <h3 className="text-lg font-medium mb-4">Stage Statistics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">ID</div>
                  <div className="text-sm text-muted-foreground">{stage.id}</div>
                </div>
                <div className="p-4 border border-border rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">Type</div>
                  <div className="text-sm text-muted-foreground capitalize">{stage.type}</div>
                </div>
                {stage.created_at && (
                  <div className="p-4 border border-border rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">Created</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(stage.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {stage.updated_at && (
                  <div className="p-4 border border-border rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">Updated</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(stage.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
