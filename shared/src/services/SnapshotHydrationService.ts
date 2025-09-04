// Snapshot Hydration Service
// This service handles progressive hydration of snapshot data into scene objects

import { 
  SnapshotHydrationResult,
  SnapshotHydrationOptions,
  Scene,
  SceneNode,
  SceneEdge
} from '../types';
import { snapshotMigrationService } from './SnapshotMigrationService';

export class SnapshotHydrationService {
  private currentVersion: string = '1.0.0';

  constructor() {
    // Initialize with current version
  }

  /**
   * Hydrate snapshot data into a complete scene object
   */
  public async hydrateSnapshot(
    snapshotData: any,
    options: Partial<SnapshotHydrationOptions> = {}
  ): Promise<SnapshotHydrationResult> {
    const startTime = performance.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Set default options
      const opts: SnapshotHydrationOptions = {
        validate: options.validate ?? true,
        strict: options.strict ?? false,
        fallback: options.fallback ?? true,
        cache: options.cache ?? false,
        timeout: options.timeout ?? 30000
      };

      // Validate input
      if (!snapshotData || typeof snapshotData !== 'object') {
        throw new Error('Invalid snapshot data provided');
      }

      // Check if migration is needed
      const snapshotVersion = snapshotData.schema?.version || '0.9.0';
      if (snapshotVersion !== this.currentVersion) {
        const migrationResult = await snapshotMigrationService.migrateSnapshot(
          snapshotData,
          snapshotVersion,
          this.currentVersion,
          opts
        );

        if (!migrationResult.success) {
          throw new Error(`Migration failed: ${migrationResult.errors.join(', ')}`);
        }

        snapshotData = {
          scene: migrationResult.scene,
          nodes: migrationResult.nodes,
          edges: migrationResult.edges,
          ...migrationResult.metadata
        };

        warnings.push(...migrationResult.warnings);
      }

      // Progressive hydration: nodes → edges → contexts
      const hydrationResult = await this.performProgressiveHydration(snapshotData, opts);

      const totalTime = performance.now() - startTime;

      return {
        success: true,
        scene: hydrationResult.scene,
        nodes: hydrationResult.nodes,
        edges: hydrationResult.edges,
        warnings: [...warnings, ...hydrationResult.warnings],
        errors: [...errors, ...hydrationResult.errors],
        performance: {
          loadTime: hydrationResult.performance.loadTime,
          parseTime: hydrationResult.performance.parseTime,
          validationTime: hydrationResult.performance.validationTime,
          totalTime,
          memoryUsage: this.getMemoryUsage()
        },
        metadata: {
          version: this.currentVersion,
          hydrated: true,
          progressive: true,
          ...hydrationResult.metadata
        }
      };

    } catch (error) {
      const totalTime = performance.now() - startTime;
      errors.push(error instanceof Error ? error.message : 'Unknown hydration error');

      return {
        success: false,
        scene: null,
        nodes: [],
        edges: [],
        warnings,
        errors,
        performance: {
          loadTime: 0,
          parseTime: 0,
          validationTime: 0,
          totalTime,
          memoryUsage: this.getMemoryUsage()
        },
        metadata: {
          version: this.currentVersion,
          hydrated: false,
          error: errors[0]
        }
      };
    }
  }

  /**
   * Perform progressive hydration: nodes → edges → contexts
   */
  private async performProgressiveHydration(
    data: any,
    options: SnapshotHydrationOptions
  ): Promise<{
    scene: Scene | null;
    nodes: SceneNode[];
    edges: SceneEdge[];
    warnings: string[];
    errors: string[];
    performance: {
      loadTime: number;
      parseTime: number;
      validationTime: number;
    };
    metadata: Record<string, any>;
  }> {
    const startTime = performance.now();
    const warnings: string[] = [];
    const errors: string[] = [];
    const metadata: Record<string, any> = {};

    try {
      // Step 1: Hydrate scene metadata
      const scene = await this.hydrateScene(data.scene, options);
      if (!scene) {
        throw new Error('Failed to hydrate scene metadata');
      }

      // Step 2: Hydrate nodes (first pass - basic structure)
      const nodesStartTime = performance.now();
      const nodes = await this.hydrateNodes(data.scene?.nodes || [], options);
      const nodesTime = performance.now() - nodesStartTime;
      metadata.nodesHydrationTime = nodesTime;

      // Step 3: Hydrate edges (depends on nodes being available)
      const edgesStartTime = performance.now();
      const edges = await this.hydrateEdges(data.scene?.edges || [], nodes, options);
      const edgesTime = performance.now() - edgesStartTime;
      metadata.edgesHydrationTime = edgesTime;

      // Step 4: Hydrate contexts (depends on scene, nodes, and edges)
      const contextsStartTime = performance.now();
      const contexts = await this.hydrateContexts(data.scene?.contexts || [], scene, nodes, edges, options);
      const contextsTime = performance.now() - contextsStartTime;
      metadata.contextsHydrationTime = contextsTime;

      // Step 5: Final validation and linking
      const validationStartTime = performance.now();
      await this.validateAndLink(scene, nodes, edges, contexts, options);
      const validationTime = performance.now() - validationStartTime;
      metadata.validationTime = validationTime;

      // Update scene with hydrated data
      scene.nodes = nodes;
      scene.edges = edges;

      const totalTime = performance.now() - startTime;
      metadata.totalHydrationTime = totalTime;
      metadata.progressiveSteps = ['scene', 'nodes', 'edges', 'contexts', 'validation'];

      return {
        scene,
        nodes,
        edges,
        warnings,
        errors,
        performance: {
          loadTime: 0,
          parseTime: totalTime,
          validationTime
        },
        metadata
      };

    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown progressive hydration error');
      return {
        scene: null,
        nodes: [],
        edges: [],
        warnings,
        errors,
        performance: {
          loadTime: 0,
          parseTime: performance.now() - startTime,
          validationTime: 0
        },
        metadata
      };
    }
  }

  /**
   * Hydrate scene metadata
   */
  private async hydrateScene(sceneData: any, _options: SnapshotHydrationOptions): Promise<Scene | null> {
    if (!sceneData) {
      return null;
    }

    try {
      const scene: Scene = {
        id: 0, // Will be set by database
        guid: sceneData.ids?.scene || '',
        name: sceneData.name || 'Unnamed Scene',
        slug: sceneData.slug || '',
        description: sceneData.description || '',
        scene_type: sceneData.type || 'custom',
        config: this.hydrateSceneConfig(sceneData.config || {}),
        meta: this.hydrateSceneMetadata(sceneData.meta || {}),
        style: this.hydrateSceneStyle(sceneData.theme || {}),
        is_active: true,
        is_public: false,
        created_by: 0, // Will be set by database
        stage_id: undefined,
        published_at: undefined,
        created_at: sceneData.timestamps?.created || new Date().toISOString(),
        updated_at: sceneData.timestamps?.updated || new Date().toISOString(),
        nodes: [],
        edges: []
      };

      return scene;
    } catch (error) {
      throw new Error(`Failed to hydrate scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Hydrate scene configuration
   */
  private hydrateSceneConfig(configData: any): any {
    return {
      layout: configData.layout || { type: 'force' },
      animation: configData.animation || { enabled: false },
      interactions: configData.interactions || {},
      constraints: configData.constraints || {},
      ...configData
    };
  }

  /**
   * Hydrate scene metadata
   */
  private hydrateSceneMetadata(metaData: any): any {
    return {
      tags: metaData.tags || [],
      category: metaData.category || '',
      version: metaData.version || '1.0.0',
      author: metaData.author || '',
      license: metaData.license || '',
      source: metaData.source || '',
      ...metaData
    };
  }

  /**
   * Hydrate scene style
   */
  private hydrateSceneStyle(styleData: any): any {
    return {
      theme: styleData.theme || 'default',
      colorScheme: styleData.colorScheme || 'light',
      nodeStyles: styleData.nodeStyles || {},
      edgeStyles: styleData.edgeStyles || {},
      background: styleData.background || {},
      fonts: styleData.fonts || {},
      ...styleData
    };
  }

  /**
   * Hydrate nodes with progressive loading
   */
  private async hydrateNodes(nodesData: any[], options: SnapshotHydrationOptions): Promise<SceneNode[]> {
    const nodes: SceneNode[] = [];

    for (const nodeData of nodesData) {
      try {
        const node: SceneNode = {
          id: 0, // Will be set by database
          guid: nodeData.id || '',
          scene_id: 0, // Will be set by database
          core_node_guid: nodeData.core_ref || undefined,
          node_type: nodeData.type || 'default',
          position: this.hydrateNodePosition(nodeData.position || {}),
          dimensions: this.hydrateNodeDimensions(nodeData.dimensions || {}),
          meta: this.hydrateNodeMetadata(nodeData.meta || {}),
          style: this.hydrateNodeStyle(nodeData.style || {}),
          z_index: nodeData.z_index || 0,
          is_visible: nodeData.is_visible !== false,
          is_locked: nodeData.is_locked || false,
          transform: this.hydrateNodeTransform(nodeData.transform || {}),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        nodes.push(node);
      } catch (error) {
        if (options.strict) {
          throw new Error(`Failed to hydrate node ${nodeData.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        // Skip invalid nodes in non-strict mode
      }
    }

    return nodes;
  }

  /**
   * Hydrate node position
   */
  private hydrateNodePosition(positionData: any): any {
    return {
      x: positionData.x || 0,
      y: positionData.y || 0,
      z: positionData.z || 0
    };
  }

  /**
   * Hydrate node dimensions
   */
  private hydrateNodeDimensions(dimensionsData: any): any {
    return {
      width: dimensionsData.width || 100,
      height: dimensionsData.height || 100,
      depth: dimensionsData.depth || 0
    };
  }

  /**
   * Hydrate node metadata
   */
  private hydrateNodeMetadata(metaData: any): any {
    return {
      label: metaData.label || '',
      description: metaData.description || '',
      tags: metaData.tags || [],
      priority: metaData.priority || 0,
      status: metaData.status || 'active',
      ...metaData
    };
  }

  /**
   * Hydrate node style
   */
  private hydrateNodeStyle(styleData: any): any {
    return {
      backgroundColor: styleData.backgroundColor || '#ffffff',
      borderColor: styleData.borderColor || '#cccccc',
      borderWidth: styleData.borderWidth || 1,
      borderRadius: styleData.borderRadius || 4,
      textColor: styleData.textColor || '#000000',
      fontSize: styleData.fontSize || 14,
      ...styleData
    };
  }

  /**
   * Hydrate node transform
   */
  private hydrateNodeTransform(transformData: any): any {
    return {
      scale: transformData.scale || { x: 1, y: 1, z: 1 },
      rotation: transformData.rotation || { x: 0, y: 0, z: 0 },
      skew: transformData.skew || { x: 0, y: 0 }
    };
  }

  /**
   * Hydrate edges with dependency on nodes
   */
  private async hydrateEdges(
    edgesData: any[], 
    nodes: SceneNode[], 
    options: SnapshotHydrationOptions
  ): Promise<SceneEdge[]> {
    const edges: SceneEdge[] = [];
    const nodeMap = new Map(nodes.map(node => [node.guid, node]));

    for (const edgeData of edgesData) {
      try {
        // Validate that source and target nodes exist
        const sourceNode = nodeMap.get(edgeData.source);
        const targetNode = nodeMap.get(edgeData.target);

        if (!sourceNode || !targetNode) {
          if (options.strict) {
            throw new Error(`Edge ${edgeData.id} references non-existent nodes`);
          }
          continue; // Skip invalid edges in non-strict mode
        }

        const edge: SceneEdge = {
          id: 0, // Will be set by database
          guid: edgeData.id || '',
          scene_id: 0, // Will be set by database
          core_edge_guid: edgeData.core_ref || undefined,
          source_node_id: sourceNode.id,
          target_node_id: targetNode.id,
          edge_type: edgeData.type || 'default',
          path: this.hydrateEdgePath(edgeData.path || {}),
          meta: this.hydrateEdgeMetadata(edgeData.meta || {}),
          style: this.hydrateEdgeStyle(edgeData.style || {}),
          is_visible: edgeData.is_visible !== false,
          is_locked: edgeData.is_locked || false,
          transform: this.hydrateEdgeTransform(edgeData.transform || {}),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        edges.push(edge);
      } catch (error) {
        if (options.strict) {
          throw new Error(`Failed to hydrate edge ${edgeData.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        // Skip invalid edges in non-strict mode
      }
    }

    return edges;
  }

  /**
   * Hydrate edge path
   */
  private hydrateEdgePath(pathData: any): any {
    return {
      type: pathData.type || 'straight',
      points: pathData.points || [],
      curvature: pathData.curvature || 0,
      offset: pathData.offset || 0
    };
  }

  /**
   * Hydrate edge metadata
   */
  private hydrateEdgeMetadata(metaData: any): any {
    return {
      label: metaData.label || '',
      weight: metaData.weight || 1,
      direction: metaData.direction || 'forward',
      tags: metaData.tags || [],
      ...metaData
    };
  }

  /**
   * Hydrate edge style
   */
  private hydrateEdgeStyle(styleData: any): any {
    return {
      color: styleData.color || '#666666',
      width: styleData.width || 2,
      style: styleData.style || 'solid',
      opacity: styleData.opacity || 1,
      ...styleData
    };
  }

  /**
   * Hydrate edge transform
   */
  private hydrateEdgeTransform(transformData: any): any {
    return {
      scale: transformData.scale || { x: 1, y: 1 },
      rotation: transformData.rotation || 0,
      offset: transformData.offset || { x: 0, y: 0 }
    };
  }

  /**
   * Hydrate contexts (depends on scene, nodes, and edges)
   */
  private async hydrateContexts(
    contextsData: any[],
    _scene: Scene,
    _nodes: SceneNode[],
    _edges: SceneEdge[],
    options: SnapshotHydrationOptions
  ): Promise<any[]> {
    const contexts: any[] = [];

    for (const contextData of contextsData) {
      try {
        const context = {
          type: contextData.type || 'scene',
          id: contextData.id || '',
          name: contextData.name || '',
          config: contextData.config || {},
          meta: contextData.meta || {},
          coordinates: contextData.coordinates || {},
          ...contextData
        };

        contexts.push(context);
      } catch (error) {
        if (options.strict) {
          throw new Error(`Failed to hydrate context ${contextData.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        // Skip invalid contexts in non-strict mode
      }
    }

    return contexts;
  }

  /**
   * Validate and link all hydrated objects
   */
  private async validateAndLink(
    scene: Scene,
    nodes: SceneNode[],
    edges: SceneEdge[],
    _contexts: any[],
    options: SnapshotHydrationOptions
  ): Promise<void> {
    if (options.validate) {
      // Validate scene
      if (!scene.guid || !scene.name) {
        throw new Error('Scene validation failed: missing required fields');
      }

      // Validate nodes
      for (const node of nodes) {
        if (!node.guid || !node.node_type) {
          throw new Error(`Node validation failed: missing required fields for node ${node.guid}`);
        }
      }

      // Validate edges
      for (const edge of edges) {
        if (!edge.guid || !edge.source_node_id || !edge.target_node_id) {
          throw new Error(`Edge validation failed: missing required fields for edge ${edge.guid}`);
        }
      }
    }
  }

  /**
   * Get memory usage (simplified)
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Set the current schema version
   */
  public setCurrentVersion(version: string): void {
    this.currentVersion = version;
  }

  /**
   * Get the current schema version
   */
  public getCurrentVersion(): string {
    return this.currentVersion;
  }
}

// Export singleton instance
export const snapshotHydrationService = new SnapshotHydrationService();
