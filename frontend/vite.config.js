import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo, /api se reenvía al backend Express (evita CORS local).
    proxy: { '/api': process.env.VITE_DEV_BACKEND ?? 'http://localhost:3000' },
  },
});
