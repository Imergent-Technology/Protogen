// Tenant System Types
// This file defines the TypeScript interfaces for the Multi-Tenant layer of the Protogen architecture

export interface Tenant {
  id: number;
  guid: string;
  name: string;
  slug: string;
  description?: string;
  domain?: string;
  config: TenantConfig;
  branding: TenantBranding;
  is_active: boolean;
  is_public: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  creator?: any; // User type from shared library
  configurations?: TenantConfiguration[];
  scenes?: any[]; // Scene[] from shared library
  decks?: any[]; // Deck[] from shared library
  contexts?: any[]; // Context[] from shared library
  feedback?: any[]; // Feedback[] from shared library
}

export interface TenantConfig {
  // Global settings
  global: TenantGlobalConfig;
  
  // Content settings
  content: TenantContentConfig;
  
  // Presentation settings
  presentation: TenantPresentationConfig;
  
  // Feedback settings
  feedback: TenantFeedbackConfig;
  
  // Custom settings
  custom: Record<string, any>;
}

export interface TenantGlobalConfig {
  timezone: string;
  locale: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  theme: string;
  features: string[];
  limits: TenantLimits;
  permissions: TenantPermissions;
}

export interface TenantLimits {
  maxScenes: number;
  maxDecks: number;
  maxContexts: number;
  maxUsers: number;
  maxStorage: number; // in bytes
  maxBandwidth: number; // in bytes per month
  maxApiCalls: number; // per month
}

export interface TenantPermissions {
  canCreateScenes: boolean;
  canCreateDecks: boolean;
  canCreateContexts: boolean;
  canInviteUsers: boolean;
  canManageSettings: boolean;
  canAccessAnalytics: boolean;
  canExportData: boolean;
  canImportData: boolean;
}

export interface TenantContentConfig {
  allowedSceneTypes: string[];
  allowedNodeTypes: string[];
  allowedEdgeTypes: string[];
  contentModeration: boolean;
  autoPublish: boolean;
  versionControl: boolean;
  backupRetention: number; // days
  contentSharing: TenantContentSharing;
}

export interface TenantContentSharing {
  allowSharing: boolean;
  allowPublicAccess: boolean;
  requireAttribution: boolean;
  allowCommercialUse: boolean;
  licenseType: string;
  sharingScope: 'tenant' | 'public' | 'restricted';
}

export interface TenantPresentationConfig {
  defaultTheme: string;
  customThemes: string[];
  allowCustomThemes: boolean;
  defaultLayout: string;
  animationSettings: TenantAnimationSettings;
  responsiveDesign: boolean;
  accessibility: TenantAccessibilitySettings;
}

export interface TenantAnimationSettings {
  enabled: boolean;
  defaultDuration: number;
  easing: string;
  reducedMotion: boolean;
  performanceMode: 'low' | 'medium' | 'high';
}

export interface TenantAccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindSupport: boolean;
}

export interface TenantFeedbackConfig {
  enabled: boolean;
  allowAnonymous: boolean;
  moderationRequired: boolean;
  feedbackTypes: string[];
  autoModeration: boolean;
  notificationSettings: TenantNotificationSettings;
}

export interface TenantNotificationSettings {
  email: boolean;
  inApp: boolean;
  push: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  types: string[];
}

export interface TenantBranding {
  logo?: string;
  favicon?: string;
  colors: TenantColorScheme;
  fonts: TenantFontSettings;
  customCSS?: string;
  customJS?: string;
  meta: TenantMetaSettings;
}

export interface TenantColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface TenantFontSettings {
  primary: string;
  secondary: string;
  heading: string;
  body: string;
  mono: string;
  sizes: TenantFontSizes;
  weights: TenantFontWeights;
}

export interface TenantFontSizes {
  xs: number;
  sm: number;
  base: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

export interface TenantFontWeights {
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
}

export interface TenantMetaSettings {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  robots: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: string;
  twitterSite?: string;
}

// Tenant Configuration Types
export interface TenantConfiguration {
  id: number;
  tenant_id: number;
  key: string;
  value: any;
  scope: TenantConfigScope;
  description?: string;
  is_encrypted: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  tenant?: Tenant;
}

export type TenantConfigScope = 'global' | 'content' | 'presentation' | 'feedback' | 'custom';

// Tenant Creation and Update Types
export interface CreateTenantRequest {
  name: string;
  slug?: string;
  description?: string;
  domain?: string;
  config?: Partial<TenantConfig>;
  branding?: Partial<TenantBranding>;
  is_active?: boolean;
  is_public?: boolean;
}

export interface UpdateTenantRequest extends Partial<CreateTenantRequest> {
  id: number;
}

export interface CreateTenantConfigurationRequest {
  tenant_id: number;
  key: string;
  value: any;
  scope: TenantConfigScope;
  description?: string;
  is_encrypted?: boolean;
  is_public?: boolean;
}

export interface UpdateTenantConfigurationRequest extends Partial<CreateTenantConfigurationRequest> {
  id: number;
}

// Tenant Validation Types
export interface TenantValidationResult {
  isValid: boolean;
  errors: TenantValidationError[];
  warnings: TenantValidationWarning[];
  suggestions: TenantValidationSuggestion[];
}

export interface TenantValidationError {
  type: 'error';
  code: string;
  message: string;
  path: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  data?: any;
}

export interface TenantValidationWarning {
  type: 'warning';
  code: string;
  message: string;
  path: string[];
  severity: 'medium' | 'low';
  data?: any;
}

export interface TenantValidationSuggestion {
  type: 'suggestion';
  code: string;
  message: string;
  path: string[];
  impact: 'high' | 'medium' | 'low';
  data?: any;
}

// Tenant Statistics Types
export interface TenantStatistics {
  tenant: Tenant;
  content: TenantContentStats;
  users: TenantUserStats;
  usage: TenantUsageStats;
  performance: TenantPerformanceStats;
  lastUpdated: string;
}

export interface TenantContentStats {
  scenes: number;
  decks: number;
  contexts: number;
  snapshots: number;
  totalSize: number;
  lastActivity: string;
}

export interface TenantUserStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  lastLogin: string;
}

export interface TenantUsageStats {
  apiCalls: number;
  bandwidth: number;
  storage: number;
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
}

export interface TenantPerformanceStats {
  averageResponseTime: number;
  uptime: number;
  errorRate: number;
  throughput: number;
  lastMeasured: string;
}

// Tenant Event Types
export interface TenantEvent {
  type: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 
        'config_changed' | 'branding_changed' | 'user_added' | 'user_removed' |
        'limit_reached' | 'quota_exceeded' | 'backup_created' | 'backup_restored';
  target: 'tenant' | 'config' | 'branding' | 'user' | 'content' | 'usage';
  data: any;
  timestamp: number;
  source: 'user' | 'system' | 'api' | 'scheduled';
  metadata?: Record<string, any>;
}

// Tenant State Management
export interface TenantState {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  configurations: TenantConfiguration[];
  statistics: TenantStatistics | null;
  loading: boolean;
  error: string | null;
  events: TenantEvent[];
  validation: TenantValidationResult | null;
}

// Tenant Export/Import Types
export interface TenantExport {
  version: string;
  tenant: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>;
  configurations: Omit<TenantConfiguration, 'id' | 'created_at' | 'updated_at'>[];
  metadata: {
    exportedAt: string;
    exportedBy: string;
    source: string;
    format: string;
  };
}

export interface TenantImport {
  tenant: CreateTenantRequest;
  configurations: CreateTenantConfigurationRequest[];
  options: {
    overwrite?: boolean;
    merge?: boolean;
    validateOnly?: boolean;
    preserveIds?: boolean;
  };
}

// Tenant Migration Types
export interface TenantMigration {
  fromVersion: string;
  toVersion: string;
  steps: TenantMigrationStep[];
  rollback: TenantMigrationStep[];
  metadata: Record<string, any>;
}

export interface TenantMigrationStep {
  type: 'config' | 'branding' | 'content' | 'users' | 'custom';
  description: string;
  action: (tenant: Tenant) => Tenant;
  rollback?: (tenant: Tenant) => Tenant;
  validation?: (tenant: Tenant) => boolean;
  metadata?: Record<string, any>;
}

// Utility Types
export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'archived';
export type TenantTier = 'free' | 'basic' | 'professional' | 'enterprise';
export type TenantRegion = 'us-east' | 'us-west' | 'eu-west' | 'eu-central' | 'asia-pacific';
export type TenantLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';
