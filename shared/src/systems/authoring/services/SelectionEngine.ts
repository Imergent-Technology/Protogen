/**
 * SelectionEngine - M1 Week 3-4
 * 
 * Manages selection state for authoring mode.
 * Supports single and multi-selection.
 * Integrates with Navigator selection state.
 * 
 * Based on Spec 04: Authoring Overlay Framework
 */

import { navigatorSystem } from '../../navigator/NavigatorSystem';
import type { SelectionState as NavSelectionState, ItemType } from '../../navigator/types';

export interface HitTestResult {
  targetType: ItemType;
  targetId: string;
  bounds: DOMRect;
  element: HTMLElement;
  metadata: Record<string, any>;
}

export interface SelectionState {
  targetType: ItemType;
  targetId: string;
  bounds: DOMRect;
  metadata: Record<string, any>;
  selected: boolean;
  timestamp: number;
}

export type SelectionMode = 'single' | 'multi';

export interface SelectionChangedPayload {
  selection: SelectionState | null;
  multiSelection: SelectionState[];
  mode: SelectionMode;
  timestamp: number;
}

export class SelectionEngine {
  private static instance: SelectionEngine;
  private currentSelection: SelectionState | null = null;
  private multiSelection: Map<string, SelectionState> = new Map();
  private mode: SelectionMode = 'single';
  private eventHandlers: Map<string, Function[]> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  // ============================================================================
  // Singleton Pattern
  // ============================================================================

  static getInstance(): SelectionEngine {
    if (!SelectionEngine.instance) {
      SelectionEngine.instance = new SelectionEngine();
    }
    return SelectionEngine.instance;
  }

  // ============================================================================
  // Selection Management
  // ============================================================================

  select(target: HitTestResult): void {
    const selectionState: SelectionState = {
      targetType: target.targetType,
      targetId: target.targetId,
      bounds: target.bounds,
      metadata: target.metadata,
      selected: true,
      timestamp: Date.now()
    };

    if (this.mode === 'single') {
      // Clear existing selection
      this.currentSelection = selectionState;
      this.multiSelection.clear();
    } else {
      // Multi-select mode
      this.currentSelection = selectionState;
      this.multiSelection.set(target.targetId, selectionState);
    }

    // Sync with Navigator
    this.syncToNavigator();

    // Emit event
    this.emitSelectionChanged();
  }

  deselect(): void {
    this.currentSelection = null;
    this.multiSelection.clear();

    // Sync with Navigator
    navigatorSystem.clearSelection();

    // Emit event
    this.emitSelectionChanged();
  }

  isSelected(targetId: string): boolean {
    if (this.mode === 'single') {
      return this.currentSelection?.targetId === targetId;
    } else {
      return this.multiSelection.has(targetId);
    }
  }

  getSelection(): SelectionState | null {
    return this.currentSelection;
  }

  // ============================================================================
  // Multi-Selection
  // ============================================================================

  addToSelection(target: HitTestResult): void {
    if (this.mode !== 'multi') {
      console.warn('Cannot add to selection in single-select mode');
      return;
    }

    const selectionState: SelectionState = {
      targetType: target.targetType,
      targetId: target.targetId,
      bounds: target.bounds,
      metadata: target.metadata,
      selected: true,
      timestamp: Date.now()
    };

    this.multiSelection.set(target.targetId, selectionState);

    // Update current selection to last added
    this.currentSelection = selectionState;

    // Sync with Navigator
    this.syncToNavigator();

    // Emit event
    this.emitSelectionChanged();
  }

  removeFromSelection(targetId: string): void {
    if (this.mode !== 'multi') {
      console.warn('Cannot remove from selection in single-select mode');
      return;
    }

    this.multiSelection.delete(targetId);

    // Update current selection
    if (this.currentSelection?.targetId === targetId) {
      // Set to last remaining item or null
      const remaining = Array.from(this.multiSelection.values());
      this.currentSelection = remaining[remaining.length - 1] || null;
    }

    // Sync with Navigator
    this.syncToNavigator();

    // Emit event
    this.emitSelectionChanged();
  }

  getMultiSelection(): SelectionState[] {
    return Array.from(this.multiSelection.values());
  }

  clearMultiSelection(): void {
    this.multiSelection.clear();
    this.currentSelection = null;

    // Sync with Navigator
    navigatorSystem.clearSelection();

    // Emit event
    this.emitSelectionChanged();
  }

  getSelectionCount(): number {
    if (this.mode === 'single') {
      return this.currentSelection ? 1 : 0;
    } else {
      return this.multiSelection.size;
    }
  }

  // ============================================================================
  // Selection Modes
  // ============================================================================

  setMode(mode: SelectionMode): void {
    const previousMode = this.mode;
    this.mode = mode;

    // When switching to single mode, keep only current selection
    if (mode === 'single' && this.multiSelection.size > 0) {
      this.multiSelection.clear();
      if (this.currentSelection) {
        // Keep only the current selection
        this.multiSelection.set(this.currentSelection.targetId, this.currentSelection);
      }
    }

    this.emit('mode-changed', {
      previousMode,
      currentMode: mode,
      timestamp: Date.now()
    });

    // Re-sync with Navigator
    this.syncToNavigator();
  }

  getMode(): SelectionMode {
    return this.mode;
  }

  // ============================================================================
  // Navigator Integration
  // ============================================================================

  private syncToNavigator(): void {
    if (!this.currentSelection) {
      navigatorSystem.clearSelection();
      return;
    }

    const navSelection: NavSelectionState = {
      targetId: this.currentSelection.targetId,
      targetType: this.currentSelection.targetType,
      multi: this.mode === 'multi' && this.multiSelection.size > 1,
      selectedIds: this.mode === 'multi'
        ? Array.from(this.multiSelection.keys())
        : undefined
    };

    navigatorSystem.updateSelection(navSelection);
  }

  // ============================================================================
  // Keyboard Selection Helpers
  // ============================================================================

  selectNext(currentTargetId: string, availableTargets: HitTestResult[]): void {
    const currentIndex = availableTargets.findIndex(t => t.targetId === currentTargetId);
    if (currentIndex === -1 || currentIndex === availableTargets.length - 1) {
      return; // Not found or already at end
    }

    const nextTarget = availableTargets[currentIndex + 1];
    this.select(nextTarget);
  }

  selectPrevious(currentTargetId: string, availableTargets: HitTestResult[]): void {
    const currentIndex = availableTargets.findIndex(t => t.targetId === currentTargetId);
    if (currentIndex <= 0) {
      return; // Not found or already at start
    }

    const prevTarget = availableTargets[currentIndex - 1];
    this.select(prevTarget);
  }

  selectAll(targets: HitTestResult[]): void {
    if (this.mode !== 'multi') {
      console.warn('Cannot select all in single-select mode');
      return;
    }

    this.multiSelection.clear();

    targets.forEach(target => {
      const selectionState: SelectionState = {
        targetType: target.targetType,
        targetId: target.targetId,
        bounds: target.bounds,
        metadata: target.metadata,
        selected: true,
        timestamp: Date.now()
      };
      this.multiSelection.set(target.targetId, selectionState);
    });

    // Set current to last
    if (targets.length > 0) {
      const lastTarget = targets[targets.length - 1];
      this.currentSelection = this.multiSelection.get(lastTarget.targetId) || null;
    }

    // Sync with Navigator
    this.syncToNavigator();

    // Emit event
    this.emitSelectionChanged();
  }

  // ============================================================================
  // Event System
  // ============================================================================

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, payload: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  private emitSelectionChanged(): void {
    const payload: SelectionChangedPayload = {
      selection: this.currentSelection,
      multiSelection: this.getMultiSelection(),
      mode: this.mode,
      timestamp: Date.now()
    };

    this.emit('selection-changed', payload);
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  getSelectedIds(): string[] {
    if (this.mode === 'single') {
      return this.currentSelection ? [this.currentSelection.targetId] : [];
    } else {
      return Array.from(this.multiSelection.keys());
    }
  }

  hasSelection(): boolean {
    return this.currentSelection !== null;
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  reset(): void {
    this.currentSelection = null;
    this.multiSelection.clear();
    this.mode = 'single';
    navigatorSystem.clearSelection();
    this.emitSelectionChanged();
  }
}

// Export singleton instance
export const selectionEngine = SelectionEngine.getInstance();

