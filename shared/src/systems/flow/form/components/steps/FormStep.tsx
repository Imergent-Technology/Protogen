/**
 * FormStep - Generic form step for collecting structured data
 */

import React, { useState, useEffect } from 'react';
import { FormStepProps, ValidationError } from '../../types';
import { Input, Label } from '../../../../../components';
import { AlertCircle } from 'lucide-react';

export type FieldType = 'text' | 'email' | 'url' | 'number' | 'textarea' | 'checkbox' | 'select';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>; // For select fields
  autoGenerateFrom?: string; // Auto-generate value from another field (e.g., slug from name)
  autoGenerateTransform?: (value: string) => string;
  min?: number; // For number fields
  max?: number;
  rows?: number; // For textarea
}

export interface FormStepData {
  [key: string]: any;
}

export interface FormStepComponentProps extends FormStepProps<FormStepData> {
  fields: FormField[];
  layout?: 'single' | 'two-column';
}

export const FormStep: React.FC<FormStepComponentProps> = ({
  data,
  onDataChange,
  errors,
  isValidating,
  fields,
  layout = 'single'
}) => {
  const [formData, setFormData] = useState<FormStepData>(data || {});

  // Sync local state when data prop changes (navigation backward/forward)
  useEffect(() => {
    const initialData: FormStepData = {};
    fields.forEach(field => {
      // Use incoming data first, then field default, then appropriate fallback based on type
      if (data?.[field.id] !== undefined) {
        initialData[field.id] = data[field.id];
      } else if (field.defaultValue !== undefined) {
        initialData[field.id] = field.defaultValue;
      } else {
        // Type-appropriate defaults
        initialData[field.id] = field.type === 'checkbox' ? false : '';
      }
    });
    setFormData(initialData);
  }, [data, fields]);

  const handleFieldChange = (fieldId: string, value: any) => {
    const newData = { ...formData, [fieldId]: value };
    setFormData(newData);

    // Auto-generate dependent fields
    fields.forEach(field => {
      if (field.autoGenerateFrom === fieldId && !formData[field.id]) {
        const transform = field.autoGenerateTransform || slugify;
        const generatedValue = transform(value);
        newData[field.id] = generatedValue;
        setFormData(newData);
      }
    });

    // Call onDataChange with the complete updated data
    onDataChange(newData);
  };

  const getFieldError = (fieldId: string): ValidationError | undefined => {
    return errors.find(err => err.field === fieldId);
  };

  const renderField = (field: FormField) => {
    const fieldError = getFieldError(field.id);
    const hasError = !!fieldError;

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <textarea
              id={field.id}
              value={formData[field.id] || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || isValidating}
              rows={field.rows || 3}
              className={`flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${hasError ? 'border-destructive' : 'border-input'}`}
            />
            {field.helperText && !hasError && (
              <p className="text-xs text-muted-foreground">{field.helperText}</p>
            )}
            {hasError && (
              <div className="flex items-center space-x-1 text-destructive text-sm">
                <AlertCircle className="h-3 w-3" />
                <span>{fieldError.message}</span>
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={!!formData[field.id]}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              disabled={field.disabled || isValidating}
              className="text-primary"
            />
            <Label htmlFor={field.id} className="cursor-pointer">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.helperText && (
              <p className="text-xs text-muted-foreground ml-6">{field.helperText}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <select
              id={field.id}
              value={formData[field.id] || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange(field.id, e.target.value)}
              disabled={field.disabled || isValidating}
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                hasError ? 'border-destructive' : 'border-border'
              }`}
            >
              <option value="">Select...</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {field.helperText && !hasError && (
              <p className="text-xs text-muted-foreground">{field.helperText}</p>
            )}
            {hasError && (
              <div className="flex items-center space-x-1 text-destructive text-sm">
                <AlertCircle className="h-3 w-3" />
                <span>{fieldError.message}</span>
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={formData[field.id] || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || isValidating}
              min={field.min}
              max={field.max}
              className={hasError ? 'border-destructive' : ''}
            />
            {field.helperText && !hasError && (
              <p className="text-xs text-muted-foreground">{field.helperText}</p>
            )}
            {hasError && (
              <div className="flex items-center space-x-1 text-destructive text-sm">
                <AlertCircle className="h-3 w-3" />
                <span>{fieldError.message}</span>
              </div>
            )}
          </div>
        );

      default: // text, email, url
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              value={formData[field.id] || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || isValidating}
              className={hasError ? 'border-destructive' : ''}
            />
            {field.helperText && !hasError && (
              <p className="text-xs text-muted-foreground">{field.helperText}</p>
            )}
            {hasError && (
              <div className="flex items-center space-x-1 text-destructive text-sm">
                <AlertCircle className="h-3 w-3" />
                <span>{fieldError.message}</span>
              </div>
            )}
          </div>
        );
    }
  };

  const containerClass = layout === 'two-column'
    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
    : 'space-y-4';

  return (
    <div className={containerClass}>
      {fields.map(field => renderField(field))}
    </div>
  );
};

/**
 * Default slug transformation function
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

