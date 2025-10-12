/**
 * SelectionStep - Step for selecting from predefined options
 */

import React, { useState, useEffect } from 'react';
import { FormStepProps } from '../../types';
import { Label } from '../../../../../components';
import { Check } from 'lucide-react';

export interface SelectionOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectionStepData {
  selectedValue?: string;
  selectedValues?: string[]; // For multi-select
}

export interface SelectionStepComponentProps extends FormStepProps<SelectionStepData> {
  options: SelectionOption[];
  mode?: 'single' | 'multi';
  displayMode?: 'radio' | 'card' | 'button';
  label?: string;
  helperText?: string;
}

export const SelectionStep: React.FC<SelectionStepComponentProps> = ({
  data,
  onDataChange,
  errors,
  isValidating,
  options,
  mode = 'single',
  displayMode = 'card',
  label,
  helperText
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(data?.selectedValue || '');
  const [selectedValues, setSelectedValues] = useState<string[]>(data?.selectedValues || []);

  useEffect(() => {
    if (mode === 'single' && data?.selectedValue) {
      setSelectedValue(data.selectedValue);
    } else if (mode === 'multi' && data?.selectedValues) {
      setSelectedValues(data.selectedValues);
    }
  }, [data, mode]);

  const handleSingleSelection = (value: string) => {
    setSelectedValue(value);
    onDataChange({ selectedValue: value });
  };

  const handleMultiSelection = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    setSelectedValues(newSelection);
    onDataChange({ selectedValues: newSelection });
  };

  const isSelected = (value: string): boolean => {
    return mode === 'single'
      ? selectedValue === value
      : selectedValues.includes(value);
  };

  const renderRadioMode = () => (
    <div className="space-y-3">
      {options.map(option => (
        <label
          key={option.value}
          className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            isSelected(option.value)
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/30'
          } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            type={mode === 'single' ? 'radio' : 'checkbox'}
            name="selection"
            value={option.value}
            checked={isSelected(option.value)}
            onChange={() => mode === 'single'
              ? handleSingleSelection(option.value)
              : handleMultiSelection(option.value)
            }
            disabled={option.disabled || isValidating}
            className="mt-1 text-primary"
          />
          <div className="flex-1">
            <div className="font-medium">{option.label}</div>
            {option.description && (
              <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
            )}
          </div>
        </label>
      ))}
    </div>
  );

  const renderCardMode = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map(option => (
        <div
          key={option.value}
          onClick={() => !option.disabled && !isValidating && (
            mode === 'single'
              ? handleSingleSelection(option.value)
              : handleMultiSelection(option.value)
          )}
          className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
            isSelected(option.value)
              ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
              : 'border-border hover:border-primary/50'
          } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSelected(option.value) && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
          
          {option.icon && (
            <div className="mb-3 text-primary">
              {option.icon}
            </div>
          )}
          
          <h4 className="font-semibold mb-1">{option.label}</h4>
          
          {option.description && (
            <p className="text-sm text-muted-foreground">{option.description}</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderButtonMode = () => (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => mode === 'single'
            ? handleSingleSelection(option.value)
            : handleMultiSelection(option.value)
          }
          disabled={option.disabled || isValidating}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            isSelected(option.value)
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background hover:border-primary/50'
          } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {label && (
        <Label className="text-base">{label}</Label>
      )}
      
      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}

      {displayMode === 'radio' && renderRadioMode()}
      {displayMode === 'card' && renderCardMode()}
      {displayMode === 'button' && renderButtonMode()}

      {errors.length > 0 && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
          <ul className="text-sm text-destructive space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

