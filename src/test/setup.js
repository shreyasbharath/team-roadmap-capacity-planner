/* global global */
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Set React 18 environment flag for testing
global.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
});
