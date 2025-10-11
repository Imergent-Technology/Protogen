/**
 * SlidePreview Component
 * 
 * Preview component for displaying slide thumbnails and basic information.
 * Used in slide selection interfaces and slide management.
 */

import React from 'react';
import { Button } from '@protogen/shared';
import { Play, Eye, Edit, Copy, Trash2 } from 'lucide-react';
import { SlidePreviewProps, Slide } from '@protogen/shared/systems/slide/types';

export const SlidePreview: React.FC<SlidePreviewProps> = ({
  slide,
  isActive,
  onSelect,
  className = '',
  style = {},
}) => {
  const handleSelect = () => {
    onSelect(slide.id);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement preview functionality
    console.log('Preview slide:', slide.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement edit functionality
    console.log('Edit slide:', slide.id);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement copy functionality
    console.log('Copy slide:', slide.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement delete functionality
    console.log('Delete slide:', slide.id);
  };

  return (
    <div
      className={`slide-preview ${className} ${
        isActive ? 'active' : ''
      }`}
      style={{
        border: isActive ? '2px solid var(--primary)' : '2px solid transparent',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style,
      }}
      onClick={handleSelect}
    >
      {/* Slide Thumbnail */}
      <div className="slide-thumbnail">
        <div
          className="w-full h-24 bg-muted flex items-center justify-center text-muted-foreground text-sm"
          style={{
            background: `linear-gradient(135deg, var(--muted) 0%, var(--muted-foreground) 100%)`,
          }}
        >
          <div className="text-center">
            <div className="font-semibold">Slide {slide.slideIndex + 1}</div>
            <div className="text-xs opacity-75">{slide.name}</div>
          </div>
        </div>
      </div>

      {/* Slide Info */}
      <div className="p-2">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-sm truncate">{slide.name}</h4>
          {isActive && (
            <div className="w-2 h-2 bg-primary rounded-full" />
          )}
        </div>
        
        {slide.description && (
          <p className="text-xs text-muted-foreground truncate mb-2">
            {slide.description}
          </p>
        )}

        {/* Slide Actions */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={handlePreview}
            className="h-6 w-6 p-0"
            title="Preview slide"
          >
            <Eye className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="xs"
            onClick={handleEdit}
            className="h-6 w-6 p-0"
            title="Edit slide"
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="xs"
            onClick={handleCopy}
            className="h-6 w-6 p-0"
            title="Copy slide"
          >
            <Copy className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="xs"
            onClick={handleDelete}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            title="Delete slide"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute top-1 right-1">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
    </div>
  );
};
