import { useState, useCallback, useEffect } from 'react';
import { SceneData, AuthoringState, ValidationResult, AuthoringEvent, AuthoringEventHandler } from '../types';
import { useAuthoringPermissions } from './useAuthoringPermissions';

/**
 * Hook for managing scene authoring state and operations
 */
export const useSceneAuthoring = <T extends SceneData>(
  initialScene?: T,
  onEvent?: AuthoringEventHandler
) => {
  const [scene, setScene] = useState<T | undefined>(initialScene);
  const [state, setState] = useState<AuthoringState>({
    isDirty: false,
    isSaving: false,
    isPreviewing: false,
    errors: [],
    warnings: []
  });
  
  const permissions = useAuthoringPermissions();
  
  // Update scene data
  const updateScene = useCallback((updates: Partial<T>) => {
    setScene(prev => prev ? { ...prev, ...updates } : undefined);
    setState(prev => ({ ...prev, isDirty: true }));
    
    onEvent?.({
      type: 'dirty',
      data: updates,
      timestamp: Date.now()
    });
  }, [onEvent]);
  
  // Save scene
  const saveScene = useCallback(async (sceneData: T) => {
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      // Validate scene data
      const validation = await validateScene(sceneData);
      
      if (!validation.isValid) {
        setState(prev => ({ 
          ...prev, 
          isSaving: false, 
          errors: validation.errors,
          warnings: validation.warnings
        }));
        return false;
      }
      
      // Save scene (this would call the actual save function)
      // await saveSceneToAPI(sceneData);
      
      setScene(sceneData);
      setState(prev => ({ 
        ...prev, 
        isSaving: false, 
        isDirty: false,
        errors: [],
        warnings: []
      }));
      
      onEvent?.({
        type: 'save',
        data: sceneData,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Save failed',
          code: 'SAVE_ERROR'
        }]
      }));
      
      onEvent?.({
        type: 'error',
        data: { error },
        timestamp: Date.now()
      });
      
      return false;
    }
  }, [onEvent]);
  
  // Preview scene
  const previewScene = useCallback(async (sceneData: T) => {
    setState(prev => ({ ...prev, isPreviewing: true }));
    
    try {
      // Validate scene data
      const validation = await validateScene(sceneData);
      
      if (!validation.isValid) {
        setState(prev => ({ 
          ...prev, 
          isPreviewing: false,
          errors: validation.errors,
          warnings: validation.warnings
        }));
        return false;
      }
      
      // Preview scene (this would call the actual preview function)
      // await previewSceneAPI(sceneData);
      
      setState(prev => ({ ...prev, isPreviewing: false }));
      
      onEvent?.({
        type: 'preview',
        data: sceneData,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isPreviewing: false,
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Preview failed',
          code: 'PREVIEW_ERROR'
        }]
      }));
      
      onEvent?.({
        type: 'error',
        data: { error },
        timestamp: Date.now()
      });
      
      return false;
    }
  }, [onEvent]);
  
  // Cancel editing
  const cancelEditing = useCallback(() => {
    setScene(initialScene);
    setState({
      isDirty: false,
      isSaving: false,
      isPreviewing: false,
      errors: [],
      warnings: []
    });
    
    onEvent?.({
      type: 'cancel',
      timestamp: Date.now()
    });
  }, [initialScene, onEvent]);
  
  // Reset to clean state
  const resetToClean = useCallback(() => {
    setState(prev => ({ ...prev, isDirty: false }));
    
    onEvent?.({
      type: 'clean',
      timestamp: Date.now()
    });
  }, [onEvent]);
  
  // Check if user can perform action
  const canPerformAction = useCallback((action: string, sceneType?: string) => {
    switch (action) {
      case 'create':
        return sceneType ? permissions.canCreateScene(sceneType) : false;
      case 'edit':
        return scene ? permissions.canEditScene(scene.id || '', scene.type) : false;
      case 'delete':
        return scene ? permissions.canDeleteScene(scene.id || '') : false;
      case 'preview':
        return true; // Everyone can preview
      case 'save':
        return scene ? permissions.canEditScene(scene.id || '', scene.type) : false;
      default:
        return false;
    }
  }, [permissions, scene]);
  
  return {
    scene,
    state,
    permissions,
    updateScene,
    saveScene,
    previewScene,
    cancelEditing,
    resetToClean,
    canPerformAction
  };
};

/**
 * Validate scene data
 */
const validateScene = async <T extends SceneData>(scene: T): Promise<ValidationResult> => {
  const errors: Array<{ field: string; message: string; code: string }> = [];
  const warnings: Array<{ field: string; message: string; code: string }> = [];
  
  // Basic validation
  if (!scene.name || scene.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Scene name is required',
      code: 'REQUIRED'
    });
  }
  
  if (scene.name && scene.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Scene name must be less than 100 characters',
      code: 'MAX_LENGTH'
    });
  }
  
  // Type-specific validation
  switch (scene.type) {
    case 'card':
      if ('slides' in scene && (!scene.slides || scene.slides.length === 0)) {
        warnings.push({
          field: 'slides',
          message: 'Card scene has no slides',
          code: 'NO_SLIDES'
        });
      }
      break;
      
    case 'graph':
      if ('nodes' in scene && (!scene.nodes || scene.nodes.length === 0)) {
        warnings.push({
          field: 'nodes',
          message: 'Graph scene has no nodes',
          code: 'NO_NODES'
        });
      }
      break;
      
    case 'document':
      if ('content' in scene && (!scene.content.html || scene.content.html.trim().length === 0)) {
        warnings.push({
          field: 'content',
          message: 'Document scene has no content',
          code: 'NO_CONTENT'
        });
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
