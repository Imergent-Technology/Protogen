import React from 'react';
import { ToolbarContainer } from '@protogen/shared/systems/toolbar/components';
import { ToolbarDrawer } from '@protogen/shared/systems/toolbar/components';
import { useToolbar } from '@protogen/shared/systems/toolbar';
import { toolbarSystem } from '@protogen/shared/systems/toolbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isDrawerOpen } = useToolbar();
  
  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* Top Toolbar */}
      <ToolbarContainer toolbarId="top-toolbar" edge="top" />
      
      {/* Main Navigation Drawer */}
      <ToolbarDrawer
        drawerId="main-nav-drawer"
        isOpen={isDrawerOpen('main-nav-drawer')}
        onClose={() => toolbarSystem.closeDrawer('main-nav-drawer')}
        edge="left"
      />
      
      {/* Main content with padding for top toolbar */}
      <div className="absolute inset-0 pt-14">
        <main className="h-full w-full overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
