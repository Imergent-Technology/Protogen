import { useState, useEffect, useCallback } from 'react';
import { apiClient, CreateStageRequest, FeedbackData } from '../services/ApiClient';
import { Stage, StageType } from '../types/stage';

export interface UseApiOptions {
  autoLoad?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export interface UseStagesOptions extends UseApiOptions {
  initialParams?: {
    type?: StageType;
    active?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
  };
}

export interface UseStagesReturn {
  // State
  stages: Stage[];
  loading: boolean;
  error: Error | null;
  
  // Actions
  loadStages: (params?: UseStagesOptions['initialParams']) => Promise<Stage[]>;
  createStage: (data: CreateStageRequest) => Promise<Stage>;
  updateStage: (id: number, data: Partial<CreateStageRequest>) => Promise<Stage>;
  deleteStage: (id: number) => Promise<boolean>;
  
  // Utilities
  clearError: () => void;
  refresh: () => Promise<Stage[]>;
}

export function useStages(options: UseStagesOptions = {}): UseStagesReturn {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Extract callbacks to avoid dependency issues
  const { onSuccess, onError, autoLoad, initialParams } = options;

  const loadStages = useCallback(async (params?: UseStagesOptions['initialParams']) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getStages(params);
      
      if (response.success) {
        setStages(response.data);
        onSuccess?.(response.data);
        return response.data;
      } else {
        throw new Error('Failed to load stages');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const createStage = useCallback(async (data: CreateStageRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.createStage(data);
      
      if (response.success) {
        setStages(prev => [...prev, response.data]);
        onSuccess?.(response.data);
        return response.data;
      } else {
        throw new Error('Failed to create stage');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const updateStage = useCallback(async (id: number, data: Partial<CreateStageRequest>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.updateStage(id, data);
      
      if (response.success) {
        setStages(prev => prev.map(stage => 
          stage.id === id ? response.data : stage
        ));
        onSuccess?.(response.data);
        return response.data;
      } else {
        throw new Error('Failed to update stage');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const deleteStage = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.deleteStage(id);
      
      if (response.success) {
        setStages(prev => prev.filter(stage => stage.id !== id));
        onSuccess?.(true);
        return true;
      } else {
        throw new Error('Failed to delete stage');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = useCallback(() => {
    return loadStages(initialParams);
  }, [loadStages, initialParams]);

  // Auto-load on mount if requested
  useEffect(() => {
    if (autoLoad) {
      // Don't pass initialParams on auto-load to prevent infinite loops
      loadStages();
    }
  }, [autoLoad, loadStages]);

  return {
    stages,
    loading,
    error,
    loadStages,
    createStage,
    updateStage,
    deleteStage,
    clearError,
    refresh,
  };
}

export interface UseStageOptions extends UseApiOptions {
  id: number;
}

export interface UseStageReturn {
  // State
  stage: Stage | null;
  loading: boolean;
  error: Error | null;
  
  // Actions
  loadStage: () => Promise<Stage>;
  updateStage: (data: Partial<CreateStageRequest>) => Promise<Stage>;
  
  // Utilities
  clearError: () => void;
  refresh: () => Promise<Stage>;
}

export function useStage(options: UseStageOptions): UseStageReturn {
  const [stage, setStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Extract callbacks to avoid dependency issues
  const { id, onSuccess, onError, autoLoad } = options;

  const loadStage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getStage(id);
      
      if (response.success) {
        setStage(response.data);
        onSuccess?.(response.data);
        return response.data;
      } else {
        throw new Error('Failed to load stage');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [id, onSuccess, onError]);

  const updateStage = useCallback(async (data: Partial<CreateStageRequest>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.updateStage(id, data);
      
      if (response.success) {
        setStage(response.data);
        onSuccess?.(response.data);
        return response.data;
      } else {
        throw new Error('Failed to update stage');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [id, onSuccess, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = useCallback(() => {
    return loadStage();
  }, [loadStage]);

  // Auto-load on mount if requested
  useEffect(() => {
    if (autoLoad) {
      loadStage();
    }
  }, [autoLoad, loadStage]);

  return {
    stage,
    loading,
    error,
    loadStage,
    updateStage,
    clearError,
    refresh,
  };
}

export interface UseFeedbackOptions extends UseApiOptions {
  stageId?: number;
}

export interface UseFeedbackReturn {
  // State
  feedback: any[];
  loading: boolean;
  error: Error | null;
  
  // Actions
  loadFeedback: (stageId?: number) => Promise<any[]>;
  submitFeedback: (data: FeedbackData) => Promise<any>;
  
  // Utilities
  clearError: () => void;
  refresh: () => Promise<any[]>;
}

export function useFeedback(options: UseFeedbackOptions = {}): UseFeedbackReturn {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Extract callbacks to avoid dependency issues
  const { stageId, onSuccess, onError } = options;

  const loadFeedback = useCallback(async (stageIdParam?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getStageFeedback(stageIdParam || stageId!);
      
      if (response.success) {
        setFeedback(response.data);
        onSuccess?.(response.data);
        return response.data;
      } else {
        throw new Error('Failed to load feedback');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stageId, onSuccess, onError]);

  const submitFeedback = useCallback(async (data: FeedbackData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.submitFeedback(data);
      
      if (response.success) {
        setFeedback(prev => [...prev, response.data]);
        onSuccess?.(response.data);
        return response.data;
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = useCallback(() => {
    return loadFeedback();
  }, [loadFeedback]);

  return {
    feedback,
    loading,
    error,
    loadFeedback,
    submitFeedback,
    clearError,
    refresh,
  };
} 