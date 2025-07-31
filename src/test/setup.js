/* global global */
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
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

afterEach(() => {
  cleanup();
});
