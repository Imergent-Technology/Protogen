import { Stage, StageContext, StageType } from '../types/stage';

export interface StageManagerConfig {
  onStageChange?: (stage: Stage, context: StageContext) => void;
  onNavigate?: (path: string, stage?: Stage) => void;
  onError?: (error: Error, stage?: Stage) => void;
}

export interface NavigationEntry {
  id: string;
  stage: Stage;
  context: StageContext;
  path: string;
  timestamp: number;
}

export class StageManager {
  private stages: Map<string, Stage> = new Map();
  private currentStage: Stage | null = null;
  private currentContext: StageContext | null = null;
  private navigationHistory: NavigationEntry[] = [];
  public config: StageManagerConfig;

  constructor(config: StageManagerConfig = {}) {
    this.config = config;
  }

  // Stage Registration
  registerStage(stage: Stage): void {
    const id = stage.id?.toString() || stage.slug;
    this.stages.set(id, stage);
  }

  unregisterStage(stageId: string): void {
    this.stages.delete(stageId);
  }

  getStage(stageId: string): Stage | undefined {
    return this.stages.get(stageId);
  }

  getAllStages(): Stage[] {
    return Array.from(this.stages.values());
  }

  // Stage Navigation
  async navigateToStage(stageId: string, context?: Partial<StageContext>, path?: string): Promise<boolean> {
    try {
      const stage = this.getStage(stageId);
      if (!stage) {
        throw new Error(`Stage not found: ${stageId}`);
      }

      const fullContext: StageContext = {
        stage,
        isAdmin: context?.isAdmin || false,
        isFallback: context?.isFallback || false,
        ...context,
      };

      // Add to navigation history
      const navigationEntry: NavigationEntry = {
        id: Math.random().toString(36).substr(2, 9),
        stage,
        context: fullContext,
        path: path || `/stages/${stageId}`,
        timestamp: Date.now(),
      };

      this.navigationHistory.push(navigationEntry);

      // Update current state
      this.currentStage = stage;
      this.currentContext = fullContext;

      // Notify listeners
      this.config.onStageChange?.(stage, fullContext);
      this.config.onNavigate?.(navigationEntry.path, stage);

      return true;
    } catch (error) {
      this.config.onError?.(error as Error, this.currentStage || undefined);
      return false;
    }
  }

  // Navigation History
  getNavigationHistory(): NavigationEntry[] {
    return [...this.navigationHistory];
  }

  getCurrentStage(): Stage | null {
    return this.currentStage;
  }

  getCurrentContext(): StageContext | null {
    return this.currentContext;
  }

  canGoBack(): boolean {
    return this.navigationHistory.length > 1;
  }

  async goBack(): Promise<boolean> {
    if (!this.canGoBack()) {
      return false;
    }

    // Remove current entry
    this.navigationHistory.pop();
    
    // Get previous entry
    const previousEntry = this.navigationHistory[this.navigationHistory.length - 1];
    
    if (previousEntry) {
      this.currentStage = previousEntry.stage;
      this.currentContext = previousEntry.context;
      
      this.config.onStageChange?.(previousEntry.stage, previousEntry.context);
      this.config.onNavigate?.(previousEntry.path, previousEntry.stage);
      
      return true;
    }
    
    return false;
  }

  // Breadcrumb Support
  getBreadcrumbs(): Array<{ label: string; path: string; stage: Stage }> {
    return this.navigationHistory.map(entry => ({
      label: entry.stage.config.title || entry.stage.name || 'Untitled',
      path: entry.path,
      stage: entry.stage,
    }));
  }

  // Stage Lifecycle
  async createStage(config: {
    id: string;
    type: StageType;
    title: string;
    content?: string;
    icon?: string;
    metadata?: Record<string, any>;
  }): Promise<Stage> {
    const stage: Stage = {
      name: config.title,
      slug: config.id,
      type: config.type,
      config: {
        title: config.title,
        content: config.content || '',
        icon: config.icon,
      },
      metadata: config.metadata || {},
      is_active: true,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.registerStage(stage);
    return stage;
  }

  async updateStage(stageId: string, updates: Partial<Stage>): Promise<boolean> {
    try {
      const stage = this.getStage(stageId);
      if (!stage) {
        throw new Error(`Stage not found: ${stageId}`);
      }

      const updatedStage: Stage = {
        ...stage,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      this.stages.set(stageId, updatedStage);

      // Update current stage if it's the one being updated
      const currentStageId = this.currentStage?.id?.toString() || this.currentStage?.slug;
      if (currentStageId === stageId) {
        this.currentStage = updatedStage;
        this.config.onStageChange?.(updatedStage, this.currentContext!);
      }

      return true;
    } catch (error) {
      this.config.onError?.(error as Error);
      return false;
    }
  }

  async deleteStage(stageId: string): Promise<boolean> {
    try {
      const stage = this.getStage(stageId);
      if (!stage) {
        return false;
      }

      this.unregisterStage(stageId);

      // If we're currently on this stage, navigate away
      const currentStageId = this.currentStage?.id?.toString() || this.currentStage?.slug;
      if (currentStageId === stageId) {
        if (this.canGoBack()) {
          await this.goBack();
        } else {
          this.currentStage = null;
          this.currentContext = null;
        }
      }

      // Remove from navigation history
      this.navigationHistory = this.navigationHistory.filter(
        entry => {
          const entryStageId = entry.stage.id?.toString() || entry.stage.slug;
          return entryStageId !== stageId;
        }
      );

      return true;
    } catch (error) {
      this.config.onError?.(error as Error);
      return false;
    }
  }

  // Utility Methods
  findStagesByType(type: StageType): Stage[] {
    return this.getAllStages().filter(stage => stage.type === type);
  }

  findStagesByTitle(titleQuery: string): Stage[] {
    const query = titleQuery.toLowerCase();
    return this.getAllStages().filter(stage => 
      (stage.config.title || stage.name || '').toLowerCase().includes(query)
    );
  }

  // Reset/Clear
  clear(): void {
    this.stages.clear();
    this.currentStage = null;
    this.currentContext = null;
    this.navigationHistory = [];
  }

  // Export/Import for persistence
  exportState(): {
    stages: Stage[];
    navigationHistory: NavigationEntry[];
    currentStageId: string | null;
  } {
    const currentStageId = this.currentStage?.id?.toString() || this.currentStage?.slug || null;
    return {
      stages: this.getAllStages(),
      navigationHistory: this.navigationHistory,
      currentStageId,
    };
  }

  importState(state: {
    stages: Stage[];
    navigationHistory: NavigationEntry[];
    currentStageId: string | null;
  }): void {
    this.clear();
    
    // Import stages
    state.stages.forEach(stage => this.registerStage(stage));
    
    // Import navigation history
    this.navigationHistory = state.navigationHistory;
    
    // Set current stage
    if (state.currentStageId) {
      this.currentStage = this.getStage(state.currentStageId) || null;
      if (this.currentStage && this.navigationHistory.length > 0) {
        const lastEntry = this.navigationHistory[this.navigationHistory.length - 1];
        this.currentContext = lastEntry.context;
      }
    }
  }
}