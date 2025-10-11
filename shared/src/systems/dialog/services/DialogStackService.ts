/**
 * Dialog Stack Service
 * 
 * Manages z-index layering and stacking of dialogs
 */

import { DialogPriority } from '../types';

export class DialogStackService {
  private baseZIndex = 1000;
  private zIndexMap: Map<string, number> = new Map();
  private priorityMultipliers: Record<DialogPriority, number> = {
    low: 0,
    normal: 100,
    high: 200,
    critical: 300
  };

  // Calculate z-index for a dialog
  calculateZIndex(
    stackPosition: number,
    priority: DialogPriority = 'normal'
  ): number {
    const priorityOffset = this.priorityMultipliers[priority];
    return this.baseZIndex + priorityOffset + stackPosition;
  }

  // Get z-index for a dialog ID
  getZIndex(dialogId: string): number | undefined {
    return this.zIndexMap.get(dialogId);
  }

  // Set z-index for a dialog
  setZIndex(dialogId: string, zIndex: number): void {
    this.zIndexMap.set(dialogId, zIndex);
  }

  // Remove z-index mapping
  removeZIndex(dialogId: string): void {
    this.zIndexMap.delete(dialogId);
  }

  // Update z-indices for entire stack
  updateStack(stack: string[], priorityMap: Map<string, DialogPriority>): void {
    stack.forEach((dialogId, index) => {
      const priority = priorityMap.get(dialogId) || 'normal';
      const zIndex = this.calculateZIndex(index, priority);
      this.setZIndex(dialogId, zIndex);
    });
  }

  // Get highest z-index
  getHighestZIndex(): number {
    if (this.zIndexMap.size === 0) {
      return this.baseZIndex;
    }
    return Math.max(...Array.from(this.zIndexMap.values()));
  }

  // Clear all z-indices
  clear(): void {
    this.zIndexMap.clear();
  }
}

// Singleton instance
export const dialogStackService = new DialogStackService();

