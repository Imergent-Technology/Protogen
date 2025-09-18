// Common types used across the authoring library

// Scene type manager types
export interface SceneType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'interactive' | 'presentation' | 'content' | 'custom';
  features: string[];
  isBuiltIn: boolean;
  isEnabled: boolean;
}

export interface SceneTypeManagerProps {
  availableTypes: SceneType[];
  onCreateScene: (type: SceneType) => void;
  onEditType?: (type: SceneType) => void;
  onToggleType?: (type: SceneType) => void;
  className?: string;
}

// Common authoring props
export interface BaseAuthoringProps {
  className?: string;
  permissions?: any; // Will be properly typed when AuthoringPermissions is available
  onSave: (data: any) => void;
  onPreview: (data: any) => void;
  onCancel: () => void;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Authoring state types
export interface AuthoringState {
  isDirty: boolean;
  isSaving: boolean;
  isPreviewing: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Export types
export interface ExportOptions {
  format: 'json' | 'yaml' | 'xml' | 'pdf';
  includeMetadata: boolean;
  includeAssets: boolean;
  compress: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: any;
  url?: string;
  error?: string;
}

// Import types
export interface ImportOptions {
  format: 'json' | 'yaml' | 'xml';
  validate: boolean;
  merge: boolean;
}

export interface ImportResult {
  success: boolean;
  data?: any;
  errors?: ValidationError[];
  warnings?: ValidationError[];
}

// Event types
export interface AuthoringEvent {
  type: 'save' | 'preview' | 'cancel' | 'dirty' | 'clean' | 'error';
  data?: any;
  timestamp: number;
}

export type AuthoringEventHandler = (event: AuthoringEvent) => void;
