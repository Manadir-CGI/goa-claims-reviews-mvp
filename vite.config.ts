import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` is relative so the built app works from a GitHub Pages project path.
export default defineConfig({
  plugins: [react()],
  base: './',
});
