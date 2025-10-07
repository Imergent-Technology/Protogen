import React, { useState } from 'react';
import { Button, Input, ThemeToggle } from '@protogen/shared';
import { Mail, MessageSquare, User, LogOut, X } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  reputation: number;
  is_admin: boolean;
}

interface ProtogenLayoutProps {
  children: React.ReactNode;
  user?: User | null;
  onLogout?: () => void;
}

export const ProtogenLayout: React.FC<ProtogenLayoutProps> = ({ children, user, onLogout }) => {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
    // const formData = new FormData(e.target as HTMLFormElement);
    // const email = formData.get('email') as string;
    // Newsletter signup
    setIsNewsletterOpen(false);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement feedback submission
    // const formData = new FormData(e.target as HTMLFormElement);
    // const feedback = formData.get('feedback') as string;
    // Feedback submitted
    setIsFeedbackOpen(false);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    onLogout?.();
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Main Content Area */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-b border-border z-50">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-foreground">Protogen</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Newsletter Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNewsletterOpen(!isNewsletterOpen)}
              className="flex items-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Newsletter</span>
            </Button>

            {/* Feedback Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-md shadow-lg">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Reputation: {(user.reputation * 100).toFixed(0)}%
                          {user.is_admin && " • Admin"}
                        </div>
                      </div>
                      <div className="border-t border-border my-1"></div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter Sidebar */}
      {isNewsletterOpen && (
        <div className="fixed top-16 right-0 w-80 h-full bg-popover border-l border-border z-40 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Newsletter Signup</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNewsletterOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleNewsletterSignup} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Subscribe
            </Button>
          </form>
        </div>
      )}

      {/* Feedback Sidebar */}
      {isFeedbackOpen && (
        <div className="fixed top-16 right-0 w-80 h-full bg-popover border-l border-border z-40 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">General Feedback</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFeedbackOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium mb-2">
                Your Feedback
              </label>
              <textarea
                id="feedback"
                name="feedback"
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Share your thoughts, suggestions, or report issues..."
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Submit Feedback
            </Button>
          </form>
        </div>
      )}


    </div>
  );
}; 