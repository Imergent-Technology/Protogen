# Central Graph System Implementation Roadmap

## 🎯 **Overview**

This document outlines the transition from the current Scene-specific graph nodes/edges architecture to a centralized graph system with subgraphs and enhanced scene items. This represents a fundamental architectural evolution while preserving the excellent multi-tenant, snapshot, and scene type systems.

## 🏗️ **Architectural Evolution**

### **Current Architecture (Pre-Transition)**
```
Core Graph (Canonical Data)
├── CoreGraphNode
├── CoreGraphEdge
└── Scene Layer (Presentational)
    ├── Scene
    ├── SceneNode (scene-specific instances)
    ├── SceneEdge (scene-specific instances)
    └── Scene Types (graph, card, document)
```

### **Target Architecture (Post-Transition)**
```
Central Graph (Single Source of Truth)
├── CoreGraphNode (unchanged)
├── CoreGraphEdge (unchanged)
└── Subgraph System (New)
    ├── Subgraph (logical grouping of nodes)
    ├── SubgraphNode (pivot table)
    └── Scene Integration
        ├── Graph Scenes → Subgraph-based
        ├── Card Scenes → Scene Items
        ├── Document Scenes → Scene Items
        └── Scene Items (spatial positioning)
```

## 📊 **Database Schema Design**

### **Subgraph System**
```sql
-- Subgraphs table
CREATE TABLE subgraphs (
    id BIGSERIAL PRIMARY KEY,
    guid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    created_by BIGINT REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Subgraph nodes pivot
CREATE TABLE subgraph_nodes (
    id BIGSERIAL PRIMARY KEY,
    subgraph_id BIGINT NOT NULL REFERENCES subgraphs(id) ON DELETE CASCADE,
    node_id BIGINT NOT NULL REFERENCES core_graph_nodes(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(subgraph_id, node_id)
);

-- Scene items for spatial positioning
CREATE TABLE scene_items (
    id BIGSERIAL PRIMARY KEY,
    scene_id BIGINT NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'node', 'edge', 'text', 'image', 'video', 'other'
    item_id BIGINT, -- Reference to core_graph_nodes, core_graph_edges, or other
    item_guid UUID, -- Alternative reference
    position JSONB, -- {x, y, z} coordinates
    dimensions JSONB, -- {width, height} for sizing
    style JSONB, -- Scene-specific styling
    meta JSONB, -- Additional metadata
    is_visible BOOLEAN DEFAULT true,
    z_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Enhanced Scene System**
```sql
-- Add subgraph reference to scenes
ALTER TABLE scenes ADD COLUMN subgraph_id BIGINT REFERENCES subgraphs(id);

-- Update scene types to support new architecture
-- graph scenes → use subgraphs
-- card/document scenes → use scene_items
```

## 🚀 **Implementation Phases**

### **Phase 1: Database Foundation (Week 1)**

#### **1.1 Create New Models**
```php
// Subgraph Model
class Subgraph extends Model
{
    protected $fillable = [
        'name', 'description', 'tenant_id', 'created_by', 'is_public'
    ];
    
    protected $casts = [
        'is_public' => 'boolean'
    ];
    
    // Relationships
    public function tenant() {
        return $this->belongsTo(Tenant::class);
    }
    
    public function nodes() {
        return $this->belongsToMany(CoreGraphNode::class, 'subgraph_nodes');
    }
    
    public function scenes() {
        return $this->hasMany(Scene::class);
    }
    
    public function createdBy() {
        return $this->belongsTo(User::class, 'created_by');
    }
}

// Scene Item Model
class SceneItem extends Model
{
    protected $fillable = [
        'scene_id', 'item_type', 'item_id', 'item_guid',
        'position', 'dimensions', 'style', 'meta', 'is_visible', 'z_index'
    ];
    
    protected $casts = [
        'item_type' => 'string',
        'position' => 'array',
        'dimensions' => 'array',
        'style' => 'array',
        'meta' => 'array',
        'is_visible' => 'boolean'
    ];
    
    // Relationships
    public function scene() {
        return $this->belongsTo(Scene::class);
    }
    
    public function node() {
        return $this->belongsTo(CoreGraphNode::class, 'item_id');
    }
    
    public function edge() {
        return $this->belongsTo(CoreGraphEdge::class, 'item_id');
    }
}
```

#### **1.2 Database Migrations**
```php
// Create subgraphs table
Schema::create('subgraphs', function (Blueprint $table) {
    $table->id();
    $table->uuid('guid')->unique();
    $table->string('name');
    $table->text('description')->nullable();
    $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
    $table->foreignId('created_by')->nullable()->constrained('users');
    $table->boolean('is_public')->default(false);
    $table->timestamps();
    
    $table->index(['tenant_id', 'is_public']);
});

// Create subgraph_nodes pivot
Schema::create('subgraph_nodes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('subgraph_id')->constrained()->onDelete('cascade');
    $table->foreignId('node_id')->constrained('core_graph_nodes')->onDelete('cascade');
    $table->timestamp('added_at')->useCurrent();
    
    $table->unique(['subgraph_id', 'node_id']);
    $table->index('subgraph_id');
    $table->index('node_id');
});

// Create scene_items table
Schema::create('scene_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('scene_id')->constrained()->onDelete('cascade');
    $table->string('item_type');
    $table->unsignedBigInteger('item_id')->nullable();
    $table->uuid('item_guid')->nullable();
    $table->json('position')->nullable();
    $table->json('dimensions')->nullable();
    $table->json('style')->nullable();
    $table->json('meta')->nullable();
    $table->boolean('is_visible')->default(true);
    $table->integer('z_index')->default(0);
    $table->timestamps();
    
    $table->index(['scene_id', 'item_type']);
    $table->index(['item_id', 'item_type']);
});
```

#### **1.3 Update Existing Models**
```php
// Update Scene model
class Scene extends Model
{
    // Add subgraph relationship
    public function subgraph() {
        return $this->belongsTo(Subgraph::class);
    }
    
    public function items() {
        return $this->hasMany(SceneItem::class);
    }
    
    // Enhanced scene type handling
    public function isGraphScene() {
        return $this->scene_type === 'graph';
    }
    
    public function isCardScene() {
        return $this->scene_type === 'card';
    }
    
    public function isDocumentScene() {
        return $this->scene_type === 'document';
    }
}
```

### **Phase 2: API Evolution (Week 2)**

#### **2.1 Subgraph API Endpoints**
```php
// SubgraphController
class SubgraphController extends Controller
{
    public function index(Request $request) {
        $subgraphs = Subgraph::where('tenant_id', $request->tenant_id)
                            ->with(['nodes', 'createdBy'])
                            ->get();
        return response()->json($subgraphs);
    }
    
    public function show(Subgraph $subgraph) {
        $subgraph->load(['nodes', 'scenes', 'createdBy']);
        return response()->json($subgraph);
    }
    
    public function store(Request $request) {
        $subgraph = Subgraph::create([
            'name' => $request->name,
            'description' => $request->description,
            'tenant_id' => $request->tenant_id,
            'created_by' => auth()->id(),
            'is_public' => $request->is_public ?? false
        ]);
        
        if ($request->node_ids) {
            $subgraph->nodes()->attach($request->node_ids);
        }
        
        return response()->json($subgraph->load('nodes'));
    }
    
    public function update(Request $request, Subgraph $subgraph) {
        $subgraph->update($request->only(['name', 'description', 'is_public']));
        
        if ($request->has('node_ids')) {
            $subgraph->nodes()->sync($request->node_ids);
        }
        
        return response()->json($subgraph->load('nodes'));
    }
    
    public function destroy(Subgraph $subgraph) {
        $subgraph->delete();
        return response()->json(['message' => 'Subgraph deleted']);
    }
}
```

#### **2.2 Enhanced Scene API**
```php
// SceneController - Enhanced for subgraphs
class SceneController extends Controller
{
    public function createGraphScene(Request $request) {
        // Create subgraph first
        $subgraph = Subgraph::create([
            'name' => $request->name . ' Subgraph',
            'description' => $request->description,
            'tenant_id' => $request->tenant_id,
            'created_by' => auth()->id()
        ]);
        
        // Create scene with subgraph reference
        $scene = Scene::create([
            'name' => $request->name,
            'description' => $request->description,
            'scene_type' => 'graph',
            'subgraph_id' => $subgraph->id,
            'tenant_id' => $request->tenant_id,
            'created_by' => auth()->id()
        ]);
        
        return response()->json($scene->load('subgraph'));
    }
    
    public function getSceneNodes(Scene $scene) {
        if ($scene->isGraphScene()) {
            // Return nodes from subgraph
            return response()->json($scene->subgraph->nodes);
        } else {
            // Return nodes from scene items
            $nodes = $scene->items()
                          ->where('item_type', 'node')
                          ->with('node')
                          ->get()
                          ->pluck('node');
            return response()->json($nodes);
        }
    }
    
    public function getSceneEdges(Scene $scene) {
        if ($scene->isGraphScene()) {
            // Get edges between nodes in subgraph
            $nodeIds = $scene->subgraph->nodes->pluck('id');
            $edges = CoreGraphEdge::whereIn('source_node_id', $nodeIds)
                                 ->whereIn('target_node_id', $nodeIds)
                                 ->get();
            return response()->json($edges);
        } else {
            // Return edges from scene items
            $edges = $scene->items()
                          ->where('item_type', 'edge')
                          ->with('edge')
                          ->get()
                          ->pluck('edge');
            return response()->json($edges);
        }
    }
}
```

#### **2.3 Scene Items API**
```php
// SceneItemController
class SceneItemController extends Controller
{
    public function store(Request $request) {
        $sceneItem = SceneItem::create([
            'scene_id' => $request->scene_id,
            'item_type' => $request->item_type,
            'item_id' => $request->item_id,
            'item_guid' => $request->item_guid,
            'position' => $request->position,
            'dimensions' => $request->dimensions,
            'style' => $request->style,
            'meta' => $request->meta,
            'is_visible' => $request->is_visible ?? true,
            'z_index' => $request->z_index ?? 0
        ]);
        
        return response()->json($sceneItem);
    }
    
    public function update(Request $request, SceneItem $sceneItem) {
        $sceneItem->update($request->only([
            'position', 'dimensions', 'style', 'meta', 'is_visible', 'z_index'
        ]));
        
        return response()->json($sceneItem);
    }
    
    public function destroy(SceneItem $sceneItem) {
        $sceneItem->delete();
        return response()->json(['message' => 'Scene item deleted']);
    }
}
```

### **Phase 3: Frontend Integration (Week 3)**

#### **3.1 Subgraph Management UI**
```typescript
// SubgraphStore (Zustand)
interface SubgraphStore {
  subgraphs: Subgraph[];
  currentSubgraph: Subgraph | null;
  loading: boolean;
  
  // Actions
  fetchSubgraphs: (tenantId: string) => Promise<void>;
  createSubgraph: (data: CreateSubgraphData) => Promise<Subgraph>;
  updateSubgraph: (id: string, data: UpdateSubgraphData) => Promise<void>;
  deleteSubgraph: (id: string) => Promise<void>;
  selectSubgraph: (id: string) => void;
}

// SubgraphService
class SubgraphService {
  async getSubgraphs(tenantId: string): Promise<Subgraph[]> {
    const response = await api.get(`/subgraphs?tenant_id=${tenantId}`);
    return response.data;
  }
  
  async createSubgraph(data: CreateSubgraphData): Promise<Subgraph> {
    const response = await api.post('/subgraphs', data);
    return response.data;
  }
  
  async updateSubgraph(id: string, data: UpdateSubgraphData): Promise<Subgraph> {
    const response = await api.put(`/subgraphs/${id}`, data);
    return response.data;
  }
}
```

#### **3.2 Enhanced Graph Studio**
```typescript
// GraphStudio - Enhanced for subgraphs
class GraphStudio {
  private subgraph: Subgraph | null = null;
  private scene: Scene | null = null;
  
  async loadGraphScene(sceneId: string) {
    const scene = await SceneService.getScene(sceneId);
    if (scene.scene_type === 'graph' && scene.subgraph_id) {
      this.subgraph = await SubgraphService.getSubgraph(scene.subgraph_id);
      this.scene = scene;
      this.renderGraph();
    }
  }
  
  private renderGraph() {
    if (!this.subgraph) return;
    
    // Render nodes from subgraph
    this.subgraph.nodes.forEach(node => {
      this.addNode(node);
    });
    
    // Render edges between nodes in subgraph
    this.renderEdges();
  }
  
  private renderEdges() {
    if (!this.subgraph) return;
    
    const nodeIds = this.subgraph.nodes.map(n => n.id);
    const edges = this.getEdgesBetweenNodes(nodeIds);
    
    edges.forEach(edge => {
      this.addEdge(edge);
    });
  }
}
```

#### **3.3 Scene Items Management**
```typescript
// SceneItemStore
interface SceneItemStore {
  items: SceneItem[];
  selectedItem: SceneItem | null;
  
  // Actions
  addItem: (item: CreateSceneItemData) => Promise<void>;
  updateItem: (id: string, data: UpdateSceneItemData) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  selectItem: (id: string) => void;
}

// SceneItemService
class SceneItemService {
  async getSceneItems(sceneId: string): Promise<SceneItem[]> {
    const response = await api.get(`/scenes/${sceneId}/items`);
    return response.data;
  }
  
  async addItem(data: CreateSceneItemData): Promise<SceneItem> {
    const response = await api.post('/scene-items', data);
    return response.data;
  }
  
  async updateItem(id: string, data: UpdateSceneItemData): Promise<SceneItem> {
    const response = await api.put(`/scene-items/${id}`, data);
    return response.data;
  }
}
```

### **Phase 4: Advanced Features (Week 4)**

#### **4.1 Subgraph Sharing System**
```php
// Subgraph sharing across tenants
class SubgraphSharingService
{
    public function shareSubgraph(Subgraph $subgraph, array $tenantIds) {
        foreach ($tenantIds as $tenantId) {
            SubgraphAccess::create([
                'subgraph_id' => $subgraph->id,
                'tenant_id' => $tenantId,
                'access_level' => 'read', // read, write, admin
                'granted_by' => auth()->id()
            ]);
        }
    }
    
    public function getAccessibleSubgraphs($tenantId) {
        return Subgraph::where('tenant_id', $tenantId)
                      ->orWhereHas('access', function($query) use ($tenantId) {
                          $query->where('tenant_id', $tenantId);
                      })
                      ->get();
    }
}
```

#### **4.2 Performance Optimization**
```php
// Subgraph caching and optimization
class SubgraphService
{
    public function getSubgraphWithNodes($subgraphId) {
        return Cache::remember("subgraph.{$subgraphId}", 3600, function() use ($subgraphId) {
            return Subgraph::with(['nodes', 'scenes'])
                          ->find($subgraphId);
        });
    }
    
    public function getSubgraphEdges($subgraphId) {
        return Cache::remember("subgraph.{$subgraphId}.edges", 3600, function() use ($subgraphId) {
            $subgraph = Subgraph::with('nodes')->find($subgraphId);
            $nodeIds = $subgraph->nodes->pluck('id');
            
            return CoreGraphEdge::whereIn('source_node_id', $nodeIds)
                               ->whereIn('target_node_id', $nodeIds)
                               ->get();
        });
    }
}
```

## 🔄 **Migration Strategy**

### **Data Migration (Fresh Start)**
```php
// Migration: Clean slate approach
public function up()
{
    // 1. Clear existing scene-specific data
    DB::table('scene_nodes')->truncate();
    DB::table('scene_edges')->truncate();
    
    // 2. Create default subgraphs from seeders
    $this->createDefaultSubgraphs();
    
    // 3. Update existing scenes to use new architecture
    $this->migrateExistingScenes();
}

private function createDefaultSubgraphs()
{
    // Create concept subgraph
    Subgraph::create([
        'name' => 'Concept Graph',
        'description' => 'Core concepts and relationships',
        'tenant_id' => 1,
        'is_public' => true
    ]);
    
    // Create skills subgraph
    Subgraph::create([
        'name' => 'Skills & Interests',
        'description' => 'User skills and interests',
        'tenant_id' => 1,
        'is_public' => true
    ]);
}
```

### **Backward Compatibility**
```php
// Maintain backward compatibility during transition
class SceneService
{
    public function getSceneNodes(Scene $scene) {
        if ($scene->subgraph_id) {
            // New architecture: use subgraph
            return $scene->subgraph->nodes;
        } else {
            // Legacy: use scene items
            return $scene->items()->where('item_type', 'node')->get();
        }
    }
}
```

## 🎯 **Success Metrics**

### **Technical Metrics**
- **Performance**: Subgraph queries < 100ms
- **Scalability**: Support 1000+ nodes per subgraph
- **Compatibility**: All existing scenes work with new architecture
- **Security**: Proper tenant isolation maintained

### **Functional Metrics**
- **Graph Scenes**: Seamless subgraph-based rendering
- **Card Scenes**: Enhanced scene items support
- **Document Scenes**: Improved content positioning
- **Admin Tools**: Enhanced subgraph management

## 🚀 **Next Steps**

1. **Create feature branch**: `git checkout -b feature/central-graph-system`
2. **Start Phase 1**: Database foundation
3. **Test thoroughly**: Each phase should be fully tested
4. **Document changes**: Update all relevant documentation
5. **Plan Phase 2**: API evolution based on Phase 1 results

This roadmap provides a clear path to the central graph system while preserving the excellent aspects of your current architecture. The phased approach ensures minimal disruption while enabling the new vision.
