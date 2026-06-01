import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      
      include: [
        'src/services/**/*.ts', 
      ],
      exclude: [
        'src/**/*.spec.ts', 
        'src/**/*.test.ts', 
        'src/**/*.d.ts'
      ],
      
      thresholds: {
        lines: 1,
        functions: 1,
        branches: 1,
        statements: 1
      }
    },
  },
})