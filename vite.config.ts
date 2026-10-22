import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from https://<user>.github.io/speakdaily/ on GitHub Pages.
export default defineConfig({
  base: '/speakdaily/',
  plugins: [react()],
})
