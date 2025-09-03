import { defineConfig } from 'vitest/config';
import Vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [Vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/']
    },
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist'],
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});