import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for Practical 02 (State Management & Routing)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true
  }
});
