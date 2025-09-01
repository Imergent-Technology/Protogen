import { useState } from 'react';
import { Stage, DocumentStageConfig } from '@progress/shared';
import { Button } from '@progress/shared';
import { 
  FileText, 
  Columns, 
  Save, 
  History, 
  Printer,
  Settings
} from 'lucide-react';

interface DocumentStageConfigProps {
  stage: Stage;
  onConfigChange: (config: DocumentStageConfig) => void;
  className?: string;
}

const LAYOUT_OPTIONS = [
  { value: 'single', label: 'Single Column', icon: FileText },
  { value: 'two-column', label: 'Two Column', icon: Columns },
  { value: 'custom', label: 'Custom', icon: Settings }
];

const THEME_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'professional', label: 'Professional' },
  { value: 'creative', label: 'Creative' }
];

export function DocumentStageConfig({
  stage,
  onConfigChange,
  className = ''
}: DocumentStageConfigProps) {
  const config = stage.config as DocumentStageConfig;
  
  const [layout, setLayout] = useState(config.layout || 'single');
  const [theme, setTheme] = useState(config.theme || 'default');
  const [autoSave, setAutoSave] = useState(config.autoSave !== false);
  const [versioning, setVersioning] = useState(config.versioning !== false);
  const [printEnabled, setPrintEnabled] = useState(config.printEnabled !== false);

  const handleConfigUpdate = () => {
    const updatedConfig: DocumentStageConfig = {
      ...config,
      layout,
      theme,
      autoSave,
      versioning,
      printEnabled
    };
    onConfigChange(updatedConfig);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2 text-lg font-semibold">
        <FileText className="h-5 w-5" />
        Document Settings
      </div>

      {/* Layout Settings */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Layout</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {LAYOUT_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setLayout(option.value as any)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  layout === option.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon className="h-5 w-5 mb-2" />
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Settings */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full p-2 border border-border rounded-md bg-background"
        >
          {THEME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Behavior Settings */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Behavior</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="rounded border-border"
            />
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span className="text-sm">Auto-save changes</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={versioning}
              onChange={(e) => setVersioning(e.target.checked)}
              className="rounded border-border"
            />
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="text-sm">Enable version history</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={printEnabled}
              onChange={(e) => setPrintEnabled(e.target.checked)}
              className="rounded border-border"
            />
            <div className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              <span className="text-sm">Enable print/export</span>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleConfigUpdate}
        className="w-full"
        size="sm"
      >
        <Save className="h-4 w-4 mr-2" />
        Update Document Settings
      </Button>
    </div>
  );
}
