// Snapshot System Types
// This file defines the TypeScript interfaces for the Snapshot layer of the Protogen architecture

export interface Snapshot {
  id: number;
  guid: string;
  name: string;
  slug: string;
  description?: string;
  scene_id: number;
  version: string;
  status: SnapshotStatus;
  manifest: SnapshotManifest;
  content_hash: string;
  storage_path: string;
  compression_type: CompressionType;
  file_size: number;
  metadata: SnapshotMetadata;
  published_at?: string;
  expires_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  scene?: any; // Scene type from shared library
  creator?: any; // User type from shared library
}

export type SnapshotStatus = 'draft' | 'published' | 'archived' | 'expired';
export type CompressionType = 'brotli' | 'gzip' | 'none';

export interface SnapshotManifest {
  version: string;
  schema: SnapshotSchema;
  content: SnapshotContent;
  metadata: SnapshotManifestMetadata;
  checksums: SnapshotChecksums;
  dependencies: SnapshotDependencies;
  [key: string]: any; // Allow for extensibility
}

export interface SnapshotSchema {
  version: string;
  format: 'json' | 'msgpack' | 'protobuf';
  encoding: 'utf8' | 'base64' | 'hex';
  compression: CompressionType;
  structure: SchemaStructure;
}

export interface SchemaStructure {
  nodes: NodeSchema;
  edges: EdgeSchema;
  styles: StyleSchema;
  layout: LayoutSchema;
  animations: AnimationSchema;
  [key: string]: any;
}

export interface NodeSchema {
  version: string;
  fields: SchemaField[];
  required: string[];
  defaults: Record<string, any>;
  validation: ValidationRule[];
}

export interface EdgeSchema {
  version: string;
  fields: SchemaField[];
  required: string[];
  defaults: Record<string, any>;
  validation: ValidationRule[];
}

export interface StyleSchema {
  version: string;
  themes: string[];
  variables: string[];
  presets: string[];
}

export interface LayoutSchema {
  version: string;
  algorithms: string[];
  constraints: string[];
  options: string[];
}

export interface AnimationSchema {
  version: string;
  types: string[];
  easing: string[];
  properties: string[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null';
  required: boolean;
  default?: any;
  description?: string;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'enum' | 'custom';
  value: any;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface SnapshotContent {
  nodes: any[]; // SceneNode[] from shared library
  edges: any[]; // SceneEdge[] from shared library
  styles: Record<string, any>;
  layout: any; // SceneLayout from shared library
  animations: Record<string, any>;
  metadata: Record<string, any>;
  [key: string]: any;
}

export interface SnapshotManifestMetadata {
  created_at: string;
  created_by: string;
  source: string;
  tags: string[];
  category: string;
  priority: number;
  [key: string]: any;
}

export interface SnapshotChecksums {
  content: string; // SHA256 hash of uncompressed content
  compressed: string; // SHA256 hash of compressed content
  manifest: string; // SHA256 hash of manifest
  [key: string]: string;
}

export interface SnapshotDependencies {
  scenes: string[]; // Scene GUIDs this snapshot depends on
  nodes: string[]; // Core node GUIDs this snapshot depends on
  edges: string[]; // Core edge GUIDs this snapshot depends on
  assets: string[]; // Asset URLs this snapshot depends on
  [key: string]: string[];
}

export interface SnapshotMetadata {
  tags: string[];
  category: string;
  priority: number;
  author: string;
  license: string;
  source: string;
  notes: string;
  [key: string]: any;
}

// Snapshot Creation and Update Types
export interface CreateSnapshotRequest {
  name: string;
  slug?: string;
  description?: string;
  scene_id: number;
  version?: string;
  status?: SnapshotStatus;
  compression_type?: CompressionType;
  metadata?: Partial<SnapshotMetadata>;
  expires_at?: string;
}

export interface UpdateSnapshotRequest extends Partial<CreateSnapshotRequest> {
  id: number;
}

export interface SnapshotPublishRequest {
  status: 'published';
  published_at?: string;
  expires_at?: string;
  metadata?: Partial<SnapshotMetadata>;
}

export interface SnapshotArchiveRequest {
  status: 'archived';
  archived_at?: string;
  reason?: string;
}

// Snapshot Validation Types
export interface SnapshotValidationResult {
  isValid: boolean;
  errors: SnapshotValidationError[];
  warnings: SnapshotValidationWarning[];
  suggestions: SnapshotValidationSuggestion[];
  integrity: SnapshotIntegrityCheck;
}

export interface SnapshotValidationError {
  type: 'error';
  code: string;
  message: string;
  path: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  data?: any;
}

export interface SnapshotValidationWarning {
  type: 'warning';
  code: string;
  message: string;
  path: string[];
  severity: 'medium' | 'low';
  data?: any;
}

export interface SnapshotValidationSuggestion {
  type: 'suggestion';
  code: string;
  message: string;
  path: string[];
  impact: 'high' | 'medium' | 'low';
  data?: any;
}

export interface SnapshotIntegrityCheck {
  contentHash: boolean;
  compressedHash: boolean;
  manifestHash: boolean;
  fileSize: boolean;
  compression: boolean;
  schema: boolean;
  dependencies: boolean;
}

// Snapshot Hydration Types
export interface SnapshotHydrationOptions {
  validate: boolean;
  strict: boolean;
  fallback: boolean;
  cache: boolean;
  timeout: number;
  [key: string]: any;
}

export interface SnapshotHydrationResult {
  success: boolean;
  scene: any; // Scene from shared library
  nodes: any[]; // SceneNode[] from shared library
  edges: any[]; // SceneEdge[] from shared library
  warnings: string[];
  errors: string[];
  performance: HydrationPerformance;
  metadata: Record<string, any>;
}

export interface HydrationPerformance {
  loadTime: number;
  parseTime: number;
  validationTime: number;
  totalTime: number;
  memoryUsage: number;
  [key: string]: number;
}

// Snapshot Migration Types
export interface SnapshotMigration {
  fromVersion: string;
  toVersion: string;
  steps: MigrationStep[];
  rollback: MigrationStep[];
  metadata: Record<string, any>;
}

export interface MigrationStep {
  type: 'transform' | 'add' | 'remove' | 'rename' | 'custom';
  description: string;
  action: (data: any) => any;
  rollback?: (data: any) => any;
  validation?: (data: any) => boolean;
  metadata?: Record<string, any>;
}

// Snapshot Storage Types
export interface SnapshotStorageInfo {
  path: string;
  size: number;
  compression: CompressionType;
  checksum: string;
  lastModified: string;
  accessCount: number;
  [key: string]: any;
}

export interface SnapshotStorageOptions {
  compress: boolean;
  encrypt: boolean;
  backup: boolean;
  cache: boolean;
  ttl: number;
  [key: string]: any;
}

// Snapshot Performance Types
export interface SnapshotPerformanceMetrics {
  creationTime: number;
  compressionTime: number;
  storageTime: number;
  retrievalTime: number;
  hydrationTime: number;
  memoryUsage: number;
  fileSize: number;
  compressionRatio: number;
  [key: string]: number;
}

// Snapshot Event Types
export interface SnapshotEvent {
  type: 'created' | 'updated' | 'published' | 'archived' | 'deleted' | 
        'accessed' | 'validated' | 'migrated' | 'restored';
  target: 'snapshot' | 'content' | 'manifest' | 'storage';
  data: any;
  timestamp: number;
  source: 'user' | 'system' | 'api' | 'scheduled';
  metadata?: Record<string, any>;
}

// Snapshot State Management
export interface SnapshotState {
  snapshots: Snapshot[];
  currentSnapshot: Snapshot | null;
  loading: boolean;
  error: string | null;
  performance: SnapshotPerformanceMetrics;
  events: SnapshotEvent[];
  validation: SnapshotValidationResult | null;
  hydration: SnapshotHydrationResult | null;
}

// Snapshot Export/Import Types
export interface SnapshotExport {
  version: string;
  snapshot: Omit<Snapshot, 'id' | 'created_at' | 'updated_at'>;
  content: any;
  manifest: SnapshotManifest;
  metadata: {
    exportedAt: string;
    exportedBy: string;
    source: string;
    format: string;
  };
}

export interface SnapshotImport {
  snapshot: CreateSnapshotRequest;
  content: any;
  manifest: SnapshotManifest;
  options: {
    overwrite?: boolean;
    merge?: boolean;
    validateOnly?: boolean;
    migrate?: boolean;
  };
}

// Snapshot Comparison Types
export interface SnapshotComparison {
  source: string;
  target: string;
  differences: SnapshotDifference[];
  similarity: number;
  metadata: Record<string, any>;
}

export interface SnapshotDifference {
  type: 'added' | 'removed' | 'modified' | 'moved';
  path: string[];
  source?: any;
  target?: any;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// Snapshot Versioning Types
export interface SnapshotVersion {
  version: string;
  snapshot: Snapshot;
  changes: SnapshotChange[];
  parent?: string;
  children: string[];
  metadata: Record<string, any>;
}

export interface SnapshotChange {
  type: 'node' | 'edge' | 'style' | 'layout' | 'animation' | 'metadata';
  action: 'added' | 'removed' | 'modified';
  path: string[];
  description: string;
  timestamp: string;
  author: string;
}

// Utility Types
export type SnapshotFormat = 'json' | 'msgpack' | 'protobuf' | 'binary';
export type SnapshotEncoding = 'utf8' | 'base64' | 'hex' | 'binary';
export type SnapshotPriority = 'low' | 'medium' | 'high' | 'critical';
export type SnapshotCategory = 'development' | 'staging' | 'production' | 'archive';
export type SnapshotAccess = 'public' | 'private' | 'restricted' | 'internal';
