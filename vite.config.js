import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const reactRoot = path.resolve(__dirname, 'node_modules/react');
const reactDomRoot = path.resolve(__dirname, 'node_modules/react-dom');

/** One React instance for app + R3F + ShaderGradient (avoids invalid hook call). */
const reactAliases = {
  react: reactRoot,
  'react-dom': reactDomRoot,
  'react/jsx-runtime': path.join(reactRoot, 'jsx-runtime.js'),
  'react/jsx-dev-runtime': path.join(reactRoot, 'jsx-dev-runtime.js'),
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'three'],
    alias: reactAliases,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'lottie-react',
      'lottie-web',
      '@react-three/fiber',
      '@react-three/drei',
      'three',
      'three-stdlib',
      'camera-controls',
    ],
    esbuildOptions: {
      alias: reactAliases,
    },
  },
});
