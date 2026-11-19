import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Der erste Test je Datei lädt alle Inhalte (YAML + zod); parallel dauert das länger als 5 s.
    testTimeout: 20000,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
