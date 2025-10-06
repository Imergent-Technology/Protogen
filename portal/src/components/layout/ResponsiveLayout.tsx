import React, { useState, useEffect } from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  topBar: React.ReactNode;
  className?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  topBar,
  className = ''
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className={`h-screen flex flex-col ${className}`}>
      {/* Top Bar - Always visible */}
      <div className="shrink-0">
        {topBar}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {isMobile ? (
          // Mobile: Overlay sidebar
          <>
            {sidebarOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40 bg-black/50"
                  onClick={() => setSidebarOpen(false)}
                />
                {/* Sidebar */}
                <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] z-50 bg-card border-r border-border transform transition-transform duration-300 ease-in-out">
                  {sidebar}
                </div>
              </>
            )}
          </>
        ) : (
          // Desktop: Persistent sidebar
          <div className="shrink-0">
            {sidebar}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Hook for managing responsive sidebar state
export const useResponsiveSidebar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return {
    isMobile,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar: () => setSidebarOpen(!sidebarOpen)
  };
};
