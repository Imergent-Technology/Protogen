import React from 'react';
import { Button } from '@protogen/shared';
import { ChevronRight, MapPin, Layers, BookOpen, Home } from 'lucide-react';
import { useCurrentContext } from '../../systems/navigator';

interface ContextDisplayProps {
  onClick?: () => void;
}

export const ContextDisplay: React.FC<ContextDisplayProps> = ({ onClick }) => {
  const { context, sceneSlug, deckSlug, slideId } = useCurrentContext();

  const getContextIcon = () => {
    if (slideId) return <Layers className="h-4 w-4" />;
    if (sceneSlug) return <Layers className="h-4 w-4" />;
    if (deckSlug) return <BookOpen className="h-4 w-4" />;
    return <Home className="h-4 w-4" />;
  };

  const getContextLabel = () => {
    if (slideId && sceneSlug) {
      return `${sceneSlug} - Slide ${slideId}`;
    }
    if (sceneSlug) {
      return sceneSlug;
    }
    if (deckSlug) {
      return deckSlug;
    }
    return 'Home';
  };

  const getContextSubtitle = () => {
    if (context.coordinates) {
      return `Position: ${Math.round(context.coordinates.x)}, ${Math.round(context.coordinates.y)}`;
    }
    return null;
  };

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="flex items-center space-x-2 px-4 py-2 h-8 text-sm font-medium hover:bg-muted/50"
    >
      {getContextIcon()}
      <div className="flex flex-col items-start">
        <span>{getContextLabel()}</span>
        {getContextSubtitle() && (
          <span className="text-xs text-muted-foreground">{getContextSubtitle()}</span>
        )}
      </div>
      <ChevronRight className="h-3 w-3" />
    </Button>
  );
};
