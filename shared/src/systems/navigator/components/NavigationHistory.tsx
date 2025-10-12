/**
 * NavigationHistory Component
 * 
 * Displays navigation history with back/forward controls
 */

import React, { useState } from 'react';
import { useNavigationHistory } from '../useNavigator';
import { navigatorSystem } from '../NavigatorSystem';

export interface NavigationHistoryProps {
  maxItems?: number;
  showTimestamps?: boolean;
  className?: string;
}

export const NavigationHistory: React.FC<NavigationHistoryProps> = ({
  maxItems = 10,
  showTimestamps = false,
  className = ''
}) => {
  const { entries, canGoBack, canGoForward, navigateBack, navigateForward, currentIndex } = useNavigationHistory();
  const [isExpanded, setIsExpanded] = useState(false);

  const displayEntries = entries.slice(Math.max(0, entries.length - maxItems));

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const getEntryLabel = (entry: any): string => {
    if (entry.context.contextPath) {
      const pathParts = entry.context.contextPath.split('/').filter(Boolean);
      return pathParts[pathParts.length - 1] || 'Home';
    }
    if (entry.context.sceneSlug) {
      return entry.context.sceneSlug;
    }
    return 'Unknown';
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear navigation history?')) {
      navigatorSystem.clearHistory();
      setIsExpanded(false);
    }
  };

  return (
    <div className={`navigation-history ${className}`}>
      {/* Back/Forward Controls */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={navigateBack}
          disabled={!canGoBack}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${canGoBack
              ? 'bg-accent text-accent-foreground hover:bg-accent/80'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
            }
          `}
          aria-label="Navigate back"
        >
          ← Back
        </button>
        <button
          onClick={navigateForward}
          disabled={!canGoForward}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${canGoForward
              ? 'bg-accent text-accent-foreground hover:bg-accent/80'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
            }
          `}
          aria-label="Navigate forward"
        >
          Forward →
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-2 rounded-md text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/80"
          aria-label={isExpanded ? 'Hide history' : 'Show history'}
        >
          {isExpanded ? 'Hide History' : 'Show History'}
        </button>
      </div>

      {/* History List */}
      {isExpanded && (
        <div className="border border-border rounded-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-muted">
            <h3 className="text-sm font-medium">Navigation History</h3>
            <button
              onClick={handleClearHistory}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <ul className="divide-y divide-border max-h-96 overflow-y-auto">
            {displayEntries.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground text-center">
                No navigation history
              </li>
            ) : (
              displayEntries.map((entry, index) => {
                const isCurrent = entries.length - maxItems + index === currentIndex;
                return (
                  <li
                    key={entry.id}
                    className={`
                      px-4 py-3 text-sm hover:bg-accent/50 cursor-pointer transition-colors
                      ${isCurrent ? 'bg-accent font-medium' : ''}
                    `}
                    onClick={() => {
                      navigatorSystem.navigateTo(entry.target);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex-1">
                        {isCurrent && <span className="mr-2">→</span>}
                        {getEntryLabel(entry)}
                      </span>
                      {showTimestamps && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      )}
                    </div>
                    {entry.context.contextPath && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {entry.context.contextPath}
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

