// Navigator System Exports

export * from './types';
export { NavigatorSystem } from './NavigatorSystem';
export * from './useNavigator';

// URL Sync Service
export { URLSyncService, urlSyncService } from './services/URLSyncService';
export type { URLSyncConfig } from './services/URLSyncService';

// Re-export commonly used types and functions
export { NavigatorSystem as Navigator } from './NavigatorSystem';
export { useNavigator, useNavigationHistory, useCurrentContext } from './useNavigator';
