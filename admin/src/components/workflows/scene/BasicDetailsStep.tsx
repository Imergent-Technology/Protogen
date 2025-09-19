import React, { useState, useEffect } from 'react';
import { Input, Label, Textarea, Card, Badge } from '@protogen/shared';
import { SceneType } from '../../../stores/deckStore';
import { SceneTypeManager, SceneType as SceneTypeData } from '@protogen/authoring';

export interface BasicDetailsData {
  name: string;
  slug: string;
  description: string;
  type: SceneType;
  deckIds: string[];
}

export interface BasicDetailsStepProps {
  data: BasicDetailsData;
  onDataChange: (data: BasicDetailsData) => void;
  errors: string[];
  isValidating: boolean;
  availableDecks?: Array<{ id: string; name: string; type: string }>;
}

const BasicDetailsStep: React.FC<BasicDetailsStepProps> = ({
  data,
  onDataChange,
  errors,
  isValidating,
  availableDecks = []
}) => {
  const [showTypeSelection, setShowTypeSelection] = useState(false);


  // Handle field changes
  const handleFieldChange = (field: keyof BasicDetailsData, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  // Handle name blur for slug generation
  const handleNameBlur = () => {
    if (data.name && !data.slug) {
      const slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      onDataChange({ ...data, slug });
    }
  };

  // Handle type selection
  const handleTypeSelection = (typeData: SceneTypeData) => {
    onDataChange({ ...data, type: typeData.id as SceneType });
    setShowTypeSelection(false);
  };

  // Get current type display info
  const getCurrentTypeInfo = () => {
    const typeMap = {
      graph: { name: 'Graph Scene', description: 'Interactive graph visualization with nodes and edges', icon: '📊' },
      card: { name: 'Card Scene', description: 'Card-based presentation with rich media content', icon: '🃏' },
      document: { name: 'Document Scene', description: 'Text-based content with formatting and structure', icon: '📄' },
      dashboard: { name: 'Dashboard Scene', description: 'Custom dashboard with multiple components', icon: '📈' }
    };
    
    return typeMap[data.type] || typeMap.graph;
  };

  const currentTypeInfo = getCurrentTypeInfo();

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        
        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="scene-name">Scene Name *</Label>
            <Input
              id="scene-name"
              value={data.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={handleNameBlur}
              placeholder="Enter scene name"
              className={errors.some(e => e.includes('name')) ? 'border-destructive' : ''}
            />
            {errors.some(e => e.includes('name')) && (
              <p className="text-sm text-destructive mt-1">
                {errors.find(e => e.includes('name'))}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="scene-slug">URL Slug *</Label>
            <Input
              id="scene-slug"
              value={data.slug}
              onChange={(e) => handleFieldChange('slug', e.target.value)}
              placeholder="Auto-generated from name"
              className={errors.some(e => e.includes('slug')) ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL-friendly identifier (auto-generated from name)
            </p>
            {errors.some(e => e.includes('slug')) && (
              <p className="text-sm text-destructive mt-1">
                {errors.find(e => e.includes('slug'))}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="scene-description">Description</Label>
            <Textarea
              id="scene-description"
              value={data.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Enter scene description"
              rows={3}
              className={errors.some(e => e.includes('description')) ? 'border-destructive' : ''}
            />
            {errors.some(e => e.includes('description')) && (
              <p className="text-sm text-destructive mt-1">
                {errors.find(e => e.includes('description'))}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Scene Type Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Scene Type</h3>
        
        {!showTypeSelection ? (
          <div>
            <div 
              className="p-4 border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setShowTypeSelection(true)}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{currentTypeInfo.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium">{currentTypeInfo.name}</h4>
                  <p className="text-sm text-muted-foreground">{currentTypeInfo.description}</p>
                </div>
                <Badge variant="outline">{data.type}</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click to change scene type
            </p>
          </div>
        ) : (
          <div>
            <SceneTypeManager
              availableTypes={[]}
              onCreateScene={handleTypeSelection}
              className="border-0 p-0"
            />
            <div className="mt-4">
              <button
                onClick={() => setShowTypeSelection(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to basic details
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Deck Assignment (Optional) */}
      {availableDecks.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add to Decks (Optional)</h3>
          
          <div>
            <Label htmlFor="scene-decks">Select Decks</Label>
            <select
              id="scene-decks"
              multiple
              value={data.deckIds}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                handleFieldChange('deckIds', selectedOptions);
              }}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {availableDecks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name} ({deck.type})
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Hold Ctrl/Cmd to select multiple decks
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BasicDetailsStep;
