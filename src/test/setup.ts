/**
 * Vitest Test Setup
 * 
 * Global setup for all tests
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import 'fake-indexeddb/auto';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
