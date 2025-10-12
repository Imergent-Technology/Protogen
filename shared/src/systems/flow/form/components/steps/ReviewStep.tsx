/**
 * ReviewStep - Step for reviewing collected data before submission
 */

import React from 'react';
import { FormStepProps } from '../../types';
import { Button } from '../../../../../components';
import { Edit2 } from 'lucide-react';

export interface ReviewSection {
  title: string;
  stepId?: string; // If provided, enables edit button to jump to that step
  items: ReviewItem[];
}

export interface ReviewItem {
  label: string;
  value: any;
  render?: (value: any) => React.ReactNode; // Custom renderer
  hide?: boolean; // Hide sensitive data
}

export interface ReviewStepData {
  [key: string]: any;
}

export interface ReviewStepComponentProps extends FormStepProps<ReviewStepData> {
  sections: ReviewSection[];
  onEditStep?: (stepId: string) => void; // Callback to jump to specific step
  title?: string;
  description?: string;
}

export const ReviewStep: React.FC<ReviewStepComponentProps> = ({
  sections,
  onEditStep,
  title = 'Review Your Information',
  description = 'Please review the information below before submitting.'
}) => {
  const renderValue = (item: ReviewItem): React.ReactNode => {
    if (item.hide) {
      return <span className="text-muted-foreground">••••••••</span>;
    }

    if (item.render) {
      return item.render(item.value);
    }

    // Default rendering based on type
    if (typeof item.value === 'boolean') {
      return item.value ? 'Yes' : 'No';
    }

    if (Array.isArray(item.value)) {
      return item.value.length > 0 
        ? item.value.join(', ')
        : <span className="text-muted-foreground">None</span>;
    }

    if (item.value === null || item.value === undefined || item.value === '') {
      return <span className="text-muted-foreground">Not provided</span>;
    }

    return String(item.value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Review Sections */}
      {sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className="border border-border rounded-lg p-5"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h4 className="font-semibold text-lg">{section.title}</h4>
            {section.stepId && onEditStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(section.stepId!)}
                className="text-primary hover:text-primary/80"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {/* Section Items */}
          <div className="space-y-3">
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="grid grid-cols-1 md:grid-cols-3 gap-2"
              >
                <dt className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="md:col-span-2 text-sm">
                  {renderValue(item)}
                </dd>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Confirmation Message */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-primary/90">
          By proceeding, you confirm that the information above is accurate and complete.
        </p>
      </div>
    </div>
  );
};

