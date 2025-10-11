/**
 * Animation Editor Component
 * 
 * UI for editing slide entrance and exit animations with preset support.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@protogen/shared';
import { 
  Settings, 
  Play, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown,
  Maximize2,
  Eye,
  EyeOff
} from 'lucide-react';
import type { SlideAnimation, AnimationPreset } from '@protogen/shared/systems/scene';
import { ANIMATION_PRESETS, getAnimationPreset } from '@protogen/shared/systems/scene';

interface AnimationEditorProps {
  animation: SlideAnimation;
  type: 'entrance' | 'exit';
  onChange: (animation: SlideAnimation) => void;
  onPreview?: () => void;
}

export const AnimationEditor: React.FC<AnimationEditorProps> = ({
  animation,
  type,
  onChange,
  onPreview,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTypeChange = (animationType: SlideAnimation['type']) => {
    onChange({ ...animation, type: animationType });
  };

  const handleDirectionChange = (direction: SlideAnimation['direction']) => {
    onChange({ ...animation, direction });
  };

  const handleDistanceChange = (distance: SlideAnimation['distance']) => {
    onChange({ ...animation, distance });
  };

  const handleDurationChange = (duration: number) => {
    onChange({ ...animation, duration });
  };

  const handleEasingChange = (easing: string) => {
    onChange({ ...animation, easing });
  };

  const directionIcons = {
    left: <ArrowLeft className="h-4 w-4" />,
    right: <ArrowRight className="h-4 w-4" />,
    top: <ArrowUp className="h-4 w-4" />,
    bottom: <ArrowDown className="h-4 w-4" />,
    center: <Maximize2 className="h-4 w-4" />,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm capitalize">{type} Animation</CardTitle>
            <CardDescription>Configure how slides {type === 'entrance' ? 'enter' : 'exit'}</CardDescription>
          </div>
          {onPreview && (
            <Button size="sm" variant="outline" onClick={onPreview}>
              <Play className="h-3 w-3 mr-1" />
              Preview
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Animation Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Type</label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant={animation.type === 'fade' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('fade')}
              className="w-full"
            >
              <Eye className="h-3 w-3 mr-1" />
              Fade
            </Button>
            <Button
              size="sm"
              variant={animation.type === 'slide' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('slide')}
              className="w-full"
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              Slide
            </Button>
            <Button
              size="sm"
              variant={animation.type === 'expand' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('expand')}
              className="w-full"
            >
              <Maximize2 className="h-3 w-3 mr-1" />
              Expand
            </Button>
          </div>
        </div>

        {/* Direction (for slide and expand) */}
        {(animation.type === 'slide' || animation.type === 'expand') && (
          <div>
            <label className="text-sm font-medium mb-2 block">Direction</label>
            <div className="grid grid-cols-3 gap-2">
              {(['left', 'right', 'top', 'bottom', 'center'] as const).map((dir) => (
                <Button
                  key={dir}
                  size="sm"
                  variant={animation.direction === dir ? 'default' : 'outline'}
                  onClick={() => handleDirectionChange(dir)}
                  className="capitalize"
                >
                  {directionIcons[dir]}
                  <span className="ml-1">{dir}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Distance (for slide only) */}
        {animation.type === 'slide' && (
          <div>
            <label className="text-sm font-medium mb-2 block">Distance</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant={animation.distance === 'nearby' ? 'default' : 'outline'}
                onClick={() => handleDistanceChange('nearby')}
              >
                Nearby (50px)
              </Button>
              <Button
                size="sm"
                variant={animation.distance === 'edge' ? 'default' : 'outline'}
                onClick={() => handleDistanceChange('edge')}
              >
                Edge (100%)
              </Button>
            </div>
          </div>
        )}

        {/* Duration */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Duration: {animation.duration}ms
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={animation.duration}
            onChange={(e) => handleDurationChange(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Fast (100ms)</span>
            <span>Slow (2000ms)</span>
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            <Settings className="h-3 w-3 mr-1" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
          
          {showAdvanced && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Easing Function</label>
                <select
                  value={animation.easing}
                  onChange={(e) => handleEasingChange(e.target.value)}
                  className="w-full p-2 border border-border rounded text-sm bg-background"
                >
                  <option value="linear">Linear</option>
                  <option value="ease">Ease</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out</option>
                  <option value="ease-in-out">Ease In Out</option>
                  <option value="ease-in-quad">Ease In Quad</option>
                  <option value="ease-out-quad">Ease Out Quad</option>
                  <option value="ease-in-cubic">Ease In Cubic</option>
                  <option value="ease-out-cubic">Ease Out Cubic</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Preset Selector Component
 */
interface PresetSelectorProps {
  onSelectPreset: (preset: AnimationPreset) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelectPreset }) => {
  const presets: Array<{ key: AnimationPreset; data: typeof ANIMATION_PRESETS[AnimationPreset] }> = [
    { key: 'professional', data: ANIMATION_PRESETS.professional },
    { key: 'smooth', data: ANIMATION_PRESETS.smooth },
    { key: 'dynamic', data: ANIMATION_PRESETS.dynamic },
    { key: 'quick', data: ANIMATION_PRESETS.quick },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Animation Presets</CardTitle>
        <CardDescription>Quick start with predefined styles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {presets.map(({ key, data }) => (
          <div
            key={key}
            className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSelectPreset(key)}
          >
            <div className="font-medium text-sm">{data.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

