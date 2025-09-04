// Snapshot Migration Service
// This service handles migration of snapshot data between schema versions

import { 
  SnapshotMigration, 
  SnapshotHydrationResult,
  SnapshotHydrationOptions 
} from '../types/snapshot';

export class SnapshotMigrationService {
  private migrations: Map<string, SnapshotMigration> = new Map();
  private currentVersion: string = '1.0.0';

  constructor() {
    this.registerDefaultMigrations();
  }

  /**
   * Register a migration between two versions
   */
  public registerMigration(migration: SnapshotMigration): void {
    const key = `${migration.fromVersion}->${migration.toVersion}`;
    this.migrations.set(key, migration);
  }

  /**
   * Migrate snapshot data from one version to another
   */
  public async migrateSnapshot(
    data: any, 
    fromVersion: string, 
    toVersion: string,
    _options: Partial<SnapshotHydrationOptions> = {}
  ): Promise<SnapshotHydrationResult> {
    const startTime = performance.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Validate input
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid snapshot data provided');
      }

      if (fromVersion === toVersion) {
        return {
          success: true,
          scene: data.scene || null,
          nodes: data.nodes || [],
          edges: data.edges || [],
          warnings: ['No migration needed - versions are the same'],
          errors: [],
          performance: {
            loadTime: 0,
            parseTime: 0,
            validationTime: 0,
            totalTime: performance.now() - startTime,
            memoryUsage: 0
          },
          metadata: {
            fromVersion,
            toVersion,
            migrated: false
          }
        };
      }

      // Find migration path
      const migrationPath = this.findMigrationPath(fromVersion, toVersion);
      if (!migrationPath.length) {
        throw new Error(`No migration path found from ${fromVersion} to ${toVersion}`);
      }

      // Apply migrations in sequence
      let currentData = { ...data };
      for (const migration of migrationPath) {
        currentData = await this.applyMigration(currentData, migration);
        warnings.push(`Applied migration from ${migration.fromVersion} to ${migration.toVersion}`);
      }

      const totalTime = performance.now() - startTime;

      return {
        success: true,
        scene: currentData.scene || null,
        nodes: currentData.nodes || [],
        edges: currentData.edges || [],
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
          fromVersion,
          toVersion,
          migrated: true,
          migrationPath: migrationPath.map(m => `${m.fromVersion}->${m.toVersion}`)
        }
      };

    } catch (error) {
      const totalTime = performance.now() - startTime;
      errors.push(error instanceof Error ? error.message : 'Unknown migration error');

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
          fromVersion,
          toVersion,
          migrated: false,
          error: errors[0]
        }
      };
    }
  }

  /**
   * Find the shortest migration path between two versions
   */
  private findMigrationPath(fromVersion: string, toVersion: string): SnapshotMigration[] {
    const visited = new Set<string>();
    const queue: { version: string; path: SnapshotMigration[] }[] = [{ version: fromVersion, path: [] }];

    while (queue.length > 0) {
      const { version, path: currentPath } = queue.shift()!;

      if (version === toVersion) {
        return currentPath;
      }

      if (visited.has(version)) {
        continue;
      }
      visited.add(version);

      // Find all migrations from current version
      for (const [, migration] of this.migrations) {
        if (migration.fromVersion === version) {
          queue.push({
            version: migration.toVersion,
            path: [...currentPath, migration]
          });
        }
      }
    }

    return [];
  }

  /**
   * Apply a single migration to the data
   */
  private async applyMigration(
    data: any, 
    migration: SnapshotMigration
  ): Promise<any> {
    let currentData = { ...data };

    for (const step of migration.steps) {
      try {
        // Validate step before applying
        if (step.validation && !step.validation(currentData)) {
          throw new Error(`Validation failed for step: ${step.description}`);
        }

        // Apply the step
        currentData = await step.action(currentData);

        // Validate step after applying
        if (step.validation && !step.validation(currentData)) {
          throw new Error(`Post-application validation failed for step: ${step.description}`);
        }

      } catch (error) {
        throw new Error(`Migration step failed: ${step.description} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return currentData;
  }

  /**
   * Get the current schema version
   */
  public getCurrentVersion(): string {
    return this.currentVersion;
  }

  /**
   * Set the current schema version
   */
  public setCurrentVersion(version: string): void {
    this.currentVersion = version;
  }

  /**
   * Get all registered migrations
   */
  public getMigrations(): SnapshotMigration[] {
    return Array.from(this.migrations.values());
  }

  /**
   * Get available migration paths from a version
   */
  public getAvailableMigrations(fromVersion: string): SnapshotMigration[] {
    return Array.from(this.migrations.values()).filter(m => m.fromVersion === fromVersion);
  }

  /**
   * Check if a migration exists between two versions
   */
  public hasMigration(fromVersion: string, toVersion: string): boolean {
    return this.findMigrationPath(fromVersion, toVersion).length > 0;
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
   * Register default migrations for common version transitions
   */
  private registerDefaultMigrations(): void {
    // Migration from 0.9.0 to 1.0.0
    this.registerMigration({
      fromVersion: '0.9.0',
      toVersion: '1.0.0',
      steps: [
        {
          type: 'transform',
          description: 'Update schema version to 1.0.0',
          action: (data: any) => {
            if (data.schema) {
              data.schema.version = '1.0.0';
            }
            return data;
          },
          validation: (data: any) => data.schema?.version === '1.0.0'
        },
        {
          type: 'add',
          description: 'Add integrity hash field',
          action: (data: any) => {
            if (data.integrity && !data.integrity.hash) {
              data.integrity.hash = '';
            }
            return data;
          },
          validation: (data: any) => data.integrity?.hash !== undefined
        },
        {
          type: 'add',
          description: 'Add cache configuration',
          action: (data: any) => {
            if (!data.cache) {
              data.cache = {
                ttl: 86400,
                immutable: true
              };
            }
            return data;
          },
          validation: (data: any) => data.cache?.ttl !== undefined
        }
      ],
      rollback: [
        {
          type: 'transform',
          description: 'Revert schema version to 0.9.0',
          action: (data: any) => {
            if (data.schema) {
              data.schema.version = '0.9.0';
            }
            return data;
          }
        },
        {
          type: 'remove',
          description: 'Remove integrity hash field',
          action: (data: any) => {
            if (data.integrity) {
              delete data.integrity.hash;
            }
            return data;
          }
        },
        {
          type: 'remove',
          description: 'Remove cache configuration',
          action: (data: any) => {
            delete data.cache;
            return data;
          }
        }
      ],
      metadata: {
        description: 'Migration from legacy 0.9.0 format to 1.0.0',
        breaking: false,
        author: 'Protogen System',
        date: new Date().toISOString()
      }
    });

    // Migration from 1.0.0 to 1.1.0 (example)
    this.registerMigration({
      fromVersion: '1.0.0',
      toVersion: '1.1.0',
      steps: [
        {
          type: 'add',
          description: 'Add tenant awareness to scene data',
          action: (data: any) => {
            if (data.scene && !data.scene.tenant_id) {
              data.scene.tenant_id = null; // Will be set during hydration
            }
            return data;
          },
          validation: (data: any) => data.scene?.tenant_id !== undefined
        },
        {
          type: 'add',
          description: 'Add context support to scene data',
          action: (data: any) => {
            if (data.scene && !data.scene.contexts) {
              data.scene.contexts = [];
            }
            return data;
          },
          validation: (data: any) => Array.isArray(data.scene?.contexts)
        }
      ],
      rollback: [
        {
          type: 'remove',
          description: 'Remove tenant_id from scene data',
          action: (data: any) => {
            if (data.scene) {
              delete data.scene.tenant_id;
            }
            return data;
          }
        },
        {
          type: 'remove',
          description: 'Remove contexts from scene data',
          action: (data: any) => {
            if (data.scene) {
              delete data.scene.contexts;
            }
            return data;
          }
        }
      ],
      metadata: {
        description: 'Add multi-tenant and context support',
        breaking: false,
        author: 'Protogen System',
        date: new Date().toISOString()
      }
    });
  }
}

// Export singleton instance
export const snapshotMigrationService = new SnapshotMigrationService();
