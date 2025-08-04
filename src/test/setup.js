/* global global */
import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Set React 18 environment flag for testing
global.IS_REACT_ACT_ENVIRONMENT = true;

// Mock window.matchMedia for components that check for print mode
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {}
  })
});

// Mock URL methods for file operations
global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Navigation API to prevent JSDOM errors
Object.defineProperty(window, 'navigation', {
  writable: true,
  value: {
    navigate: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
});

// Suppress JSDOM navigation errors
// eslint-disable-next-line no-console
const originalConsoleError = console.error;
beforeEach(() => {
  // eslint-disable-next-line no-console
  console.error = (...args) => {
    const errorMessage = args[0]?.toString?.() ?? '';
    
    // Suppress specific JSDOM errors that don't affect test validity
    if (
      errorMessage.includes('Not implemented: navigation') ||
      errorMessage.includes('Not implemented: HTMLFormElement.prototype.submit') ||
      errorMessage.includes('window.__TAURI_IPC__ is not a function')
    ) {
      return; // Don't log these expected errors
    }
    
    // Log everything else normally
    originalConsoleError(...args);
  };
});

afterEach(() => {
  // eslint-disable-next-line no-console
  console.error = originalConsoleError;
  cleanup();
});
