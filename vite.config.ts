import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vercel serves the app from the domain root; GitHub Pages serves it from
// https://<user>.github.io/speakdaily/. Vercel sets VERCEL=1 in its build environment.
export default defineConfig({
  base: process.env.VERCEL ? '/' : '/speakdaily/',
  plugins: [react()],
})
