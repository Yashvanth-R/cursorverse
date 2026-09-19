import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const pkg = fileURLToPath(new URL('./packages/cursorverse/src', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    // the demo consumes the library exactly as published consumers do, but from
    // source so it hot-reloads (array form: the /react entry must match first)
    alias: [
      { find: '@yashvanth/cursorverse/react', replacement: pkg + '/react.jsx' },
      { find: '@yashvanth/cursorverse', replacement: pkg + '/index.js' }
    ]
  }
})
