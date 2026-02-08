import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/vocab-master/',  // GitHub Pages base path
  plugins: [react()],
})
