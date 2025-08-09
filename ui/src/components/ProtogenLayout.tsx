import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Mail, MessageSquare, User, LogOut, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

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
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    // TODO: Implement newsletter signup
    console.log('Newsletter signup:', email);
    setIsNewsletterOpen(false);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const feedback = formData.get('feedback') as string;
    // TODO: Implement feedback submission
    console.log('Feedback submitted:', feedback);
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
            {/* Theme Toggle */}
            <ThemeToggle size="sm" />

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

      {/* Social Login Modal */}
      {isUserMenuOpen && !isAuthenticated && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-popover border border-border rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Sign In</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSocialLogin('google')}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSocialLogin('facebook')}
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSocialLogin('twitter')}
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Continue with Twitter
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSocialLogin('apple')}
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 