import React, { useState, useEffect } from 'react';
import { Input } from '@protogen/shared';
import { DeckType } from '../../../stores/deckStore';

export interface DeckDetailsStepProps {
  data: {
    name: string;
    slug: string;
    description: string;
    type: DeckType;
    keepWarm: boolean;
    preloadStrategy: string;
  };
  onDataChange: (data: any) => void;
  onNext: () => void;
  onSave: () => void;
  isValidating: boolean;
}

const DeckDetailsStep: React.FC<DeckDetailsStepProps> = ({
  data,
  onDataChange,
  onNext,
  onSave,
  isValidating
}) => {
  const [formData, setFormData] = useState({
    ...data,
    type: 'graph' // Default type, will be auto-determined based on scenes
  });

  // Update form data when props change
  useEffect(() => {
    setFormData({
      ...data,
      type: 'graph' // Default type, will be auto-determined based on scenes
    });
  }, [data]);

  const handleFieldChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  const handleNameBlur = () => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      handleFieldChange('slug', slug);
    }
  };


  const preloadStrategies = [
    { value: 'proximity', label: 'Proximity', description: 'Load scenes based on user proximity' },
    { value: 'priority', label: 'Priority', description: 'Load scenes based on priority order' },
    { value: 'manual', label: 'Manual', description: 'Load scenes only when requested' }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Deck Name *
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={handleNameBlur}
            placeholder="Enter deck name"
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-2">
            URL Slug *
          </label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleFieldChange('slug', e.target.value)}
            placeholder="url-friendly-slug"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Used in URLs. Auto-generated from name if left empty.
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Describe what this deck contains..."
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="p-4 bg-muted/50 border border-border rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <h3 className="font-medium">Deck Type</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Deck type is automatically determined based on the scenes it contains. 
            Single scene type = that type, multiple types = hybrid.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Preload Strategy
          </label>
          <div className="space-y-2">
            {preloadStrategies.map((strategy) => (
              <div
                key={strategy.value}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.preloadStrategy === strategy.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
                onClick={() => handleFieldChange('preloadStrategy', strategy.value)}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="preloadStrategy"
                    value={strategy.value}
                    checked={formData.preloadStrategy === strategy.value}
                    onChange={() => handleFieldChange('preloadStrategy', strategy.value)}
                    className="text-primary"
                  />
                  <div>
                    <div className="font-medium">{strategy.label}</div>
                    <div className="text-sm text-muted-foreground">{strategy.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="keepWarm"
            checked={formData.keepWarm}
            onChange={(e) => handleFieldChange('keepWarm', e.target.checked)}
            className="text-primary"
          />
          <label htmlFor="keepWarm" className="text-sm font-medium">
            Keep scenes warm in memory
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Keep frequently accessed scenes loaded in memory for faster performance.
        </p>
      </div>
    </div>
  );
};

export default DeckDetailsStep;
