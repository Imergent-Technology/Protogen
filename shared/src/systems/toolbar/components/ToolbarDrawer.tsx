/**
 * ToolbarDrawer
 * 
 * Slide-out drawer component for navigation and other content
 */

import React, { useEffect } from 'react';
import { useToolbarDrawer } from '../useToolbar';
import type { DrawerItem } from '../types';
import { Home, Compass, User, Settings, Users, Edit, ChevronRight } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  home: Home,
  compass: Compass,
  user: User,
  settings: Settings,
  users: Users,
  edit: Edit
};

export interface ToolbarDrawerProps {
  drawerId: string;
  isOpen: boolean;
  onClose: () => void;
  edge: 'left' | 'right' | 'top' | 'bottom';
}

export const ToolbarDrawer: React.FC<ToolbarDrawerProps> = ({
  drawerId,
  isOpen,
  onClose,
  edge
}) => {
  const { drawer } = useToolbarDrawer(drawerId);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!drawer) return null;

  const edgeClasses = {
    left: 'left-0 top-0 bottom-0',
    right: 'right-0 top-0 bottom-0',
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0'
  };

  const transformClasses = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    top: isOpen ? 'translate-y-0' : '-translate-y-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full'
  };

  const borderClasses = {
    left: 'border-r',
    right: 'border-l',
    top: 'border-b',
    bottom: 'border-t'
  };

  const handleItemClick = (item: DrawerItem) => {
    if (item.action) {
      // Emit the action through the toolbar system
      (window as any).dispatchEvent(
        new CustomEvent('toolbar:menu-action', {
          detail: { action: item.action }
        })
      );
    }
    
    // Close drawer after action (if configured)
    if (drawer.closeOnClickOutside) {
      onClose();
    }
  };

  const renderItem = (item: DrawerItem, index: number): React.ReactElement | null => {
    switch (item.type) {
      case 'section-header':
        return (
          <div
            key={index}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {item.label}
          </div>
        );

      case 'separator':
        return (
          <hr key={index} className="my-2 border-border" />
        );

      case 'nav-item': {
        const Icon = item.icon ? iconMap[item.icon] : null;
        return (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 text-sm
              hover:bg-accent hover:text-accent-foreground
              transition-colors
              ${item.active ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground'}
            `}
          >
            {Icon && <Icon className="h-5 w-5" />}
            <span className="flex-1 text-left">{item.label}</span>
            {item.items && item.items.length > 0 && (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        );
      }

      case 'user-info':
        return (
          <div key={index} className="px-4 py-3 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User Name</p>
                <p className="text-xs text-muted-foreground truncate">user@example.com</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && drawer.overlay && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={drawer.closeOnClickOutside ? onClose : undefined}
        />
      )}

      {/* Drawer */}
      <aside
        className={`
          fixed z-50 bg-card border-border
          ${edgeClasses[edge]}
          ${borderClasses[edge]}
          ${transformClasses[edge]}
          transition-transform duration-300 ease-in-out
          overflow-y-auto
        `}
        style={{
          width: (edge === 'left' || edge === 'right') ? drawer.width : undefined,
          height: (edge === 'top' || edge === 'bottom') ? drawer.height : undefined
        }}
      >
        <div className="py-4">
          {drawer.items.map((item: DrawerItem, index: number) => renderItem(item, index))}
        </div>
      </aside>
    </>
  );
};

