import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@cloudflare/next-on-pages', () => ({
  getRequestContext: () => ({
    env: {},
    request: null,
    waitUntil: () => undefined,
  }),
}));

// Clean up React components after each test
afterEach(() => {
  cleanup();
});
