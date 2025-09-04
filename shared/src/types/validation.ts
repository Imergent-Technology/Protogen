// Validation System Types
// This file defines the TypeScript interfaces for validation across the Protogen system

// Core Validation Types
export interface ValidationRule {
  type: ValidationRuleType;
  value: any;
  message?: string;
  severity?: ValidationSeverity;
  metadata?: Record<string, any>;
}

export type ValidationRuleType = 
  | 'required' 
  | 'min' 
  | 'max' 
  | 'minLength' 
  | 'maxLength' 
  | 'pattern' 
  | 'enum' 
  | 'email' 
  | 'url' 
  | 'uuid' 
  | 'date' 
  | 'number' 
  | 'integer' 
  | 'boolean' 
  | 'array' 
  | 'object' 
  | 'custom' 
  | 'unique' 
  | 'exists' 
  | 'relationship' 
  | 'format' 
  | 'range' 
  | 'size' 
  | 'file' 
  | 'image'
  | 'positive'
  | 'negative'
  | 'contains'
  | 'dependencies'
  | 'properties'
  | 'additionalProperties'
  | 'type'
  | 'dimensions'
  | 'extension';

export type ValidationSeverity = 'error' | 'warning' | 'info';

// Validation Results
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  info: ValidationInfo[];
  metadata: ValidationMetadata;
}

export interface ValidationError {
  type: 'error';
  code: string;
  message: string;
  path: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  rule: ValidationRule;
  value: any;
  expected?: any;
  received?: any;
  context?: Record<string, any>;
}

export interface ValidationWarning {
  type: 'warning';
  code: string;
  message: string;
  path: string[];
  severity: 'medium' | 'low';
  rule: ValidationRule;
  value: any;
  expected?: any;
  received?: any;
  context?: Record<string, any>;
}

export interface ValidationInfo {
  type: 'info';
  code: string;
  message: string;
  path: string[];
  rule: ValidationRule;
  value: any;
  context?: Record<string, any>;
}

export interface ValidationMetadata {
  validatedAt: string;
  validator: string;
  version: string;
  duration: number;
  fieldCount: number;
  ruleCount: number;
  context: Record<string, any>;
}

// Schema Validation
export interface ValidationSchema {
  version: string;
  fields: SchemaField[];
  required: string[];
  dependencies: FieldDependency[];
  custom: CustomValidationRule[];
  metadata: Record<string, any>;
}

export interface SchemaField {
  name: string;
  type: SchemaFieldType;
  required: boolean;
  nullable: boolean;
  default?: any;
  description?: string;
  rules: ValidationRule[];
  children?: SchemaField[]; // For nested objects/arrays
  metadata?: Record<string, any>;
}

export type SchemaFieldType = 
  | 'string' 
  | 'number' 
  | 'integer' 
  | 'boolean' 
  | 'array' 
  | 'object' 
  | 'null' 
  | 'date' 
  | 'datetime' 
  | 'email' 
  | 'url' 
  | 'uuid' 
  | 'file' 
  | 'image' 
  | 'json' 
  | 'custom';

export interface FieldDependency {
  field: string;
  dependsOn: string[];
  condition: 'all' | 'any' | 'none';
  rules: ValidationRule[];
  message?: string;
}

export interface CustomValidationRule {
  name: string;
  description: string;
  validator: (value: any, context: ValidationContext) => ValidationResult;
  async?: boolean;
  metadata?: Record<string, any>;
}

// Validation Context
export interface ValidationContext {
  data: Record<string, any>;
  path: string[];
  field: string;
  value: any;
  parent?: any;
  root?: any;
  options: ValidationOptions;
  metadata: Record<string, any>;
}

export interface ValidationOptions {
  strict: boolean;
  abortEarly: boolean;
  allowUnknown: boolean;
  stripUnknown: boolean;
  context: Record<string, any>;
  [key: string]: any;
}

// Field-Specific Validation Rules
export interface StringValidationRule extends ValidationRule {
  type: 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'uuid' | 'format';
  value: number | string | RegExp;
}

export interface NumberValidationRule extends ValidationRule {
  type: 'min' | 'max' | 'range' | 'integer' | 'positive' | 'negative';
  value: number;
}

export interface ArrayValidationRule extends ValidationRule {
  type: 'minLength' | 'maxLength' | 'size' | 'unique' | 'contains';
  value: number | any;
}

export interface ObjectValidationRule extends ValidationRule {
  type: 'required' | 'properties' | 'additionalProperties' | 'dependencies';
  value: string[] | Record<string, any>;
}

export interface FileValidationRule extends ValidationRule {
  type: 'size' | 'type' | 'extension' | 'dimensions';
  value: number | string | string[] | { width: number; height: number };
}

// Registry Validation
export interface RegistryValidationRule extends ValidationRule {
  scope: string;
  key: string;
  metadata?: Record<string, any>;
}

export interface RegistryValidationSchema {
  scope: string;
  rules: RegistryValidationRule[];
  metadata: Record<string, any>;
}

// Scene Validation
export interface SceneValidationRule extends ValidationRule {
  target: 'scene' | 'node' | 'edge' | 'style' | 'layout' | 'animation';
  context: 'creation' | 'update' | 'publishing' | 'rendering';
}

export interface SceneValidationSchema {
  scene: ValidationSchema;
  nodes: ValidationSchema;
  edges: ValidationSchema;
  styles: ValidationSchema;
  layout: ValidationSchema;
  animations: ValidationSchema;
}

// Snapshot Validation
export interface SnapshotValidationRule extends ValidationRule {
  target: 'snapshot' | 'content' | 'manifest' | 'schema' | 'integrity';
  context: 'creation' | 'hydration' | 'migration' | 'storage';
}

export interface SnapshotValidationSchema {
  snapshot: ValidationSchema;
  content: ValidationSchema;
  manifest: ValidationSchema;
  schema: ValidationSchema;
}

// Validation Functions
export interface ValidatorFunction {
  (value: any, context: ValidationContext): ValidationResult | Promise<ValidationResult>;
}

export interface AsyncValidatorFunction {
  (value: any, context: ValidationContext): Promise<ValidationResult>;
}

// Validation Registry
export interface ValidationRegistry {
  rules: Map<string, ValidationRule>;
  schemas: Map<string, ValidationSchema>;
  validators: Map<string, ValidatorFunction>;
  customRules: Map<string, CustomValidationRule>;
}

// Validation Performance
export interface ValidationPerformance {
  startTime: number;
  endTime: number;
  duration: number;
  ruleCount: number;
  fieldCount: number;
  errorCount: number;
  warningCount: number;
  memoryUsage: number;
  [key: string]: number;
}

// Validation Events
export interface ValidationEvent {
  type: 'start' | 'rule' | 'field' | 'complete' | 'error' | 'warning';
  target: string;
  data: any;
  timestamp: number;
  performance: ValidationPerformance;
  metadata: Record<string, any>;
}

// Validation Pipeline
export interface ValidationPipeline {
  stages: ValidationStage[];
  options: ValidationOptions;
  context: Record<string, any>;
}

export interface ValidationStage {
  name: string;
  order: number;
  validators: ValidatorFunction[];
  condition?: (context: ValidationContext) => boolean;
  metadata: Record<string, any>;
}

// Validation Results Aggregation
export interface ValidationSummary {
  totalFields: number;
  validatedFields: number;
  errorFields: number;
  warningFields: number;
  infoFields: number;
  successRate: number;
  performance: ValidationPerformance;
  metadata: Record<string, any>;
}

// Field Validation Results
export interface FieldValidationResult {
  field: string;
  path: string[];
  value: any;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  info: ValidationInfo[];
  metadata: Record<string, any>;
}

// Validation Error Codes
export enum ValidationErrorCode {
  REQUIRED = 'REQUIRED',
  TYPE_MISMATCH = 'TYPE_MISMATCH',
  MIN_VALUE = 'MIN_VALUE',
  MAX_VALUE = 'MAX_VALUE',
  MIN_LENGTH = 'MIN_LENGTH',
  MAX_LENGTH = 'MAX_LENGTH',
  PATTERN_MISMATCH = 'PATTERN_MISMATCH',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_URL = 'INVALID_URL',
  INVALID_UUID = 'INVALID_UUID',
  INVALID_DATE = 'INVALID_DATE',
  INVALID_FORMAT = 'INVALID_FORMAT',
  DUPLICATE_VALUE = 'DUPLICATE_VALUE',
  RELATIONSHIP_ERROR = 'RELATIONSHIP_ERROR',
  CUSTOM_VALIDATION_FAILED = 'CUSTOM_VALIDATION_FAILED',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  IMAGE_ERROR = 'IMAGE_ERROR',
  SCHEMA_ERROR = 'SCHEMA_ERROR',
  INTEGRITY_ERROR = 'INTEGRITY_ERROR'
}

// Validation Rule Presets
export interface ValidationRulePreset {
  name: string;
  description: string;
  rules: ValidationRule[];
  metadata: Record<string, any>;
}

export const CommonValidationPresets: Record<string, ValidationRulePreset> = {
  email: {
    name: 'Email Validation',
    description: 'Standard email validation rules',
    rules: [
      { type: 'required', value: true, message: 'Email is required' },
      { type: 'email', value: true, message: 'Invalid email format' }
    ],
    metadata: { category: 'input', common: true }
  },
  
  password: {
    name: 'Password Validation',
    description: 'Secure password validation rules',
    rules: [
      { type: 'required', value: true, message: 'Password is required' },
      { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
      { type: 'pattern', value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Password must contain lowercase, uppercase, and number' }
    ],
    metadata: { category: 'security', common: true }
  },
  
  url: {
    name: 'URL Validation',
    description: 'Standard URL validation rules',
    rules: [
      { type: 'required', value: true, message: 'URL is required' },
      { type: 'url', value: true, message: 'Invalid URL format' }
    ],
    metadata: { category: 'input', common: true }
  },
  
  positiveInteger: {
    name: 'Positive Integer',
    description: 'Positive integer validation rules',
    rules: [
      { type: 'required', value: true, message: 'Value is required' },
      { type: 'integer', value: true, message: 'Value must be an integer' },
      { type: 'min', value: 1, message: 'Value must be positive' }
    ],
    metadata: { category: 'number', common: true }
  }
};

// Utility Types
export type ValidationStatus = 'pending' | 'validating' | 'valid' | 'invalid' | 'error';
export type ValidationMode = 'sync' | 'async' | 'batch';
export type ValidationStrategy = 'fail-fast' | 'collect-all' | 'best-effort';
export type ValidationScope = 'field' | 'object' | 'array' | 'document' | 'system';
