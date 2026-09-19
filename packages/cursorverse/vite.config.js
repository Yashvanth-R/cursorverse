import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  build: {
    lib: {
      entry: {
        cursorverse: 'src/index.js',
        react: 'src/react.jsx'
      },
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // never bundle React — consumers bring their own
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: { exports: 'named' }
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2019'
  }
})
