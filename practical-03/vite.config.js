import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for Practical 03 (API Integration and Data Rendering)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    open: true
  }
});
