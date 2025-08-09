import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Save, 
  X, 
  Eye, 
  FileText, 
  Network, 
  Table, 
  Puzzle,
  Settings,
  Info
} from 'lucide-react';
import { Stage, StageType } from '../../types/stage';

interface EnhancedStageFormProps {
  stage?: Stage | null;
  onSave: (stageData: Partial<Stage>) => Promise<void>;
  onCancel: () => void;
  onPreview?: (stageData: Partial<Stage>) => void;
  isLoading?: boolean;
}

interface StageTypeInfo {
  id: StageType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const stageTypes: StageTypeInfo[] = [
  {
    id: 'basic',
    name: 'Basic Stage',
    description: 'Simple content presentation with text, images, and basic navigation',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-blue-500',
    features: ['Rich text content', 'Media embedding', 'Simple navigation', 'Basic feedback']
  },
  {
    id: 'graph',
    name: 'Graph Stage', 
    description: 'Interactive network visualization with nodes and edges',
    icon: <Network className="h-5 w-5" />,
    color: 'bg-green-500',
    features: ['Interactive graphs', 'Node/edge editing', 'Dynamic filtering', 'Graph analytics']
  },
  {
    id: 'document',
    name: 'Document Stage',
    description: 'Collaborative document editing and version control',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-purple-500',
    features: ['Real-time editing', 'Version control', 'Comments system', 'Collaboration tools']
  },
  {
    id: 'table',
    name: 'Table Stage',
    description: 'Structured data management with spreadsheet-like interface',
    icon: <Table className="h-5 w-5" />,
    color: 'bg-orange-500',
    features: ['Data grid interface', 'Import/export data', 'Filtering & sorting', 'Chart visualization']
  },
  {
    id: 'custom',
    name: 'Custom Stage',
    description: 'Extensible plugin-based stages for specialized functionality',
    icon: <Puzzle className="h-5 w-5" />,
    color: 'bg-red-500',
    features: ['Plugin system', 'Custom components', 'External integrations', 'Specialized tools']
  }
];

export const EnhancedStageForm: React.FC<EnhancedStageFormProps> = ({
  stage,
  onSave,
  onCancel,
  onPreview,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Partial<Stage>>({
    name: '',
    description: '',
    type: 'basic',
    config: {},
    metadata: {},
    is_active: true,
    sort_order: 0,
    ...stage
  });

  const [activeTab, setActiveTab] = useState<'general' | 'config' | 'preview'>('general');
  const [selectedType, setSelectedType] = useState<StageType>(formData.type || 'basic');

  useEffect(() => {
    if (stage) {
      setFormData({ ...stage });
      setSelectedType(stage.type);
    }
  }, [stage]);

  const handleInputChange = (field: keyof Stage, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfigChange = (configKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [configKey]: value
      }
    }));
  };

  const handleTypeChange = (type: StageType) => {
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      type,
      config: getDefaultConfigForType(type)
    }));
  };

  const getDefaultConfigForType = (type: StageType): Record<string, any> => {
    switch (type) {
      case 'basic':
        return {
          title: '',
          content: '',
          showFallback: false,
          allowComments: true
        };
      case 'graph':
        return {
          nodes: [],
          edges: [],
          layout: 'force-directed',
          showAnalytics: true
        };
      case 'document':
        return {
          document: '',
          allowCollaboration: true,
          trackVersions: true
        };
      case 'table':
        return {
          schema: {},
          data: [],
          allowEditing: true,
          showCharts: true
        };
      case 'custom':
        return {
          pluginId: '',
          pluginConfig: {}
        };
      default:
        return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      alert('Stage name is required');
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save stage:', error);
      alert('Failed to save stage. Please try again.');
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(formData);
    }
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">Stage Name *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            placeholder="Enter stage name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            placeholder="Describe the purpose and content of this stage..."
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_active || false}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm">Active</span>
          </label>
          
          <div>
            <label className="block text-sm font-medium mb-1">Sort Order</label>
            <input
              type="number"
              value={formData.sort_order || 0}
              onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-1 border border-border rounded-md bg-background"
            />
          </div>
        </div>
      </div>

      {/* Stage Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Stage Type</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stageTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleTypeChange(type.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedType === type.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded ${type.color} text-white`}>
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{type.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {type.features.slice(0, 2).map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {type.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{type.features.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConfigTab = () => {
    const selectedTypeInfo = stageTypes.find(t => t.id === selectedType);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded ${selectedTypeInfo?.color} text-white`}>
            {selectedTypeInfo?.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{selectedTypeInfo?.name} Configuration</h3>
            <p className="text-sm text-muted-foreground">{selectedTypeInfo?.description}</p>
          </div>
        </div>

        {renderTypeSpecificConfig()}
      </div>
    );
  };

  const renderTypeSpecificConfig = () => {
    switch (selectedType) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Content Title</label>
              <input
                type="text"
                value={formData.config?.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                placeholder="Enter content title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={formData.config?.content || ''}
                onChange={(e) => handleConfigChange('content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                placeholder="Enter stage content..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.config?.allowComments || false}
                  onChange={(e) => handleConfigChange('allowComments', e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Allow Comments</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.config?.showFallback || false}
                  onChange={(e) => handleConfigChange('showFallback', e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Show Fallback Content</span>
              </label>
            </div>
          </div>
        );

      case 'graph':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Graph Configuration</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Graph stages will have a visual editor for creating and managing nodes and edges. 
                For now, you can configure basic settings.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Layout Algorithm</label>
              <select
                value={formData.config?.layout || 'force-directed'}
                onChange={(e) => handleConfigChange('layout', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="force-directed">Force-Directed</option>
                <option value="hierarchical">Hierarchical</option>
                <option value="circular">Circular</option>
                <option value="grid">Grid</option>
              </select>
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.config?.showAnalytics || false}
                onChange={(e) => handleConfigChange('showAnalytics', e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">Show Graph Analytics</span>
            </label>
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Document Configuration</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Document stages will support collaborative editing with real-time synchronization.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.config?.allowCollaboration || false}
                  onChange={(e) => handleConfigChange('allowCollaboration', e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Allow Collaboration</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.config?.trackVersions || false}
                  onChange={(e) => handleConfigChange('trackVersions', e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Track Versions</span>
              </label>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Table Configuration</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Table stages provide spreadsheet-like functionality with data import/export capabilities.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.config?.allowEditing || false}
                  onChange={(e) => handleConfigChange('allowEditing', e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Allow Editing</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.config?.showCharts || false}
                  onChange={(e) => handleConfigChange('showCharts', e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Show Chart Builder</span>
              </label>
            </div>
          </div>
        );

      case 'custom':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Custom Stage Configuration</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Custom stages use plugins to provide specialized functionality. Plugin system coming soon.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Plugin ID</label>
              <input
                type="text"
                value={formData.config?.pluginId || ''}
                onChange={(e) => handleConfigChange('pluginId', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                placeholder="Enter plugin identifier..."
              />
            </div>
          </div>
        );

      default:
        return <div>Configuration options for this stage type will be available soon.</div>;
    }
  };

  const renderPreviewTab = () => (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Stage Preview</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Preview functionality will show how this stage will appear to users.
        </p>
        
        <div className="border border-border rounded-lg p-4 bg-background">
          <h3 className="font-medium mb-2">{formData.name || 'Untitled Stage'}</h3>
          <p className="text-sm text-muted-foreground mb-3">{formData.description || 'No description provided'}</p>
          
          <div className="text-xs text-muted-foreground">
            <span>Type: {selectedType}</span>
            <span className="mx-2">•</span>
            <span>Status: {formData.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {stage ? 'Edit Stage' : 'Create New Stage'}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {onPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'general'
                  ? 'bg-background shadow-sm'
                  : 'hover:bg-background/50'
              }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'config'
                  ? 'bg-background shadow-sm'
                  : 'hover:bg-background/50'
              }`}
            >
              <Settings className="h-4 w-4 mr-1 inline" />
              Configuration
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                activeTab === 'preview'
                  ? 'bg-background shadow-sm'
                  : 'hover:bg-background/50'
              }`}
            >
              <Eye className="h-4 w-4 mr-1 inline" />
              Preview
            </button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit}>
            {activeTab === 'general' && renderGeneralTab()}
            {activeTab === 'config' && renderConfigTab()}
            {activeTab === 'preview' && renderPreviewTab()}
            
            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.name?.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : (stage ? 'Update Stage' : 'Create Stage')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
