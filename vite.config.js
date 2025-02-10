import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: 'iife'
      }
    },
  },
  esbuild: { legalComments: 'none' }
})