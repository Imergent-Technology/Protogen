import { useState, useEffect, useCallback } from 'react';
// import { apiClient } from '../services/ApiClient'; // Not used in current implementation
// Stage types removed - Stage system has been completely removed

export interface UseApiOptions {
  autoLoad?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

// Stage-related hooks removed - Stage system has been completely removed

export interface UseFeedbackOptions extends UseApiOptions {
  sceneId?: number;
}

export interface UseFeedbackReturn {
  // State
  feedback: any[];
  loading: boolean;
  error: Error | null;
  
  // Actions
  loadFeedback: (sceneIdParam?: number) => Promise<any[]>;
  submitFeedback: (data: any) => Promise<any>;
  
  // Utilities
  clearError: () => void;
  refresh: () => Promise<any[]>;
}

export function useFeedback(options: UseFeedbackOptions = {}): UseFeedbackReturn {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Extract callbacks to avoid dependency issues
  const { sceneId, onSuccess, onError } = options;

  const loadFeedback = useCallback(async (_sceneIdParam?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Note: This will need to be updated when Scene feedback API is implemented
      // const response = await apiClient.getSceneFeedback(sceneIdParam || sceneId!);
      
      // For now, return empty array since Stage feedback API was removed
      const response = { success: true, data: [] };
      
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
  }, [sceneId, onSuccess, onError]);

  const submitFeedback = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Note: This will need to be updated when Scene feedback API is implemented
      // const response = await apiClient.submitFeedback(data);
      
      // For now, return mock data since Stage feedback API was removed
      const response = { success: true, data: { id: Date.now(), ...data } };
      
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

  // Auto-load on mount if requested
  useEffect(() => {
    if (options.autoLoad && sceneId) {
      loadFeedback();
    }
  }, [options.autoLoad, sceneId, loadFeedback]);

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