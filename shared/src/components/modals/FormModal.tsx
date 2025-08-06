import React from 'react';
import { Button } from '../ui/button';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';

interface FormModalProps {
  title: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export function FormModal({
  title,
  description,
  submitText = 'Save',
  cancelText = 'Cancel',
  children,
  onSubmit,
  onClose,
  isSubmitting = false,
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && (
          <DialogDescription>{description}</DialogDescription>
        )}
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="py-4">
          {children}
        </div>
        <DialogFooter className="flex gap-2 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : submitText}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}