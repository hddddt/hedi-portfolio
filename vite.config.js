import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Pre-bundle Lottie so dev server dep optimization stays stable after installs / cache clears.
  optimizeDeps: {
    include: ['lottie-react', 'lottie-web'],
  },
});
