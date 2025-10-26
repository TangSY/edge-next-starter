import { defineConfig } from 'vitest/config';
import path from 'path';
import os from 'os';

// Get CPU core count to optimize test performance
// Note: Only used in test environment (Node.js), not in Cloudflare Edge Runtime
const getCpuCount = () => {
  try {
    const cpus = typeof os.cpus === 'function' ? os.cpus() : [];
    const count = Array.isArray(cpus) ? cpus.length : Number(cpus) || 0;
    // Ensure minimum is 1 to avoid Tinypool conflicts
    return Math.max(1, count);
  } catch {
    // Fallback to single core in extreme cases; avoid conflicts with minThreads
    return 1;
  }
};

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Parallel test configuration
    // Note: Affects local tests and CI/CD only; not executed in Cloudflare Edge Runtime
    // maxConcurrency: maximum concurrent tests
    // pool: 'threads' uses thread pool (Node.js environment)
    // poolOptions.threads.maxThreads: maximum threads (based on CPU cores)
    maxConcurrency: 10,
    pool: 'threads',
    poolOptions: {
      threads: {
        // Use (CPU-1) as max threads, minimum 1; avoid conflicts with minThreads on single/unknown CPU
        maxThreads: Math.max(1, getCpuCount() - 1),
        minThreads: 1,
      },
    },
    // File-level parallelism
    fileParallelism: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/', 'scripts/', '**/*.config.*', '**/types/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
