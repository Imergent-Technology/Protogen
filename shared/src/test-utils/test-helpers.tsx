/**
 * Test Helpers
 * 
 * Utility functions and wrappers for testing React components.
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock theme provider for tests
const MockThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-theme="light">{children}</div>;
};

/**
 * Custom render function that includes providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: MockThemeProvider, ...options });
}

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Create a mock event
 */
export function createMockEvent<T = Element>(type: string, properties?: Partial<Event>): Event {
  const event = new Event(type, { bubbles: true, cancelable: true, ...properties });
  return event;
}

/**
 * Create a mock custom event
 */
export function createMockCustomEvent<T = any>(
  type: string,
  detail?: T,
  properties?: Partial<CustomEvent>
): CustomEvent<T> {
  const event = new CustomEvent(type, {
    bubbles: true,
    cancelable: true,
    detail,
    ...properties,
  });
  return event;
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

