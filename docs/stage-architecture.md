# Protogen Stage System Architecture

## Overview
The Protogen Stage System is designed to be a flexible, extensible platform for creating interactive knowledge and feedback environments. Each stage represents a unique context with specific tools, visualizations, and interaction patterns.

## Core Concepts

### Stage Types
1. **Basic Stages** - Simple content with text and media
2. **Graph Stages** - Interactive node/edge visualizations  
3. **Document Stages** - Rich text editing and collaboration
4. **Table Stages** - Structured data management
5. **Custom Stages** - Extensible plugin-based stages

### Stage Lifecycle
1. **Draft** → **Active** → **Archived** → **Deleted**
2. Each stage can have multiple versions
3. Stages can be cloned and branched

### Relationship System
- **Load After**: Sequential dependencies
- **Child Of**: Hierarchical relationships  
- **Related To**: Associative connections
- **Feedback Links**: Community-driven connections

## Stage Type Specifications

### 1. Basic Stages
**Purpose**: Simple content presentation and linear progression
- Text content with rich formatting
- Image and video embedding
- Basic navigation controls
- Simple feedback collection

### 2. Graph Stages  
**Purpose**: Interactive exploration of connected data
- Node/edge visualization with Sigma.js
- Dynamic filtering and search
- Real-time collaboration
- Graph analytics and metrics

### 3. Document Stages
**Purpose**: Collaborative document creation and editing
- Rich text editor (potentially Monaco/CodeMirror)
- Version control and change tracking
- Real-time collaborative editing
- Document-specific feedback

### 4. Table Stages
**Purpose**: Structured data manipulation and analysis
- Spreadsheet-like interface
- Data import/export capabilities
- Filtering, sorting, and aggregation
- Data visualization charts

### 5. Custom Stages
**Purpose**: Extensible plugin system for specialized tools
- Plugin architecture with defined APIs
- Custom UI components
- Stage-specific configuration schemas
- External service integrations

## Management Features

### Universal Stage Tools
- **Preview Mode**: Live preview of stage content
- **Edit Mode**: Administrative editing interface
- **Analytics**: Usage metrics and engagement data
- **Comments**: Contextual feedback system
- **History**: Version control and change tracking
- **Permissions**: Access control and sharing settings

### Stage-Specific Tools

#### Basic Stage Tools
- Content editor with WYSIWYG
- Media library integration
- Template system
- A/B testing capabilities

#### Graph Stage Tools
- Visual graph editor
- Node/edge property panels
- Layout algorithms selection
- Import/export tools (JSON, GraphML, etc.)

#### Document Stage Tools
- Collaborative editing interface
- Comment and suggestion system
- Document outline/navigation
- Export to various formats

#### Table Stage Tools
- Data grid editor
- Formula and calculation engine
- Chart builder
- Import from CSV/Excel

#### Custom Stage Tools
- Plugin marketplace
- Configuration UI generator
- Custom component library
- API endpoint management

## Technical Architecture

### Frontend Components
```
shared/src/components/stages/
├── StageContainer.tsx          # Universal stage wrapper
├── StageRenderer.tsx           # Type-specific rendering
├── StageToolbar.tsx           # Stage-specific tools
├── basic/
│   ├── BasicStageEditor.tsx
│   ├── BasicStageViewer.tsx
│   └── BasicStageConfig.tsx
├── graph/
│   ├── GraphStageEditor.tsx
│   ├── GraphVisualization.tsx
│   └── GraphControls.tsx
├── document/
│   ├── DocumentEditor.tsx
│   ├── CollaborationPanel.tsx
│   └── DocumentOutline.tsx
├── table/
│   ├── TableEditor.tsx
│   ├── DataGridComponent.tsx
│   └── ChartBuilder.tsx
└── custom/
    ├── PluginLoader.tsx
    ├── ConfigGenerator.tsx
    └── PluginAPI.tsx
```

### Backend Architecture
```
api/app/
├── Models/
│   ├── Stage.php
│   ├── StageVersion.php
│   ├── StagePlugin.php
│   └── StagePermission.php
├── Services/
│   ├── StageManager.php
│   ├── GraphService.php
│   ├── DocumentService.php
│   ├── TableService.php
│   └── PluginService.php
└── Http/Controllers/Api/
    ├── StageApiController.php
    ├── GraphApiController.php
    ├── DocumentApiController.php
    ├── TableApiController.php
    └── PluginApiController.php
```

### Database Schema Extensions
```sql
-- Stage versioning
CREATE TABLE stage_versions (
    id BIGSERIAL PRIMARY KEY,
    stage_id BIGINT REFERENCES stages(id),
    version_number INTEGER,
    config JSONB,
    metadata JSONB,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stage permissions
CREATE TABLE stage_permissions (
    id BIGSERIAL PRIMARY KEY,
    stage_id BIGINT REFERENCES stages(id),
    user_id BIGINT REFERENCES users(id),
    permission_type VARCHAR(50), -- 'view', 'edit', 'admin'
    granted_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Plugin system
CREATE TABLE stage_plugins (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    version VARCHAR(50),
    config_schema JSONB,
    ui_components JSONB,
    api_endpoints JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Custom stage instances
CREATE TABLE custom_stages (
    id BIGSERIAL PRIMARY KEY,
    stage_id BIGINT REFERENCES stages(id),
    plugin_id BIGINT REFERENCES stage_plugins(id),
    plugin_config JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Strategy

### Phase 1: Enhanced Basic Stages
1. Improve current basic stage functionality
2. Add proper content editing interface
3. Implement stage preview system
4. Add basic analytics tracking

### Phase 2: Graph Stage Foundation  
1. Integrate Sigma.js for graph visualization
2. Create graph editing interface
3. Implement node/edge management
4. Add graph layout algorithms

### Phase 3: Document Collaboration
1. Integrate collaborative text editor
2. Add real-time synchronization
3. Implement comment system
4. Add version control

### Phase 4: Table Data Management
1. Create data grid component
2. Add import/export functionality
3. Implement filtering/sorting
4. Add chart visualization

### Phase 5: Plugin System
1. Design plugin API architecture
2. Create plugin loader system
3. Implement configuration UI
4. Add plugin marketplace

## Configuration Schema

### Stage Type Configurations
Each stage type will have a specific configuration schema:

```typescript
interface BasicStageConfig extends StageConfig {
  content: string;
  media?: MediaItem[];
  template?: string;
  allowComments: boolean;
}

interface GraphStageConfig extends StageConfig {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layout: LayoutType;
  filters: FilterConfig[];
  analytics: AnalyticsConfig;
}

interface DocumentStageConfig extends StageConfig {
  document: DocumentContent;
  permissions: PermissionSettings;
  collaboration: CollaborationSettings;
  templates: DocumentTemplate[];
}

interface TableStageConfig extends StageConfig {
  schema: TableSchema;
  data: TableData;
  views: TableView[];
  calculations: CalculationConfig[];
}

interface CustomStageConfig extends StageConfig {
  pluginId: string;
  pluginVersion: string;
  pluginConfig: Record<string, any>;
  customUI?: UIComponentConfig[];
}
```

## Next Steps

1. **Implement Enhanced StageForm** - Create type-specific configuration UIs
2. **Add Stage Preview System** - Live preview functionality for all stage types  
3. **Create Stage Type Registry** - Central registration system for stage types
4. **Implement Stage Cloning** - Allow duplication and variation of existing stages
5. **Add Stage Analytics** - Usage tracking and engagement metrics
6. **Build Relationship Management** - Visual tools for managing stage connections

This architecture provides a solid foundation for building a comprehensive, extensible stage management system that can grow with the platform's needs.
