import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { ThemeToggle } from '@progress/shared';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminUser {
  id: number;
  name: string;
  email: string;
}

interface AdminUserMenuProps {
  user: AdminUser | null;
  onLogout: () => void;
}

export function AdminUserMenu({ user, onLogout }: AdminUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted/50"
      >
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium">{user?.name || 'Admin'}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50"
          >
            <div className="p-2">
              {/* User Info */}
              <div className="px-3 py-2 border-b border-border mb-2">
                <div className="text-sm font-medium text-foreground">{user?.name || 'Admin'}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                              {/* Theme Toggle */}
              <ThemeToggle 
                variant="ghost" 
                size="default"
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
                ButtonComponent={({ children, className, ...props }) => (
                  <button
                    {...props}
                    className={className}
                    onClick={() => {
                      props.onClick?.();
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-4 w-4">
                        {children}
                      </div>
                      <span className="text-foreground">Toggle Theme</span>
                    </div>
                  </button>
                )}
              />

                {/* Settings */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>

                {/* Divider */}
                <div className="border-t border-border my-1" />

                {/* Logout */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-status-error hover:bg-status-error/10 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
