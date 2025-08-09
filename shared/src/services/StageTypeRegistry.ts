import { StageType } from '../types/stage';

export interface StageTypeDefinition {
  id: StageType;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  configSchema: Record<string, any>;
  defaultConfig: Record<string, any>;
  capabilities: StageCapability[];
}

export interface StageCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

class StageTypeRegistryClass {
  private stageTypes: Map<StageType, StageTypeDefinition> = new Map();

  constructor() {
    this.registerDefaultStageTypes();
  }

  private registerDefaultStageTypes() {
    // Basic Stage Type
    this.register({
      id: 'basic',
      name: 'Basic Stage',
      description: 'Simple content presentation with text, images, and basic navigation',
      icon: 'FileText',
      color: 'bg-blue-500',
      features: [
        'Rich text content',
        'Media embedding', 
        'Simple navigation',
        'Basic feedback',
        'Comment system'
      ],
      configSchema: {
        title: { type: 'string', required: false, label: 'Content Title' },
        content: { type: 'text', required: false, label: 'Main Content' },
        allowComments: { type: 'boolean', default: true, label: 'Allow Comments' },
        showFallback: { type: 'boolean', default: false, label: 'Show Fallback Content' },
        media: { type: 'array', required: false, label: 'Media Items' }
      },
      defaultConfig: {
        title: '',
        content: '',
        allowComments: true,
        showFallback: false,
        media: []
      },
      capabilities: [
        { id: 'comments', name: 'Comments', description: 'Allow user comments', enabled: true },
        { id: 'media', name: 'Media', description: 'Support images and videos', enabled: true },
        { id: 'feedback', name: 'Feedback', description: 'Collect user feedback', enabled: true }
      ]
    });

    // Graph Stage Type
    this.register({
      id: 'graph',
      name: 'Graph Stage',
      description: 'Interactive network visualization with nodes and edges',
      icon: 'Network',
      color: 'bg-green-500',
      features: [
        'Interactive graphs',
        'Node/edge editing',
        'Dynamic filtering',
        'Graph analytics',
        'Layout algorithms'
      ],
      configSchema: {
        nodes: { type: 'array', default: [], label: 'Graph Nodes' },
        edges: { type: 'array', default: [], label: 'Graph Edges' },
        layout: { 
          type: 'select', 
          default: 'force-directed', 
          options: ['force-directed', 'hierarchical', 'circular', 'grid'],
          label: 'Layout Algorithm' 
        },
        showAnalytics: { type: 'boolean', default: true, label: 'Show Analytics' },
        allowEditing: { type: 'boolean', default: false, label: 'Allow Graph Editing' }
      },
      defaultConfig: {
        nodes: [],
        edges: [],
        layout: 'force-directed',
        showAnalytics: true,
        allowEditing: false
      },
      capabilities: [
        { id: 'visualization', name: 'Visualization', description: 'Interactive graph display', enabled: true },
        { id: 'analytics', name: 'Analytics', description: 'Graph metrics and analysis', enabled: true },
        { id: 'editing', name: 'Editing', description: 'Visual graph editing', enabled: false },
        { id: 'export', name: 'Export', description: 'Export graph data', enabled: true }
      ]
    });

    // Document Stage Type
    this.register({
      id: 'document',
      name: 'Document Stage',
      description: 'Collaborative document editing and version control',
      icon: 'FileText',
      color: 'bg-purple-500',
      features: [
        'Real-time editing',
        'Version control',
        'Comments system',
        'Collaboration tools',
        'Document templates'
      ],
      configSchema: {
        document: { type: 'text', default: '', label: 'Document Content' },
        allowCollaboration: { type: 'boolean', default: true, label: 'Allow Collaboration' },
        trackVersions: { type: 'boolean', default: true, label: 'Track Versions' },
        template: { type: 'string', required: false, label: 'Document Template' },
        permissions: { type: 'object', default: {}, label: 'Access Permissions' }
      },
      defaultConfig: {
        document: '',
        allowCollaboration: true,
        trackVersions: true,
        template: '',
        permissions: {}
      },
      capabilities: [
        { id: 'collaboration', name: 'Collaboration', description: 'Real-time collaborative editing', enabled: true },
        { id: 'versions', name: 'Versions', description: 'Version control and history', enabled: true },
        { id: 'comments', name: 'Comments', description: 'Inline comments and suggestions', enabled: true },
        { id: 'templates', name: 'Templates', description: 'Document templates', enabled: false }
      ]
    });

    // Table Stage Type
    this.register({
      id: 'table',
      name: 'Table Stage',
      description: 'Structured data management with spreadsheet-like interface',
      icon: 'Table',
      color: 'bg-orange-500',
      features: [
        'Data grid interface',
        'Import/export data',
        'Filtering & sorting',
        'Chart visualization',
        'Formula calculations'
      ],
      configSchema: {
        schema: { type: 'object', default: {}, label: 'Table Schema' },
        data: { type: 'array', default: [], label: 'Table Data' },
        allowEditing: { type: 'boolean', default: true, label: 'Allow Editing' },
        showCharts: { type: 'boolean', default: true, label: 'Show Chart Builder' },
        calculations: { type: 'boolean', default: false, label: 'Enable Calculations' }
      },
      defaultConfig: {
        schema: {},
        data: [],
        allowEditing: true,
        showCharts: true,
        calculations: false
      },
      capabilities: [
        { id: 'editing', name: 'Editing', description: 'Spreadsheet-like editing', enabled: true },
        { id: 'import', name: 'Import', description: 'Import from CSV/Excel', enabled: true },
        { id: 'export', name: 'Export', description: 'Export to various formats', enabled: true },
        { id: 'charts', name: 'Charts', description: 'Data visualization charts', enabled: true },
        { id: 'formulas', name: 'Formulas', description: 'Formula calculations', enabled: false }
      ]
    });

    // Custom Stage Type
    this.register({
      id: 'custom',
      name: 'Custom Stage',
      description: 'Extensible plugin-based stages for specialized functionality',
      icon: 'Puzzle',
      color: 'bg-red-500',
      features: [
        'Plugin system',
        'Custom components',
        'External integrations',
        'Specialized tools',
        'API extensions'
      ],
      configSchema: {
        pluginId: { type: 'string', required: true, label: 'Plugin ID' },
        pluginVersion: { type: 'string', default: 'latest', label: 'Plugin Version' },
        pluginConfig: { type: 'object', default: {}, label: 'Plugin Configuration' },
        customUI: { type: 'array', default: [], label: 'Custom UI Components' }
      },
      defaultConfig: {
        pluginId: '',
        pluginVersion: 'latest',
        pluginConfig: {},
        customUI: []
      },
      capabilities: [
        { id: 'plugins', name: 'Plugins', description: 'Plugin system support', enabled: true },
        { id: 'customUI', name: 'Custom UI', description: 'Custom user interface', enabled: false },
        { id: 'integrations', name: 'Integrations', description: 'External service integrations', enabled: false },
        { id: 'api', name: 'API', description: 'Custom API endpoints', enabled: false }
      ]
    });
  }

  register(definition: StageTypeDefinition): void {
    this.stageTypes.set(definition.id, definition);
  }

  get(type: StageType): StageTypeDefinition | undefined {
    return this.stageTypes.get(type);
  }

  getAll(): StageTypeDefinition[] {
    return Array.from(this.stageTypes.values());
  }

  getAllTypes(): StageType[] {
    return Array.from(this.stageTypes.keys());
  }

  getCapabilities(type: StageType): StageCapability[] {
    const definition = this.get(type);
    return definition?.capabilities || [];
  }

  getEnabledCapabilities(type: StageType): StageCapability[] {
    return this.getCapabilities(type).filter(cap => cap.enabled);
  }

  getConfigSchema(type: StageType): Record<string, any> {
    const definition = this.get(type);
    return definition?.configSchema || {};
  }

  getDefaultConfig(type: StageType): Record<string, any> {
    const definition = this.get(type);
    return definition?.defaultConfig || {};
  }

  validateConfig(type: StageType, config: Record<string, any>): { valid: boolean; errors: string[] } {
    const schema = this.getConfigSchema(type);
    const errors: string[] = [];

    for (const [key, fieldSchema] of Object.entries(schema)) {
      const value = config[key];

      // Check required fields
      if (fieldSchema.required && (value === undefined || value === null || value === '')) {
        errors.push(`${fieldSchema.label || key} is required`);
      }

      // Type validation
      if (value !== undefined && value !== null) {
        switch (fieldSchema.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${fieldSchema.label || key} must be a string`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${fieldSchema.label || key} must be a boolean`);
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`${fieldSchema.label || key} must be an array`);
            }
            break;
          case 'object':
            if (typeof value !== 'object' || Array.isArray(value)) {
              errors.push(`${fieldSchema.label || key} must be an object`);
            }
            break;
        }
      }

      // Validate select options
      if (fieldSchema.type === 'select' && fieldSchema.options && value) {
        if (!fieldSchema.options.includes(value)) {
          errors.push(`${fieldSchema.label || key} must be one of: ${fieldSchema.options.join(', ')}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  isCapabilityEnabled(type: StageType, capabilityId: string): boolean {
    const capabilities = this.getCapabilities(type);
    const capability = capabilities.find(cap => cap.id === capabilityId);
    return capability?.enabled || false;
  }

  toggleCapability(type: StageType, capabilityId: string): boolean {
    const definition = this.get(type);
    if (!definition) return false;

    const capability = definition.capabilities.find(cap => cap.id === capabilityId);
    if (!capability) return false;

    capability.enabled = !capability.enabled;
    return true;
  }
}

export const StageTypeRegistry = new StageTypeRegistryClass();