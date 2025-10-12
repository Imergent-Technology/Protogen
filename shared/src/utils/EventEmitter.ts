/**
 * Generic Event Emitter
 * 
 * Simple, type-safe event emitter for system-level event handling.
 */

type EventListener<T = any> = (data: T) => void;

export class EventEmitter<TEvents extends Record<string, any> = Record<string, any>> {
  private eventListeners: Map<keyof TEvents, Set<EventListener>> = new Map();

  /**
   * Add an event listener
   */
  on<K extends keyof TEvents>(event: K, listener: EventListener<TEvents[K]>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener as EventListener);
  }

  /**
   * Remove an event listener
   */
  off<K extends keyof TEvents>(event: K, listener: EventListener<TEvents[K]>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener as EventListener);
    }
  }

  /**
   * Remove all listeners for an event (or all events if no event specified)
   */
  removeAllListeners(event?: keyof TEvents): void {
    if (event) {
      this.eventListeners.delete(event);
    } else {
      this.eventListeners.clear();
    }
  }

  /**
   * Emit an event
   */
  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for '${String(event)}':`, error);
        }
      });
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: keyof TEvents): number {
    const listeners = this.eventListeners.get(event);
    return listeners ? listeners.size : 0;
  }

  /**
   * Check if event has listeners
   */
  hasListeners(event: keyof TEvents): boolean {
    return this.listenerCount(event) > 0;
  }
}

