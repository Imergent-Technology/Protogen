import { createContext, useContext, useEffect, useState } from 'react';
import { StageManager, StageManagerConfig } from '../services/StageManager';
import { Stage, StageContext } from '../types/stage';

interface StageManagerContextValue {
  stageManager: StageManager;
  currentStage: Stage | null;
  currentContext: StageContext | null;
  navigationHistory: Array<{ label: string; path: string; stage: Stage }>;
  canGoBack: boolean;
  navigateToStage: (stageId: string, context?: Partial<StageContext>, path?: string) => Promise<boolean>;
  goBack: () => Promise<boolean>;
  createStage: StageManager['createStage'];
  updateStage: StageManager['updateStage'];
  deleteStage: StageManager['deleteStage'];
}

const StageManagerContext = createContext<StageManagerContextValue | null>(null);

export function useStageManager() {
  const context = useContext(StageManagerContext);
  if (!context) {
    throw new Error('useStageManager must be used within a StageManagerProvider');
  }
  return context;
}

interface StageManagerProviderProps {
  children: React.ReactNode;
  config?: StageManagerConfig;
  onStageChange?: (stage: Stage, context: StageContext) => void;
  onNavigate?: (path: string, stage?: Stage) => void;
  onError?: (error: Error, stage?: Stage) => void;
}

export function StageManagerProvider({ 
  children, 
  config = {},
  onStageChange,
  onNavigate,
  onError
}: StageManagerProviderProps) {
  const [stageManager] = useState(() => new StageManager({
    ...config,
    onStageChange,
    onNavigate,
    onError,
  }));
  
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const [currentContext, setCurrentContext] = useState<StageContext | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<Array<{ label: string; path: string; stage: Stage }>>([]);
  const [canGoBack, setCanGoBack] = useState(false);

  // Update state when stage manager changes
  useEffect(() => {
    const updateState = () => {
      setCurrentStage(stageManager.getCurrentStage());
      setCurrentContext(stageManager.getCurrentContext());
      setNavigationHistory(stageManager.getBreadcrumbs());
      setCanGoBack(stageManager.canGoBack());
    };

    // Initial state
    updateState();

    // Override config callbacks to update React state
    const originalConfig = { ...config };
    stageManager['config'] = {
      ...originalConfig,
      onStageChange: (stage: Stage, context: StageContext) => {
        updateState();
        onStageChange?.(stage, context);
        originalConfig.onStageChange?.(stage, context);
      },
      onNavigate: (path: string, stage?: Stage) => {
        updateState();
        onNavigate?.(path, stage);
        originalConfig.onNavigate?.(path, stage);
      },
      onError: (error: Error, stage?: Stage) => {
        updateState();
        onError?.(error, stage);
        originalConfig.onError?.(error, stage);
      },
    };
  }, [stageManager, config, onStageChange, onNavigate, onError]);

  const value: StageManagerContextValue = {
    stageManager,
    currentStage,
    currentContext,
    navigationHistory,
    canGoBack,
    navigateToStage: stageManager.navigateToStage.bind(stageManager),
    goBack: stageManager.goBack.bind(stageManager),
    createStage: stageManager.createStage.bind(stageManager),
    updateStage: stageManager.updateStage.bind(stageManager),
    deleteStage: stageManager.deleteStage.bind(stageManager),
  };

  return (
    <StageManagerContext.Provider value={value}>
      {children}
    </StageManagerContext.Provider>
  );
}