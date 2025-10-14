/**
 * PreviewQueue - M1 Week 5
 * 
 * Queue for preview generation requests with:
 * - Priority ordering (high > normal > low)
 * - Debouncing (avoid duplicate requests)
 * - Concurrency control (max 2 concurrent generations)
 * 
 * Based on Spec 07: Preview Service Specification
 */

import { ThumbnailGenerator } from './ThumbnailGenerator';
import type { QueueItem, PreviewPriority } from '../types/preview';

export class PreviewQueue {
  private static instance: PreviewQueue;
  private queue: QueueItem[] = [];
  private processing = false;
  private concurrent = 0;
  private maxConcurrent = 2;
  private debounceMs = 300;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private generator: ThumbnailGenerator;
  private eventHandlers: Map<string, Function[]> = new Map();

  private constructor() {
    this.generator = ThumbnailGenerator.getInstance();
  }

  // ============================================================================
  // Singleton Pattern
  // ============================================================================

  static getInstance(): PreviewQueue {
    if (!PreviewQueue.instance) {
      PreviewQueue.instance = new PreviewQueue();
    }
    return PreviewQueue.instance;
  }

  // ============================================================================
  // Queue Management
  // ============================================================================

  async enqueue(item: QueueItem): Promise<string> {
    const key = this.getItemKey(item);

    // Debounce: Cancel previous request for same key
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }

    return new Promise((resolve, reject) => {
      // Debounce timer
      const timer = setTimeout(async () => {
        this.debounceTimers.delete(key);

        // Check if already in queue
        const existing = this.queue.find(q => this.getItemKey(q) === key);
        if (existing) {
          // Update priority if higher
          if (this.getPriorityValue(item.priority) > this.getPriorityValue(existing.priority)) {
            existing.priority = item.priority;
            this.sortQueue();
          }
          return;
        }

        // Add to queue
        item.addedAt = Date.now();
        item.attempts = 0;
        this.queue.push(item);

        // Sort by priority
        this.sortQueue();

        // Emit queued event
        this.emit('queue-added', { item, queueSize: this.queue.length });

        // Start processing
        this.processQueue().then(() => {
          resolve(this.getResult(item));
        }).catch(error => {
          reject(error);
        });
      }, this.debounceMs);

      this.debounceTimers.set(key, timer);
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.concurrent >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.concurrent < this.maxConcurrent) {
      const item = this.queue.shift();
      if (!item) break;

      this.concurrent++;

      // Process item
      this.processItem(item)
        .then(() => {
          this.concurrent--;
          this.emit('queue-processed', { item, remaining: this.queue.length });

          // Continue processing
          if (this.queue.length > 0) {
            this.processQueue();
          }
        })
        .catch(error => {
          this.concurrent--;
          this.emit('queue-error', { item, error });

          // Retry or fail
          if (item.attempts! < 3) {
            item.attempts!++;
            this.queue.push(item);
            this.sortQueue();
          }

          // Continue processing
          if (this.queue.length > 0) {
            this.processQueue();
          }
        });
    }

    this.processing = false;
  }

  private async processItem(item: QueueItem): Promise<void> {
    const dataUrl = await this.generator.generate(
      item.target,
      item.size,
      item.options
    );

    // Store result for retrieval
    this.storeResult(item, dataUrl);
  }

  // ============================================================================
  // Priority Sorting
  // ============================================================================

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // Sort by priority (high to low)
      const priorityDiff = this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority);
      if (priorityDiff !== 0) return priorityDiff;

      // Then by age (older first)
      return (a.addedAt || 0) - (b.addedAt || 0);
    });
  }

  private getPriorityValue(priority: PreviewPriority): number {
    switch (priority) {
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  // ============================================================================
  // Results Storage
  // ============================================================================

  private results: Map<string, string> = new Map();

  private storeResult(item: QueueItem, dataUrl: string): void {
    const key = this.getItemKey(item);
    this.results.set(key, dataUrl);

    // Clean up old results after 5 minutes
    setTimeout(() => {
      this.results.delete(key);
    }, 5 * 60 * 1000);
  }

  private getResult(item: QueueItem): string {
    const key = this.getItemKey(item);
    return this.results.get(key) || '';
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  private getItemKey(item: QueueItem): string {
    const target = item.target;
    let targetKey = '';

    switch (target.type) {
      case 'scene':
        targetKey = `scene:${target.sceneId}`;
        break;
      case 'slide':
        targetKey = `slide:${target.sceneId}:${target.slideId}`;
        break;
      case 'page':
        targetKey = `page:${target.sceneId}:${target.pageId}`;
        break;
      case 'node':
        targetKey = `node:${target.sceneId}:${target.nodeId}`;
        break;
    }

    return `${targetKey}:${item.size}`;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getConcurrent(): number {
    return this.concurrent;
  }

  clear(): void {
    this.queue = [];
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    this.results.clear();
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
}

