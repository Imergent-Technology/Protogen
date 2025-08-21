export type StageType = 'basic' | 'graph' | 'document' | 'table' | 'custom';

export interface StageConfig {
  title?: string;
  content?: string;
  icon?: string;
  showFallback?: boolean;
  [key: string]: any; // Allow for stage-specific config
}

// Document stage specific configuration
export interface DocumentStageConfig extends StageConfig {
  content: string;
  template?: string;
  theme?: string;
  layout: 'single' | 'two-column' | 'custom';
  autoSave: boolean;
  versioning: boolean;
  printEnabled: boolean;
}

export interface Stage {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  type: StageType;
  config: StageConfig;
  metadata?: Record<string, any>;
  is_active: boolean;
  is_system?: boolean; // Flag for system-created stages (admin stage, etc.)
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface StageContext {
  stage: Stage;
  isFallback?: boolean;
  isAdmin?: boolean;
  onStageUpdate?: (stage: Stage) => void;
  onStageDelete?: (stageId: number) => void;
}

// Admin-specific interfaces for backend extension
export interface StageAdminContext extends StageContext {
  isAdmin: true;
  onStageUpdate: (stage: Stage) => void;
  onStageDelete: (stageId: number) => void;
  onStageCreate?: (stage: Partial<Stage>) => void;
  availableStageTypes?: StageType[];
} 