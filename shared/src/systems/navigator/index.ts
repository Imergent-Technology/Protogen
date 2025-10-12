// Navigator System Exports

export * from './types';
export { NavigatorSystem, navigatorSystem } from './NavigatorSystem';
export * from './useNavigator';

// Breadcrumbs
export { useBreadcrumbs, getBreadcrumbLabel } from './useBreadcrumbs';
export type { Breadcrumb, UseBreadcrumbsOptions } from './useBreadcrumbs';

// Components (explicitly export to avoid naming conflicts)
export { Breadcrumbs } from './components/Breadcrumbs';
export type { BreadcrumbsProps } from './components/Breadcrumbs';
export { BreadcrumbItem } from './components/BreadcrumbItem';
export type { BreadcrumbItemProps } from './components/BreadcrumbItem';
export { NavigationHistory as NavigationHistoryComponent } from './components/NavigationHistory';
export type { NavigationHistoryProps } from './components/NavigationHistory';

// URL Sync Service
export { URLSyncService, urlSyncService } from './services/URLSyncService';
export type { URLSyncConfig } from './services/URLSyncService';

// Re-export commonly used types and functions
export { NavigatorSystem as Navigator, navigatorSystem as navigator } from './NavigatorSystem';
export { useNavigator, useNavigationHistory, useCurrentContext } from './useNavigator';
