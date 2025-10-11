import { useState, useCallback, useMemo } from 'react';
import { SceneData, ValidationResult, ValidationError } from '../types';

/**
 * Hook for scene validation
 */
export const useSceneValidation = <T extends SceneData>(scene: T) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });
  
  // Validate scene data
  const validateScene = useCallback(async (sceneData: T): Promise<ValidationResult> => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // Basic validation
    if (!sceneData.name || sceneData.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Scene name is required',
        code: 'REQUIRED'
      });
    }
    
    if (sceneData.name && sceneData.name.length > 100) {
      errors.push({
        field: 'name',
        message: 'Scene name must be less than 100 characters',
        code: 'MAX_LENGTH'
      });
    }
    
    if (sceneData.name && sceneData.name.length < 3) {
      warnings.push({
        field: 'name',
        message: 'Scene name is very short',
        code: 'MIN_LENGTH'
      });
    }
    
    // Description validation
    if (sceneData.description && sceneData.description.length > 500) {
      errors.push({
        field: 'description',
        message: 'Description must be less than 500 characters',
        code: 'MAX_LENGTH'
      });
    }
    
    // Metadata validation
    if (sceneData.metadata.title && sceneData.metadata.title.length > 200) {
      errors.push({
        field: 'metadata.title',
        message: 'Title must be less than 200 characters',
        code: 'MAX_LENGTH'
      });
    }
    
    if (sceneData.metadata.tags && sceneData.metadata.tags.length > 10) {
      warnings.push({
        field: 'metadata.tags',
        message: 'Too many tags (more than 10)',
        code: 'MAX_COUNT'
      });
    }
    
    // Type-specific validation
    switch (sceneData.type) {
      case 'card':
        if ('slides' in sceneData) {
          if (!sceneData.slides || sceneData.slides.length === 0) {
            warnings.push({
              field: 'slides',
              message: 'Card scene has no slides',
              code: 'NO_SLIDES'
            });
          } else {
            // Validate each slide
            sceneData.slides.forEach((slide, index) => {
              if (!slide.id) {
                errors.push({
                  field: `slides[${index}].id`,
                  message: 'Slide ID is required',
                  code: 'REQUIRED'
                });
              }
              
              if (slide.text.content.length > 1000) {
                warnings.push({
                  field: `slides[${index}].text.content`,
                  message: 'Slide text is very long',
                  code: 'MAX_LENGTH'
                });
              }
            });
          }
        }
        break;
        
      case 'graph':
        if ('nodes' in sceneData) {
          if (!sceneData.nodes || sceneData.nodes.length === 0) {
            warnings.push({
              field: 'nodes',
              message: 'Graph scene has no nodes',
              code: 'NO_NODES'
            });
          }
          
          if ('edges' in sceneData && sceneData.edges) {
            // Validate edges
            sceneData.edges.forEach((edge, index) => {
              if (!edge.id) {
                errors.push({
                  field: `edges[${index}].id`,
                  message: 'Edge ID is required',
                  code: 'REQUIRED'
                });
              }
              
              if (!edge.source || !edge.target) {
                errors.push({
                  field: `edges[${index}]`,
                  message: 'Edge source and target are required',
                  code: 'REQUIRED'
                });
              }
            });
          }
        }
        break;
        
      case 'document':
        if ('content' in sceneData) {
          if (!sceneData.content.html || sceneData.content.html.trim().length === 0) {
            warnings.push({
              field: 'content.html',
              message: 'Document scene has no content',
              code: 'NO_CONTENT'
            });
          }
          
          if (sceneData.content.html && sceneData.content.html.length > 50000) {
            warnings.push({
              field: 'content.html',
              message: 'Document content is very long',
              code: 'MAX_LENGTH'
            });
          }
          
          // Validate media
          if (sceneData.content.media) {
            sceneData.content.media.forEach((media, index) => {
              if (!media.id) {
                errors.push({
                  field: `content.media[${index}].id`,
                  message: 'Media ID is required',
                  code: 'REQUIRED'
                });
              }
              
              if (!media.url) {
                errors.push({
                  field: `content.media[${index}].url`,
                  message: 'Media URL is required',
                  code: 'REQUIRED'
                });
              }
            });
          }
          
          // Validate links
          if (sceneData.content.links) {
            sceneData.content.links.forEach((link, index) => {
              if (!link.id) {
                errors.push({
                  field: `content.links[${index}].id`,
                  message: 'Link ID is required',
                  code: 'REQUIRED'
                });
              }
              
              if (!link.text) {
                errors.push({
                  field: `content.links[${index}].text`,
                  message: 'Link text is required',
                  code: 'REQUIRED'
                });
              }
            });
          }
        }
        break;
        
      case 'dashboard':
        if ('widgets' in sceneData) {
          if (!sceneData.widgets || sceneData.widgets.length === 0) {
            warnings.push({
              field: 'widgets',
              message: 'Dashboard scene has no widgets',
              code: 'NO_WIDGETS'
            });
          } else {
            // Validate widgets
            sceneData.widgets.forEach((widget, index) => {
              if (!widget.id) {
                errors.push({
                  field: `widgets[${index}].id`,
                  message: 'Widget ID is required',
                  code: 'REQUIRED'
                });
              }
              
              if (!widget.type) {
                errors.push({
                  field: `widgets[${index}].type`,
                  message: 'Widget type is required',
                  code: 'REQUIRED'
                });
              }
            });
          }
        }
        break;
    }
    
    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };
    
    setValidationResult(result);
    return result;
  }, []);
  
  // Validate specific field
  const validateField = useCallback((field: string, value: any): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) {
          errors.push({
            field: 'name',
            message: 'Scene name is required',
            code: 'REQUIRED'
          });
        } else if (value.length > 100) {
          errors.push({
            field: 'name',
            message: 'Scene name must be less than 100 characters',
            code: 'MAX_LENGTH'
          });
        }
        break;
        
      case 'description':
        if (value && value.length > 500) {
          errors.push({
            field: 'description',
            message: 'Description must be less than 500 characters',
            code: 'MAX_LENGTH'
          });
        }
        break;
        
      case 'metadata.title':
        if (value && value.length > 200) {
          errors.push({
            field: 'metadata.title',
            message: 'Title must be less than 200 characters',
            code: 'MAX_LENGTH'
          });
        }
        break;
        
      case 'metadata.tags':
        if (value && value.length > 10) {
          errors.push({
            field: 'metadata.tags',
            message: 'Too many tags (more than 10)',
            code: 'MAX_COUNT'
          });
        }
        break;
    }
    
    return errors;
  }, []);
  
  // Get validation status for a field
  const getFieldValidation = useCallback((field: string) => {
    const fieldErrors = validationResult.errors.filter(error => error.field === field);
    const fieldWarnings = validationResult.warnings.filter(warning => warning.field === field);
    
    return {
      hasErrors: fieldErrors.length > 0,
      hasWarnings: fieldWarnings.length > 0,
      errors: fieldErrors,
      warnings: fieldWarnings,
      isValid: fieldErrors.length === 0
    };
  }, [validationResult]);
  
  // Check if scene is valid
  const isValid = validationResult.isValid;
  
  // Get error count
  const errorCount = validationResult.errors.length;
  
  // Get warning count
  const warningCount = validationResult.warnings.length;
  
  // Get validation summary
  const validationSummary = useMemo(() => {
    return {
      isValid,
      errorCount,
      warningCount,
      hasErrors: errorCount > 0,
      hasWarnings: warningCount > 0,
      canSave: isValid,
      canPreview: errorCount === 0
    };
  }, [isValid, errorCount, warningCount]);
  
  return {
    validationResult,
    validateScene,
    validateField,
    getFieldValidation,
    isValid,
    errorCount,
    warningCount,
    validationSummary
  };
};
