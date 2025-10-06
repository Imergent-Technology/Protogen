import React from 'react';
import { Button } from '@protogen/shared';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useNavigator } from '../../systems/navigator';

interface NavigationControlsProps {
  className?: string;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({ className = '' }) => {
  const { navigateBack, navigateForward, canGoBack, canGoForward, isLoading } = useNavigator();

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={navigateBack}
        disabled={!canGoBack || isLoading}
        className="h-8 w-8 p-0"
        title="Go back"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={navigateForward}
        disabled={!canGoForward || isLoading}
        className="h-8 w-8 p-0"
        title="Go forward"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-4 bg-border mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.reload()}
        disabled={isLoading}
        className="h-8 w-8 p-0"
        title="Refresh"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};
