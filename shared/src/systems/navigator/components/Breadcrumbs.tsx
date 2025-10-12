/**
 * Breadcrumbs Component
 * 
 * Main breadcrumb navigation container
 */

import React from 'react';
import { useBreadcrumbs, UseBreadcrumbsOptions } from '../useBreadcrumbs';
import { useNavigator } from '../useNavigator';
import { BreadcrumbItem } from './BreadcrumbItem';

export interface BreadcrumbsProps extends UseBreadcrumbsOptions {
  separator?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  maxItems,
  showHome = true,
  customLabels,
  separator = '/',
  className = '',
  'aria-label': ariaLabel = 'Breadcrumb navigation'
}) => {
  const breadcrumbs = useBreadcrumbs({ maxItems, showHome, customLabels });
  const { navigateTo } = useNavigator();

  const handleNavigate = (path: string) => {
    navigateTo({
      type: 'context',
      id: 'breadcrumb-nav',
      contextPath: path
    });
  };

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className="flex items-center flex-wrap gap-0">
        {breadcrumbs.map((breadcrumb, index) => (
          <BreadcrumbItem
            key={breadcrumb.id}
            breadcrumb={breadcrumb}
            onNavigate={handleNavigate}
            separator={separator}
            showSeparator={index < breadcrumbs.length - 1}
          />
        ))}
      </ol>
    </nav>
  );
};

