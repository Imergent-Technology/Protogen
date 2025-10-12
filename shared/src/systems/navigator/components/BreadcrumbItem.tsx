/**
 * BreadcrumbItem Component
 * 
 * Individual breadcrumb item with clickable navigation
 */

import React from 'react';
import { Breadcrumb } from '../useBreadcrumbs';

export interface BreadcrumbItemProps {
  breadcrumb: Breadcrumb;
  onNavigate: (path: string) => void;
  separator?: React.ReactNode;
  showSeparator?: boolean;
  className?: string;
}

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  breadcrumb,
  onNavigate,
  separator = '/',
  showSeparator = true,
  className = ''
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!breadcrumb.isActive && breadcrumb.path) {
      onNavigate(breadcrumb.path);
    }
  };

  const isEllipsis = breadcrumb.id === 'ellipsis';
  const isClickable = !breadcrumb.isActive && !isEllipsis && breadcrumb.path;

  return (
    <li className={`flex items-center gap-2 ${className}`}>
      {isEllipsis ? (
        <span className="text-muted-foreground px-1">
          {breadcrumb.label}
        </span>
      ) : (
        <a
          href={breadcrumb.path || '#'}
          onClick={handleClick}
          className={`
            flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors
            ${breadcrumb.isActive 
              ? 'text-foreground font-medium pointer-events-none' 
              : isClickable
                ? 'text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer'
                : 'text-muted-foreground cursor-default'
            }
          `}
          aria-current={breadcrumb.isActive ? 'page' : undefined}
          aria-label={`Navigate to ${breadcrumb.label}`}
        >
          {breadcrumb.icon && (
            <span className="w-4 h-4 flex items-center justify-center">
              {/* Icon placeholder - would use lucide-react or similar */}
              {breadcrumb.icon === 'home' && '🏠'}
            </span>
          )}
          <span>{breadcrumb.label}</span>
        </a>
      )}
      
      {showSeparator && (
        <span className="text-muted-foreground/50 select-none" aria-hidden="true">
          {separator}
        </span>
      )}
    </li>
  );
};

