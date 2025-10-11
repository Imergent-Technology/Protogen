import React from 'react';
import { Button } from '@protogen/shared';
import { ChevronLeft, ChevronRight, Clock, MapPin, BookOpen, Layers } from 'lucide-react';
import { useNavigationHistory, NavigationEntry } from '@protogen/shared/systems/navigator';

interface NavigationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationHistory: React.FC<NavigationHistoryProps> = ({ isOpen, onClose }) => {
  const { entries, canGoBack, canGoForward, navigateBack, navigateForward } = useNavigationHistory();

  const getTargetIcon = (entry: NavigationEntry) => {
    switch (entry.target.type) {
      case 'scene':
        return <Layers className="h-4 w-4" />;
      case 'deck':
        return <BookOpen className="h-4 w-4" />;
      case 'context':
        return <MapPin className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getTargetLabel = (entry: NavigationEntry) => {
    const { target } = entry;
    
    if (target.type === 'scene') {
      return target.slug || `Scene ${target.id}`;
    }
    if (target.type === 'deck') {
      return target.slug || `Deck ${target.id}`;
    }
    if (target.type === 'context') {
      return target.slug || `Context ${target.id}`;
    }
    
    return `${target.type} ${target.id}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-96 max-w-[90vw]">
        {/* Current Track History (Horizontal) */}
        <div className="bg-card border border-border rounded-lg shadow-lg mb-2">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-sm">Current Track</h3>
          </div>
          <div className="p-4">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No navigation history yet
              </p>
            ) : (
              <div className="flex space-x-2 overflow-x-auto">
                {entries.map((entry, index) => (
                  <Button
                    key={entry.id}
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs flex items-center space-x-2"
                  >
                    {getTargetIcon(entry)}
                    <span>{getTargetLabel(entry)}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="bg-card border border-border rounded-lg shadow-lg mb-2">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-sm">Navigation</h3>
          </div>
          <div className="p-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={navigateBack}
                disabled={!canGoBack}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={navigateForward}
                disabled={!canGoForward}
                className="flex-1"
              >
                Forward
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Previous Tracks (Vertical) */}
        <div className="bg-card border border-border rounded-lg shadow-lg">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-sm">Previous Tracks</h3>
          </div>
          <div className="p-4 space-y-2">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No previous tracks available
              </p>
            ) : (
              entries.slice(0, 5).map((entry, index) => (
                <Button
                  key={entry.id}
                  variant="ghost"
                  className="w-full justify-between h-auto p-3"
                >
                  <div className="flex items-center space-x-3">
                    {getTargetIcon(entry)}
                    <div className="text-left">
                      <div className="font-medium text-sm">{getTargetLabel(entry)}</div>
                      <div className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
